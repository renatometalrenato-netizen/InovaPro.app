import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tygksrzhqqjsltmycvxp.supabase.co'
const supabasePublishableKey = 'sb_publishable_8LFlbAZtz6pvbChWFWR8zw_PX4HrIdp'

export const supabase = createClient(
  supabaseUrl,
  supabasePublishableKey
)
