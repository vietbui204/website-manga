require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
    console.log('Checking profiles table...');
    const { data, error } = await supabase.from('profiles').select('*');

    if (error) {
        console.error('Error fetching profiles:', error.message);
    } else {
        console.log('Profiles count:', data.length);
        console.log('Profiles data:', JSON.stringify(data, null, 2));
    }
}
check();
