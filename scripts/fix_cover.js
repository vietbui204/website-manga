require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY
);

async function fix() {
    console.log('Fixing cover_url for absolute-duo...');

    // 1. Check current
    const { data: current } = await supabase.from('mangas').select('cover_url').eq('slug', 'absolute-duo').single();
    console.log('Current:', current);

    // 2. Update to correct path (assuming file is absolute-duo.png based on user input)
    // User said: "địa chỉ trong public/covers/absolute-duo.png"
    // Correct URL: "/covers/absolute-duo.png"

    const { data, error } = await supabase
        .from('mangas')
        .update({ cover_url: '/covers/absolute-duo.png' })
        .eq('slug', 'absolute-duo')
        .select();

    if (error) console.error('Update Error:', error);
    else console.log('Updated:', data);

    // Optional: Fix others starting with public/
    const { data: others } = await supabase
        .from('mangas')
        .update({ cover_url: '/placeholder.jpg' }) // Safety fallback or string replace logic if possible, but difficult in JS without fetching all
    // Actually, let's just fix the reported one for now to avoid side effects.
}

fix();
