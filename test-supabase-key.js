// Test script để kiểm tra Supabase connection
require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Checking environment variables...\n');
console.log('SUPABASE_URL:', SUPABASE_URL ? '✅ Found' : '❌ Missing');
console.log('SERVICE_ROLE_KEY:', SERVICE_KEY ? '✅ Found' : '❌ Missing');

if (!SUPABASE_URL || !SERVICE_KEY) {
    console.error('\n❌ Missing required environment variables!');
    console.log('\nMake sure your .env.local file contains:');
    console.log('NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co');
    console.log('SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...');
    process.exit(1);
}

console.log('\n🔌 Testing Supabase connection...\n');

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false }
});

async function testConnection() {
    try {
        // Test 1: List buckets
        console.log('Test 1: Listing storage buckets...');
        const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();

        if (bucketsError) {
            console.error('❌ Failed to list buckets:', bucketsError.message);
            return false;
        }

        console.log('✅ Buckets found:', buckets.map(b => b.name).join(', ') || 'none');

        // Test 2: Query mangas table
        console.log('\nTest 2: Querying mangas table...');
        const { data: mangas, error: mangasError } = await supabase
            .from('mangas')
            .select('id, slug, title')
            .limit(5);

        if (mangasError) {
            console.error('❌ Failed to query mangas:', mangasError.message);
            console.log('ℹ️  This might be OK if the table doesn\'t exist yet');
        } else {
            console.log('✅ Mangas found:', mangas?.length || 0);
            if (mangas && mangas.length > 0) {
                mangas.forEach(m => console.log(`   - ${m.slug}: ${m.title}`));
            }
        }

        console.log('\n✅ Connection test completed successfully!');
        console.log('Your Service Role Key is working correctly.\n');
        return true;

    } catch (error) {
        console.error('\n❌ Connection test failed:', error.message);
        return false;
    }
}

testConnection().then(success => {
    process.exit(success ? 0 : 1);
});
