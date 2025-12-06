
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

async function check() {
    const supabase = createClient(URL, SERVICE);

    console.log('--- VERIFYING READING_HISTORY TABLE ---');
    const { data, error } = await supabase.from('reading_history').select('*').limit(1);

    if (error) {
        console.error('Error:', error.message);
        console.log('Status: FAILED. Table might be missing or permission denied.');
    } else {
        console.log('Status: SUCCESS. Table exists.');
        console.log('Data sample:', data);
    }
}
check();
