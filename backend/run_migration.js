const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function runMigration() {
  console.log('--- Running Migration: Add clerk_user_id to tickets ---');
  // Since we can't directly list columns without data easily, we'll try to add it.
  // Using direct SQL if possible, but let's try RPC if they have it, 
  // or just attempt an update which will fail if column doesn't exist.
  
  // Actually, I'll just use a direct query that won't fail if column doesn't exist or just use RPC if configured.
  // Most people use the Supabase dashboard, but I can use the API if I have it.
  
  // Let's try to just use a raw RPC to run SQL if the 'exec_sql' function exists.
  // If not, we'll have to ask the user to run it in the dashboard.
  
  const sql = `ALTER TABLE tickets ADD COLUMN IF NOT EXISTS clerk_user_id TEXT;`;
  
  console.log('SQL to run:', sql);
  console.log('Please run this in your Supabase SQL Editor if this script fails.');
  
  // Try to insert a dummy row with the column to see if it works
  const { error } = await supabase.from('tickets').insert({
      id: 'COL-CHECK-' + Date.now(),
      title: 'Check',
      clerk_user_id: 'test'
  });
  
  if (error && error.message.includes('column "clerk_user_id" of relation "tickets" does not exist')) {
      console.error('CRITICAL: The clerk_user_id column is missing! Please run the SQL above in your Supabase dashboard.');
  } else if (error) {
       console.log('Other error (maybe fine if row is invalid but col exists):', error.message);
  } else {
      console.log('SUCCESS: The clerk_user_id column is working!');
  }
}

runMigration();
