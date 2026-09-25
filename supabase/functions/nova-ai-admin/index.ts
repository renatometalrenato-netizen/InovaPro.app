
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
const supabase = createClient(SUPABASE_URL, adminKey);

const cors = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "authorization, x-client-info, apikey, content-type",
  "access-control-allow-methods": "GET, POST, OPTIONS",
  "content-type": "application/json; charset=utf-8",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: cors });
}

async function requireAdmin(req: Request) {
  const auth = req.headers.get("authorization") || "";
  const token = auth.replace(/^Bearer\s+/i, "");
  if (!token) return { error: json({ error: "Unauthorized" }, 401) };

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) return { error: json({ error: "Unauthorized" }, 401) };

  const { data: admin, error: adminError } = await supabase
    .from("nova_admin_users")
    .select("user_id,role,is_active")
    .eq("user_id", data.user.id)
    .eq("is_active", true)
    .maybeSingle();

  if (adminError || !admin) return { error: json({ error: "Forbidden" }, 403) };
  return { user: data.user, admin };
}

async function audit(userId: string, action: string, entityType?: string, entityId?: string, payload: Record<string, unknown> = {}) {
  await supabase.from("nova_admin_audit").insert({
    user_id: userId,
    action,
    entity_type: entityType || null,
    entity_id: entityId || null,
    payload,
  });
}

async function getSummary() {
  const [
    contacts,
    openConversations,
    qualified,
    opportunities,
    handoffs,
    dueFollowups,
  ] = await Promise.all([
    supabase.from("nova_contacts").select("id", { count: "exact", head: true }),
    supabase.from("nova_conversations").select("id", { count: "exact", head: true }).eq("status", "open"),
    supabase.from("nova_leads").select("id", { count: "exact", head: true }).eq("qualification_status", "qualified"),
    supabase.from("nova_leads").select("id", { count: "exact", head: true }).eq("qualification_status", "opportunity"),
    supabase.from("nova_human_handoffs").select("id", { count: "exact", head: true }).in("status", ["open", "accepted"]),
    supabase.from("nova_followups").select("id", { count: "exact", head: true }).eq("status", "pending").lte("scheduled_for", new Date().toISOString()),
  ]);

  return {
    contacts: contacts.count || 0,
    open_conversations: openConversations.count || 0,
    qualified_leads: qualified.count || 0,
    opportunities: opportunities.count || 0,
    active_handoffs: handoffs.count || 0,
    due_followups: dueFollowups.count || 0,
    overdue_followups: dueFollowups.count || 0,
  };
}

async function listLeads(status?: string | null, limit = 50) {
  let q = supabase
    .from("nova_leads")
    .select("id,contact_id,business_name,project_stage,main_problem,objective,current_channels,current_tools,approximate_lead_volume,urgency,qualification_score,qualification_status,next_action,notes,created_at,updated_at,contact:nova_contacts(id,display_name,phone_e164,instagram_username,company,segment,city)")
    .order("updated_at", { ascending: false })
    .limit(Math.min(Math.max(limit, 1), 100));

  if (status) q = q.eq("qualification_status", status);
  const { data, error } = await q;
  if (error) throw error;
  return (data || []).map((lead: any) => ({
    ...lead,
    name: lead.business_name || lead.contact?.display_name || null,
    company: lead.contact?.company || lead.business_name || null,
    score: lead.qualification_score ?? null,
    status: lead.qualification_status ?? null,
    channel: Array.isArray(lead.current_channels) ? lead.current_channels[0] || null : null,
  }));
}

