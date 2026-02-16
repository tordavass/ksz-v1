const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://ardprgfbgqqrlekgjrkk.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFyZHByZ2ZiZ3Fxcmxla2dqcmtrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjkwODIxOSwiZXhwIjoyMDgyNDg0MjE5fQ.AJzh1kviFI6U72v2RKw-383XmUCDnrKvbHeXkR44sYY';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function checkContracts() {
    console.log('--- CONTRACT STATUS DUMP ---');

    const { data: contracts, error: cErr } = await supabase
        .from('contracts')
        .select(`
            id, 
            status, 
            signing_token, 
            temp_company_name, 
            created_at,
            student:initiator_student_id ( full_name, class_id )
        `)
        .order('created_at', { ascending: false });

    if (cErr) {
        console.error('Error fetching contracts:', cErr);
        return;
    }

    if (!contracts || contracts.length === 0) {
        console.log('No contracts found.');
        return;
    }

    console.log(`Found ${contracts.length} contracts:`);
    contracts.forEach(c => {
        const tokenDisplay = c.signing_token ? `[TOKEN: ${c.signing_token.substring(0, 8)}...]` : '[NO TOKEN]';
        const studentName = c.student?.full_name || 'Unknown Student';
        console.log(`- ${c.created_at.substring(0, 10)} | ${studentName} | ${c.temp_company_name} | ${c.status.toUpperCase()} | ${tokenDisplay}`);
    });
}

checkContracts();
