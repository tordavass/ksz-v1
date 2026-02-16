const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://ardprgfbgqqrlekgjrkk.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFyZHByZ2ZiZ3Fxcmxla2dqcmtrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjkwODIxOSwiZXhwIjoyMDgyNDg0MjE5fQ.AJzh1kviFI6U72v2RKw-383XmUCDnrKvbHeXkR44sYY';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function checkRecent() {
    console.log('--- RECENT CONTRACTS (Last 5) ---');

    const { data: contracts, error: cErr } = await supabase
        .from('contracts')
        .select(`
            id, 
            status, 
            signing_token, 
            temp_company_name, 
            created_at,
            student:initiator_student_id ( full_name )
        `)
        .order('created_at', { ascending: false })
        .limit(5);

    if (cErr) {
        console.error('Error:', cErr);
        return;
    }

    contracts.forEach(c => {
        console.log(`\nID: ${c.id}`);
        console.log(`Student: ${c.student?.full_name}`);
        console.log(`Company: ${c.temp_company_name}`);
        console.log(`Status: '${c.status}'`);  // Quoted to see whitespace
        console.log(`Token: ${c.signing_token}`);
    });
}

checkRecent();
