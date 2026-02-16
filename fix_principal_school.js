const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://ardprgfbgqqrlekgjrkk.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFyZHByZ2ZiZ3Fxcmxla2dqcmtrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjkwODIxOSwiZXhwIjoyMDgyNDg0MjE5fQ.AJzh1kviFI6U72v2RKw-383XmUCDnrKvbHeXkR44sYY';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

const TARGET_SCHOOL_ID = '63fb9f80-f91f-4960-922d-d1f21dee1a72';

async function fixPrincipal() {
    console.log('--- FIXING PRINCIPAL SCHOOL ID ---');

    // Find principals with NULL school_id
    const { data: principals, error: pErr } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('role', ['principal', 'admin'])
        .is('school_id', null);

    if (pErr) {
        console.error('Error finding principals:', pErr);
        return;
    }

    if (!principals || principals.length === 0) {
        console.log('No principals found with missing school_id.');
        return;
    }

    console.log(`Found ${principals.length} principals to update:`);
    principals.forEach(p => console.log(`- ${p.full_name}`));

    for (const p of principals) {
        const { error: uErr } = await supabase
            .from('profiles')
            .update({ school_id: TARGET_SCHOOL_ID })
            .eq('id', p.id);

        if (uErr) {
            console.error(`Failed to update ${p.full_name}:`, uErr);
        } else {
            console.log(`Successfully linked ${p.full_name} to school ${TARGET_SCHOOL_ID}`);
        }
    }
}

fixPrincipal();