async function listConversations(status?: string | null, limit = 50) {
  let q = supabase
    .from("nova_conversations")
    .select("id,contact_id,channel,status,lead_stage,summary,assigned_to,last_message_at,created_at,updated_at,contact:nova_contacts(id,display_name,phone_e164,instagram_username,company,segment,city)")
    .order("last_message_at", { ascending: false })
    .limit(Math.min(Math.max(limit, 1), 100));
  if (status) q = q.eq("status", status);
  const { data, error } = await q;
  if (error) throw error;
  return (data || []).map((c: any) => {
    const contact = c.contact || {};
    const identifier = contact.instagram_username
      ? "@" + contact.instagram_username
      : contact.phone_e164
        ? String(contact.phone_e164).replace(/.(?=.{4})/g, "•")
        : null;
    return {
      ...c,
      stage: c.lead_stage,
      contact_name: contact.display_name || contact.company || null,
      contact_identifier: identifier,
      contact: {
        ...contact,
        name: contact.display_name || contact.company || null,
        identifier,
        channel: c.channel,
      },
    };
  });
}

async function conversationDetail(conversationId: string) {
  const { data: conversation, error } = await supabase
    .from("nova_conversations")
    .select("id,contact_id,channel,status,lead_stage,summary,assigned_to,last_message_at,metadata,created_at,updated_at,contact:nova_contacts(id,display_name,phone_e164,instagram_username,company,segment,city,metadata)")
    .eq("id", conversationId)
    .single();
  if (error) throw error;

  const [{ data: messages, error: msgErr }, { data: handoffs, error: handErr }] = await Promise.all([
    supabase.from("nova_messages")
      .select("id,direction,content_type,body,created_at")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .limit(200),
    supabase.from("nova_human_handoffs")
      .select("id,reason,priority,status,assigned_to,context_summary,opened_at,accepted_at,resolved_at")
      .eq("conversation_id", conversationId)
      .order("opened_at", { ascending: false }),
  ]);

  if (msgErr) throw msgErr;
  if (handErr) throw handErr;

  const { data: lead } = await supabase
    .from("nova_leads")
    .select("*")
    .eq("contact_id", conversation.contact_id)
    .maybeSingle();

  const contact: any = (conversation as any).contact || {};
  const identifier = contact.instagram_username
    ? "@" + contact.instagram_username
    : contact.phone_e164
      ? String(contact.phone_e164).replace(/.(?=.{4})/g, "•")
      : null;

  const conversationCompat = {
    ...conversation,
    stage: (conversation as any).lead_stage,
    contact_name: contact.display_name || contact.company || null,
    contact_identifier: identifier,
    contact: {
      ...contact,
      name: contact.display_name || contact.company || null,
      identifier,
      channel: (conversation as any).channel,
    },
  };

  const leadCompat = lead
    ? {
        ...lead,
        name: lead.business_name || contact.display_name || null,
        company: contact.company || lead.business_name || null,
        score: lead.qualification_score ?? null,
        status: lead.qualification_status ?? null,
        channel: Array.isArray(lead.current_channels) ? lead.current_channels[0] || null : null,
      }
    : null;

  const messageCompat = (messages || []).map((m: any) => ({
    ...m,
    content: m.body,
    role: m.direction === "outbound" ? "assistant" : "user",
  }));

  return { conversation: conversationCompat, lead: leadCompat, messages: messageCompat, handoffs: handoffs || [] };
}

async function listHandoffs(status?: string | null, limit = 50) {
  let q = supabase
    .from("nova_human_handoffs")
    .select("id,contact_id,conversation_id,reason,priority,status,assigned_to,context_summary,opened_at,accepted_at,resolved_at,contact:nova_contacts(id,display_name,phone_e164,instagram_username,company),conversation:nova_conversations(id,channel,lead_stage,last_message_at)")
    .order("opened_at", { ascending: false })
    .limit(Math.min(Math.max(limit, 1), 100));
  if (status) q = q.eq("status", status);
  const { data, error } = await q;
  if (error) throw error;
  return (data || []).map((h: any) => ({
    ...h,
    channel: h.conversation?.channel || null,
    created_at: h.opened_at,
  }));
}

