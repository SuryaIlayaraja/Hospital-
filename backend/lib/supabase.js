const { createClient } = require("@supabase/supabase-js");

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.warn(
    "⚠️  SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing. Set them in backend/.env"
  );
}

const supabase =
  url && serviceKey
    ? createClient(url, serviceKey, {
        auth: { persistSession: false },
      })
    : null;

function getSupabase() {
  if (!supabase) {
    throw new Error(
      "Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env"
    );
  }
  return supabase;
}

module.exports = { getSupabase, supabase };
