
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

async function testViews() {
    console.log('--- TESTING VIEW COUNT ---');
    const supabase = createClient(URL, SERVICE);

    // 1. Get a test manga
    const { data: manga, error: err } = await supabase.from('mangas').select('id, title, views').limit(1).single();
    if (err || !manga) {
        console.error('Failed to get manga:', err);
        return;
    }

    console.log(`Manga: ${manga.title} (ID: ${manga.id})`);
    console.log(`Initial Views: ${manga.views}`);

    // 2. Increment View via RPC
    console.log('Calling increment_view...');
    const { error: rpcErr } = await supabase.rpc('increment_view', { manga_id: manga.id });

    if (rpcErr) {
        console.error('RPC Failed:', rpcErr);
        return;
    }

    // 3. Verify increase
    const { data: updatedManga } = await supabase.from('mangas').select('views').eq('id', manga.id).single();
    console.log(`New Views: ${updatedManga.views}`);

    if (updatedManga.views === (manga.views || 0) + 1) {
        console.log('SUCCESS: Views incremented correctly.');
    } else {
        console.log('FAILURE: Views did not increment.');
    }
}

testViews();
