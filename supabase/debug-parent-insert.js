
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load env
const envLocalPath = path.resolve(__dirname, '../.env.local');
const envLocal = fs.readFileSync(envLocalPath, 'utf8');
const env = dotenv.parse(envLocal);

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase URL or Service Key');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugParentInsert() {
    console.log('Attempting to create AUTH user with EMPTY metadata...');

    // Use a random email
    const randomEmail = `debug_empty_${Date.now()}@test.com`;
    const password = 'password123';

    const { data, error } = await supabase.auth.admin.createUser({
        email: randomEmail,
        password: password,
        email_confirm: true,
        user_metadata: {} // EMPTY METADATA
    });

    if (error) {
        console.error('Create User Error (Empty Meta):', error);
    } else {
        console.log('Success! User created with ID:', data.user.id);

        // Cleanup
        await supabase.auth.admin.deleteUser(data.user.id);
    }
}

debugParentInsert();
