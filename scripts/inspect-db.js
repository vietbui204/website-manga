
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function inspect() {
    console.log('Inspecting mangas table columns...');
    const { data, error } = await supabase.from('mangas').select('*').limit(1);
    if (error) console.log('Error:', error.message);
    else if (data && data.length > 0) {
        console.log('Columns:');
        Object.keys(data[0]).forEach(k => console.log(`- ${k}`));
    } else {
        console.log('Table empty or no access.');
    }
}

inspect();
