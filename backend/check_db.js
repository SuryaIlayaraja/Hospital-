const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkTable() {
  console.log('--- Checking Testimonials ---');
  const { data: tData, error: tError } = await supabase.from('testimonials').select('*').limit(1);
  if (tError) {
    console.error('Testimonials table error:', tError.message);
  } else {
    console.log('Testimonials table exists. Count:', tData.length);
  }

  console.log('\n--- Checking Hospital Settings ---');
  const { data: sData, error: sError } = await supabase.from('hospital_settings').select('*').limit(1).maybeSingle();
  if (sError) {
    console.error('Hospital Settings table error:', sError.message);
  } else {
    console.log('Hospital Settings table exists.');
    console.log('Current Columns:', Object.keys(sData || {}));
    if (sData) {
        console.log('Stats values:', {
            years: sData.years_experience,
            doctors: sData.expert_doctors,
            procedures: sData.successful_procedures,
            lives: sData.lives_touched
        });
    }
  }
}

checkTable();