async function updateHandoff(userId: string, body: any) {
  const id = String(body.id || "");
  const status = String(body.status || "");
  if (!id || !["accepted","resolved","cancelled"].includes(status)) {
    throw new Error("Invalid handoff update");
  }

  const patch: Record<string, unknown> = { status };
  if (status === "accepted") {
    patch.accepted_at = new Date().toISOString();
    patch.assigned_to = body.assigned_to || userId;
  }
  if (status === "resolved") patch.resolved_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("nova_human_handoffs")
    .update(patch)
    .eq("id", id)
    .select("id,conversation_id,status,assigned_to")
    .single();
  if (error) throw error;

  if (status === "accepted") {
    await supabase.from("nova_conversations").update({
      status: "handoff",
      assigned_to: body.assigned_to || userId,
      ai_enabled: false,
      handoff_status: "HUMAN_ACTIVE",
    }).eq("id", data.conversation_id);
  } else if (status === "resolved" || status === "cancelled") {
    await supabase.from("nova_conversations").update({
      status: "open",
      assigned_to: null,
      ai_enabled: true,
      handoff_status: "AI_ACTIVE",
    }).eq("id", data.conversation_id);
  }

  await audit(userId, "handoff_update", "nova_human_handoffs", id, { status });
  return data;
}


async function sendViaMeta(channel: "instagram" | "whatsapp", recipient: string, body: string) {
  const graphVersion = Deno.env.get("META_GRAPH_API_VERSION");
  if (!graphVersion) return { sent: false, blocked: "META_GRAPH_API_VERSION not configured" };

  let endpoint = "";
  let token = "";
  let payload: Record<string, unknown> = {};

  if (channel === "whatsapp") {
    const phoneId = Deno.env.get("META_WHATSAPP_PHONE_NUMBER_ID");
    token = Deno.env.get("META_WHATSAPP_TOKEN") || "";
    if (!phoneId || !token) return { sent: false, blocked: "WhatsApp credentials not configured" };
    endpoint = "https://graph.facebook.com/" + graphVersion + "/" + phoneId + "/messages";
    payload = {
      messaging_product: "whatsapp",
      to: recipient.replace(/\D/g, ""),
      type: "text",
      text: { body },
    };
  } else {
    const igId = Deno.env.get("META_INSTAGRAM_ACCOUNT_ID");
    token = Deno.env.get("META_INSTAGRAM_ACCESS_TOKEN") || Deno.env.get("META_PAGE_ACCESS_TOKEN") || "";
    if (!igId || !token) return { sent: false, blocked: "Instagram credentials not configured" };
    endpoint = "https://graph.facebook.com/" + graphVersion + "/" + igId + "/messages";
    payload = { recipient: { id: recipient }, message: { text: body } };
  }

  const resp = await fetch(endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: "Bearer " + token,
    },
    body: JSON.stringify(payload),
  });
  const raw = await resp.text();
  if (!resp.ok) return { sent: false, error: "Meta " + resp.status + ": " + raw.slice(0, 300) };

  let providerMessageId: string | null = null;
  try {
    const out = JSON.parse(raw);
    providerMessageId = out?.messages?.[0]?.id || out?.message_id || out?.recipient_id || null;
  } catch (_) {}
  return { sent: true, providerMessageId };
}

async function sendHumanMessage(userId: string, body: any) {
  const conversationId = String(body.conversation_id || "");
  const text = String(body.body || "").trim();
  if (!conversationId || !text) throw new Error("conversation_id and body are required");
  if (text.length > 3000) throw new Error("Message too long");

  const { data: conversation, error } = await supabase
    .from("nova_conversations")
    .select("id,contact_id,channel,metadata,status")
    .eq("id", conversationId)
    .single();
  if (error) throw error;
  if (!["instagram","whatsapp","web"].includes(conversation.channel)) throw new Error("Unsupported channel");

  let sent: { sent: boolean; providerMessageId?: string | null; blocked?: string; error?: string; local?: boolean };

  if (conversation.channel === "web") {
    sent = { sent: true, providerMessageId: null, local: true };
  } else {
    const { data: contact } = await supabase
      .from("nova_contacts")
      .select("phone_e164,instagram_user_id")
      .eq("id", conversation.contact_id)
      .single();

    const recipient = conversation.channel === "whatsapp"
      ? (contact?.phone_e164 || conversation.metadata?.sender_external_id || "")
      : (contact?.instagram_user_id || conversation.metadata?.sender_external_id || "");

    if (!recipient) throw new Error("Recipient unavailable");
    sent = await sendViaMeta(conversation.channel, recipient, text);
    if (!sent.sent) {
      await audit(userId, "human_message_blocked", "nova_conversations", conversationId, {
        reason: sent.blocked || sent.error || "unknown",
      });
      return sent;
    }
  }

  await supabase.from("nova_messages").insert({
    conversation_id: conversationId,
    channel: conversation.channel,
    external_message_id: sent.providerMessageId || null,
    direction: "outbound",
    sender_external_id: "human:" + userId,
    content_type: "text",
    body: text,
    role: "ASSISTANT",
    delivery_status: "delivered",
    payload: { source: "nova-admin", human: true, local: sent.local || false },
  });

  await supabase.from("nova_conversations").update({
    last_message_at: new Date().toISOString(),
    assigned_to: userId,
    status: "handoff",
    ai_enabled: false,
    handoff_status: "HUMAN_ACTIVE",
  }).eq("id", conversationId);

  await audit(userId, "human_message_sent", "nova_conversations", conversationId, {
    channel: conversation.channel,
  });
  return sent;
}

