
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load env
const envLocalPath = path.resolve(__dirname, '../.env.local');
const envLocal = fs.readFileSync(envLocalPath, 'utf8');
const env = dotenv.parse(envLocal);

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const email = process.argv[2];

if (!email) {
    console.error('Kérjük, adja meg az email címet paraméterként!');
    console.error('Használat: node supabase/delete_user_by_email.js "email@cim.hu"');
    process.exit(1);
}

async function deleteUser() {
    console.log(`Felhasználó keresése az email alapján: ${email}...`);

    // 1. Find user by email (Admin listUsers with rudimentary filter/search)
    // Unfortunately, strict filtering by email isn't always direct in listUsers depending on version.
    // We will list users and find matches manually if needed, or rely on search.

    // Attempt deletion assuming we can find ID via metadata? No.
    // Supabase Admin API: deleteUser requires ID.
    // We must find ID first.

    // We try to "generate" the ID? No, UUIDs are random.

    // Strategy: List latest 50 users and find the email.
    const { data: { users }, error } = await supabase.auth.admin.listUsers({
        page: 1,
        perPage: 50,
    });

    if (error) {
        console.error('Hiba a felhasználók listázásakor:', error);
        return;
    }

    const targetUser = users.find(u => u.email === email);

    if (!targetUser) {
        console.error('Nem található ilyen email című felhasználó a legutóbbi 50 regisztrált között.');
        console.error('Ellenőrizze az email címet, vagy próbálja növelni a perPage értéket a scriptben.');
        return;
    }

    console.log(`Felhasználó megtalálva! ID: ${targetUser.id}`);

    // 2. Delete User
    const { error: deleteError } = await supabase.auth.admin.deleteUser(targetUser.id);

    if (deleteError) {
        console.error('Hiba a törléskor:', deleteError);
    } else {
        console.log('Siker! A felhasználó törölve lett.');
        console.log(`Email: ${email}`);
        console.log(`ID: ${targetUser.id}`);
    }
}

deleteUser();
