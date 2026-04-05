const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkTicketsTable() {
  const { data, error } = await supabase.from('tickets').select('*').limit(1).maybeSingle();
  if (error) {
    console.error('ERROR:', error.message);
  } else {
    // Collect columns from any existing row
    const cols = data ? Object.keys(data) : ['No data'];
    console.log('TICKET_COLUMNS_START');
    cols.forEach(c => console.log(c));
    console.log('TICKET_COLUMNS_END');
  }
}

checkTicketsTable();
