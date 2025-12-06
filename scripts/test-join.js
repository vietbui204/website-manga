
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function testJoin() {
    console.log('Testing join query...');
    const { data, error } = await supabase
        .from('mangas')
        .select('title, manga_genres(genres(name, slug))')
        .limit(1);

    if (error) {
        console.log('Join Error:', error.message);
    } else {
        console.log('Join Success. Data:', JSON.stringify(data, null, 2));
    }
}

testJoin();