async function processDueFollowups(userId: string, limit = 20) {
  const now = new Date().toISOString();
  const { data: rows, error } = await supabase
    .from("nova_followups")
    .select("id,contact_id,conversation_id,channel,scheduled_for,message_template,attempt_count")
    .eq("status", "pending")
    .lte("scheduled_for", now)
    .order("scheduled_for", { ascending: true })
    .limit(Math.min(Math.max(limit, 1), 50));
  if (error) throw error;

  const results: any[] = [];
  for (const row of rows || []) {
    if (!row.conversation_id) {
      await supabase.from("nova_followups").update({
        status: "failed",
        last_error: "Conversation unavailable",
        attempt_count: row.attempt_count + 1,
      }).eq("id", row.id);
      results.push({ id: row.id, sent: false, reason: "conversation_unavailable" });
      continue;
    }

    const { data: handoff } = await supabase
      .from("nova_human_handoffs")
      .select("id")
      .eq("conversation_id", row.conversation_id)
      .in("status", ["open","accepted"])
      .maybeSingle();
    if (handoff) {
      await supabase.from("nova_followups").update({
        status: "cancelled",
        reason: "Atendimento humano ativo",
      }).eq("id", row.id);
      results.push({ id: row.id, sent: false, reason: "human_handoff_active" });
      continue;
    }

    const { data: lastInbound } = await supabase
      .from("nova_messages")
      .select("created_at")
      .eq("conversation_id", row.conversation_id)
      .eq("direction", "inbound")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!lastInbound?.created_at) {
      await supabase.from("nova_followups").update({
        status: "cancelled",
        reason: "Sem mensagem recebida para referência",
      }).eq("id", row.id);
      results.push({ id: row.id, sent: false, reason: "no_inbound_reference" });
      continue;
    }

    const ageMs = Date.now() - new Date(lastInbound.created_at).getTime();
    if (ageMs > 23 * 60 * 60 * 1000) {
      await supabase.from("nova_followups").update({
        status: "failed",
        last_error: "Janela segura de atendimento expirou; requer política/template do provedor",
        attempt_count: row.attempt_count + 1,
      }).eq("id", row.id);
      results.push({ id: row.id, sent: false, reason: "provider_window_expired" });
      continue;
    }

    const { data: conversation } = await supabase
      .from("nova_conversations")
      .select("id,channel,metadata,contact_id")
      .eq("id", row.conversation_id)
      .single();
    const { data: contact } = await supabase
      .from("nova_contacts")
      .select("phone_e164,instagram_user_id")
      .eq("id", row.contact_id)
      .single();

    const recipient = row.channel === "whatsapp"
      ? (contact?.phone_e164 || conversation?.metadata?.sender_external_id || "")
      : (contact?.instagram_user_id || conversation?.metadata?.sender_external_id || "");
    const text = row.message_template || "Oi! Quer continuar seu atendimento com a Nova AI?";

    if (!recipient) {
      await supabase.from("nova_followups").update({
        status: "failed",
        last_error: "Recipient unavailable",
        attempt_count: row.attempt_count + 1,
      }).eq("id", row.id);
      results.push({ id: row.id, sent: false, reason: "recipient_unavailable" });
      continue;
    }

    const sent = await sendViaMeta(row.channel, recipient, text);
    if (sent.blocked) {
      results.push({ id: row.id, sent: false, reason: "channel_not_configured" });
      continue;
    }

    if (!sent.sent) {
      await supabase.from("nova_followups").update({
        status: "failed",
        last_error: sent.error || "Provider send failed",
        attempt_count: row.attempt_count + 1,
      }).eq("id", row.id);
      results.push({ id: row.id, sent: false, reason: "provider_error" });
      continue;
    }

    await supabase.from("nova_messages").insert({
      conversation_id: row.conversation_id,
      channel: row.channel,
      external_message_id: sent.providerMessageId || null,
      direction: "outbound",
      sender_external_id: "nova-ai-followup",
      content_type: "text",
      body: text,
      payload: { source: "nova-followup" },
    });

    await supabase.from("nova_followups").update({
      status: "sent",
      attempt_count: row.attempt_count + 1,
      last_error: null,
    }).eq("id", row.id);

    results.push({ id: row.id, sent: true });
  }

  await audit(userId, "process_due_followups", "nova_followups", undefined, {
    checked: rows?.length || 0,
    sent: results.filter((x) => x.sent).length,
  });
  return results;
}

