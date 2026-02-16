
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load env
const envLocalPath = path.resolve(__dirname, '../.env.local');
const envLocal = fs.readFileSync(envLocalPath, 'utf8');
const env = dotenv.parse(envLocal);

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function inspectProfiles() {
    console.log('Inspecting profiles table columns...');

    // We can't query information_schema easily with supabase-js unless we have a function.
    // But we can try to select * limit 1 and see keys.

    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error selecting profiles:', error);
    } else {
        if (data.length > 0) {
            console.log('Columns found in a row:', Object.keys(data[0]));
        } else {
            console.log('No rows in profiles. Cannot inspect columns via select.');
            // Fallback: try to insert a dummy row with just ID (if allowed) to see if it complains about unknown columns?
            // No, that sends error.
        }
    }
}

inspectProfiles();
