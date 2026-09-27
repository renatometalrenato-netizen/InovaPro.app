import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const secretKeysRaw = Deno.env.get("SUPABASE_SECRET_KEYS");
const serviceRoleName = ["SUPABASE", "SERVICE", "ROLE", "KEY"].join("_");
let adminKey = Deno.env.get(serviceRoleName) || "";

if (!adminKey && secretKeysRaw) {
  try {
    const parsed = JSON.parse(secretKeysRaw);
    adminKey = String(parsed.default || Object.values(parsed)[0] || "");
  } catch {
    adminKey = secretKeysRaw;
  }
}

const admin = createClient(SUPABASE_URL, adminKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const cors = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "authorization, x-client-info, apikey, content-type",
  "access-control-allow-methods": "POST, OPTIONS",
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: cors });
}

async function requireUser(req: Request) {
  const authorization = req.headers.get("authorization") || "";
  const jwt = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!jwt) return { error: json({ ok: false, error: "Authentication required" }, 401) };

  const { data, error } = await admin.auth.getUser(jwt);
  if (error || !data.user) {
    return { error: json({ ok: false, error: "Invalid session" }, 401) };
  }

  return { user: data.user };
}

async function graphJson(url: string, init: RequestInit = {}) {
  const response = await fetch(url, init);
  const text = await response.text();
  let body: any = null;
  try {
    body = JSON.parse(text);
  } catch {
    body = { raw: text };
  }

  if (!response.ok) {
    throw new Error(body?.error?.message || ("Meta Graph API " + response.status));
  }
  return body;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ ok: false, error: "Method not allowed" }, 405);

  const access = await requireUser(req);
  if ("error" in access) return access.error;
  const user = access.user!;

  let payload: any = {};
  try {
    payload = await req.json();
  } catch {
    return json({ ok: false, error: "Invalid JSON" }, 400);
  }

  const action = String(payload?.action || "connect");
  const appId = Deno.env.get("META_APP_ID") || "";
  const appSecret = Deno.env.get("META_APP_SECRET") || "";
  const configId =
    Deno.env.get("META_WHATSAPP_CONFIG_ID") ||
    Deno.env.get("META_EMBEDDED_SIGNUP_CONFIG_ID") ||
    "";
  const graphVersion = Deno.env.get("META_GRAPH_API_VERSION") || "v25.0";

  if (action === "config") {
    const missing = [
      !appId ? "META_APP_ID" : null,
      !configId ? "META_WHATSAPP_CONFIG_ID" : null,
    ].filter(Boolean);

    return json({
      ok: true,
      configured: missing.length === 0,
      app_id: appId || null,
      config_id: configId || null,
      graph_version: graphVersion,
      missing,
    });
  }

  if (action === "status") {
    const { data, error } = await admin
      .from("nova_meta_connections")
      .select("phone_e164,connected_at,metadata,updated_at")
      .eq("user_id", user.id)
      .eq("channel", "whatsapp")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) return json({ ok: false, error: error.message }, 500);

    return json({
      ok: true,
      connected: Boolean(data),
      phone: data?.phone_e164 || null,
      verified_name: data?.metadata?.verified_name || null,
      status: data?.metadata?.status || null,
      quality_rating: data?.metadata?.quality_rating || null,
      connected_at: data?.connected_at || null,
    });
  }

  if (action !== "connect") {
    return json({ ok: false, error: "Unsupported action" }, 400);
  }

  const code = String(payload?.code || "").trim();
  const sessionInfo = payload?.sessionInfo && typeof payload.sessionInfo === "object"
    ? payload.sessionInfo
    : {};

  const wabaId = String(
    sessionInfo?.waba_id ||
      sessionInfo?.wabaId ||
      payload?.waba_id ||
      payload?.wabaId ||
      "",
  ).trim();

  if (!code) return json({ ok: false, error: "Embedded Signup code is required" }, 400);

  if (!appId || !appSecret) {
    return json({
      ok: false,
      error: "Meta app credentials are not configured on the server",
      missing: {
        META_APP_ID: !appId,
        META_APP_SECRET: !appSecret,
      },
    }, 503);
  }

  try {
    const tokenUrl = new URL("https://graph.facebook.com/" + graphVersion + "/oauth/access_token");
    tokenUrl.searchParams.set("client_id", appId);
    tokenUrl.searchParams.set("client_secret", appSecret);
    tokenUrl.searchParams.set("code", code);

    const tokenData = await graphJson(tokenUrl.toString());
    const accessToken = String(tokenData?.access_token || "");
    if (!accessToken) throw new Error("Meta did not return an access token");

    let resolvedWabaId = wabaId;

    if (!resolvedWabaId) {
      const debugUrl = new URL("https://graph.facebook.com/" + graphVersion + "/debug_token");
      debugUrl.searchParams.set("input_token", accessToken);

      const debug = await graphJson(debugUrl.toString(), {
        headers: { authorization: "Bearer " + appId + "|" + appSecret },
      });

      const granular = Array.isArray(debug?.data?.granular_scopes)
        ? debug.data.granular_scopes
        : [];

      for (const scope of granular) {
        if (
          scope?.scope === "whatsapp_business_management" &&
          Array.isArray(scope?.target_ids) &&
          scope.target_ids[0]
        ) {
          resolvedWabaId = String(scope.target_ids[0]);
          break;
        }
      }
    }

    if (!resolvedWabaId) {
      throw new Error("WhatsApp Business Account ID was not returned by Embedded Signup");
    }

    await graphJson(
      "https://graph.facebook.com/" +
        graphVersion +
        "/" +
        encodeURIComponent(resolvedWabaId) +
        "/subscribed_apps",
      {
        method: "POST",
        headers: { authorization: "Bearer " + accessToken },
      },
    );

    const numbers = await graphJson(
      "https://graph.facebook.com/" +
        graphVersion +
        "/" +
        encodeURIComponent(resolvedWabaId) +
        "/phone_numbers?fields=id,display_phone_number,verified_name,status,quality_rating",
      { headers: { authorization: "Bearer " + accessToken } },
    );

    const list = Array.isArray(numbers?.data) ? numbers.data : [];
    const hintedPhoneId = String(
      sessionInfo?.phone_number_id ||
        sessionInfo?.phoneNumberId ||
        payload?.phone_number_id ||
        payload?.phoneNumberId ||
        "",
    ).trim();

    const phone =
      list.find((item: any) => String(item?.id) === hintedPhoneId) ||
      list[0] ||
      null;

    const record = {
      user_id: user.id,
      provider: "meta",
      channel: "whatsapp",
      mode: "coexistence",
      waba_id: resolvedWabaId,
      phone_number_id: phone?.id ? String(phone.id) : null,
      phone_e164: phone?.display_phone_number ? String(phone.display_phone_number) : null,
      access_token: accessToken,
      token_type: String(tokenData?.token_type || "bearer"),
      connected_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      metadata: {
        embedded_signup: true,
        feature_type: "whatsapp_business_app_onboarding",
        session_info: sessionInfo,
        verified_name: phone?.verified_name || null,
        status: phone?.status || null,
        quality_rating: phone?.quality_rating || null,
      },
    };

    const { data: existing, error: existingError } = await admin
      .from("nova_meta_connections")
      .select("id")
      .eq("user_id", user.id)
      .eq("channel", "whatsapp")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingError) throw existingError;

    const saveQuery = existing?.id
      ? admin.from("nova_meta_connections").update(record).eq("id", existing.id)
      : admin.from("nova_meta_connections").insert(record);

    const { error: saveError } = await saveQuery;
    if (saveError) throw saveError;

    return json({
      ok: true,
      connected: true,
      waba_id: resolvedWabaId,
      phone_number_id: record.phone_number_id,
      phone: record.phone_e164,
      verified_name: phone?.verified_name || null,
      status: phone?.status || null,
    });
  } catch (error) {
    console.error("nova-whatsapp-onboarding", error);
    return json({
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    }, 400);
  }
});