async function updateLead(userId: string, body: any) {
  const id = String(body.id || "");
  if (!id) throw new Error("Lead id required");

  const allowed = ["business_name","project_stage","main_problem","objective","urgency","qualification_status","next_action","notes"];
  const patch: Record<string, unknown> = {};
  for (const key of allowed) {
    if (Object.prototype.hasOwnProperty.call(body, key)) patch[key] = body[key];
  }

  const { data, error } = await supabase
    .from("nova_leads")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  await audit(userId, "lead_update", "nova_leads", id, { fields: Object.keys(patch) });
  return data;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });

  const access = await requireAdmin(req);
  if ("error" in access) return access.error;
  const userId = access.user!.id;

  try {
    if (req.method === "GET") {
      const url = new URL(req.url);
      const action = url.searchParams.get("action") || "summary";
      const status = url.searchParams.get("status");
      const limit = Number(url.searchParams.get("limit") || 50);

      if (action === "summary") return json(await getSummary());
      if (action === "leads") return json({ data: await listLeads(status, limit) });
      if (action === "conversations") return json({ data: await listConversations(status, limit) });
      if (action === "conversation") {
        const id = url.searchParams.get("id");
        if (!id) return json({ error: "Conversation id required" }, 400);
        return json(await conversationDetail(id));
      }
      if (action === "handoffs") return json({ data: await listHandoffs(status, limit) });
      return json({ error: "Unknown action" }, 400);
    }

    if (req.method === "POST") {
      const body = await req.json();
      const action = String(body.action || "");
      if (action === "summary") return json(await getSummary());
      if (action === "leads") return json({ data: await listLeads(body.status || null, Number(body.limit || 50)) });
      if (action === "conversations") return json({ data: await listConversations(body.status || null, Number(body.limit || 50)) });
      if (action === "conversation") {
        const id = String(body.id || "");
        if (!id) return json({ error: "Conversation id required" }, 400);
        return json(await conversationDetail(id));
      }
      if (action === "handoffs") return json({ data: await listHandoffs(body.status || null, Number(body.limit || 50)) });
      if (action === "update_handoff") return json({ data: await updateHandoff(userId, body) });
      if (action === "update_lead") return json({ data: await updateLead(userId, body) });
      if (action === "send_message") return json({ data: await sendHumanMessage(userId, body) });
      if (action === "process_followups") return json({ data: await processDueFollowups(userId, Number(body.limit || 20)) });
      return json({ error: "Unknown action" }, 400);
    }

    return json({ error: "Method not allowed" }, 405);
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : String(e) }, 500);
  }
});
