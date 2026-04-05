const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkTicketsTable() {
  console.log('--- Checking Tickets Table ---');
  const { data, error } = await supabase.from('tickets').select('*').limit(1).maybeSingle();
  if (error) {
    console.error('Tickets table error:', error.message);
  } else if (data) {
    console.log('Columns in tickets table:', Object.keys(data));
  } else {
     // If no rows, we can't see columns this way, but let's try a different trick if needed.
     console.log('Tickets table exists but is empty.');
     const { data: cols, error: colError } = await supabase.rpc('get_table_columns', { table_name: 'tickets' });
     if (colError) {
         console.log('Cannot list empty table columns via SELECT, please check migrations.');
     } else {
         console.log('Cols:', cols);
     }
  }
}

checkTicketsTable();
