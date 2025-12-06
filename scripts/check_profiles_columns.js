require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
    const { data, error } = await supabase.from('profiles').select().limit(1);
    if (data && data.length > 0) {
        console.log(JSON.stringify(Object.keys(data[0])));
    } else {
        console.log('No data to infer columns');
    }
}
check();
