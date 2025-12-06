require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
    console.log('Checking manga: absolute-duo');
    const { data, error } = await supabase
        .from('mangas')
        .select('slug, cover_url')
        .eq('slug', 'absolute-duo')
        .single();

    if (error) console.error(error);
    else console.log('Data:', data);
}

check();
