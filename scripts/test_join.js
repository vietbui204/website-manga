require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY
);

async function test() {
    console.log('Testing join mangas -> profiles...');
    // Try to join on user_id = profiles.id
    // This requires a FK relationship in PostgREST detection.
    // If user_id references auth.users, and profiles.id references auth.users, they are NOT directly linked in PostgREST's eyes unless explicitly linked.
    // However, we often set profiles.id as PK.
    // Let's try specifying the foreign key constraint if it exists, or just try the join.

    // Attempt 1: Implicit
    const { data, error } = await supabase
        .from('mangas')
        .select('title, user_id, profiles(username)')
        .not('user_id', 'is', null)
        .limit(1);

    if (error) {
        console.log('Join failed:', error.message);
        // Attempt 2: Explicitly trying to infer... (not much we can do in JS client if schema doesn't match)
    } else {
        console.log('Join success:', JSON.stringify(data, null, 2));
    }
}
test();
