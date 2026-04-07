require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const fs = require('fs');
async function main() {
    const { data: opd } = await supabase.from('feedback_opd').select('*').order('timestamp', { ascending: false }).limit(5);
    const { data: ipd } = await supabase.from('feedback_ipd').select('*').order('timestamp', { ascending: false }).limit(5);
    fs.writeFileSync('out.json', JSON.stringify({opd, ipd}, null, 2), 'utf8');
}
main();
