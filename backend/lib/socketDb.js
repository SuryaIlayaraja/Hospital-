const { getSupabase } = require("./supabase");
const { chatMessageRowToClient } = require("./mappers");

async function findTicketById(ticketId) {
  const supabase = getSupabase();
  const { data } = await supabase.from("tickets").select("*").eq("id", ticketId).maybeSingle();
  return data;
}

async function insertChatMessage(row) {
  const supabase = getSupabase();
  const { data, error } = await supabase.from("chat_messages").insert(row).select("*").single();
  if (error) throw error;
  return chatMessageRowToClient(data);
}

async function markAllMessagesRead(ticketId, field, isoTime) {
  const supabase = getSupabase();
  const { data: rows } = await supabase
    .from("chat_messages")
    .select("id, read_by")
    .eq("ticket_id", ticketId);

  for (const r of rows || []) {
    const rb = { ...(r.read_by || {}) };
    rb[field] = isoTime;
    await supabase.from("chat_messages").update({ read_by: rb }).eq("id", r.id);
  }
}

module.exports = { findTicketById, insertChatMessage, markAllMessagesRead };
