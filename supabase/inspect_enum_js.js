
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

const envLocalPath = path.resolve(__dirname, '../.env.local');
const envLocal = fs.readFileSync(envLocalPath, 'utf8');
const env = dotenv.parse(envLocal);

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function inspectEnum() {
    console.log('Inspecting user_role enum...');

    // We can't query pg_enum easily via API.
    // But we can try to insert a profile with role 'parent' (WITHOUT TRIGGER) and see if it fails "invalid input value for enum".

    // 1. Create a dummy Auth User (so FK on ID works)
    const randomEmail = `enum_test_${Date.now()}@test.com`;
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: randomEmail,
        password: 'password123',
        email_confirm: true,
        user_metadata: {} // Trigger is dropped, so this succeeds.
    });

    if (authError) {
        console.error('Auth User Create Error:', authError);
        return;
    }

    const userId = authData.user.id;
    console.log('Auth User Created:', userId);

    // 2. Try INSERT into PROFILES with role='parent'
    const { error: profileError } = await supabase
        .from('profiles')
        .insert({
            id: userId,
            full_name: 'Enum Test',
            role: 'parent'
        });

    if (profileError) {
        console.error('Profile Insert Error:', profileError);
        if (profileError.message.includes('invalid input value for enum')) {
            console.log('CONCLUSION: "parent" is MISSING from user_role enum!');
        } else {
            console.log('CONCLUSION: Enum seems okay, error is something else.');
        }
    } else {
        console.log('Success! "parent" is a valid enum value.');
        // Cleanup
        await supabase.from('profiles').delete().eq('id', userId);
    }

    // Cleanup Auth
    await supabase.auth.admin.deleteUser(userId);
}

inspectEnum();
