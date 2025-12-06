
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
    console.log('Verifying genres for Absolute Duo...');

    const { data: genres } = await supabase.from('genres').select('*').limit(5);
    console.log('Genres sample:', genres ? genres.map(g => g.name) : 'None');

    const { data: mg } = await supabase.from('manga_genres').select('*').limit(5);
    console.log('Manga_Genres sample:', mg);

    if (mg && mg.length > 0) {
        console.log('Link exists. Proceeding to implementation.');
    } else {
        console.log('WARNING: Manga_Genres table is empty. Seed might not have run or failed.');
    }
}

inspect();
