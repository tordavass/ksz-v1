const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const SUPABASE_URL = 'https://ardprgfbgqqrlekgjrkk.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFyZHByZ2ZiZ3Fxcmxla2dqcmtrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjkwODIxOSwiZXhwIjoyMDgyNDg0MjE5fQ.AJzh1kviFI6U72v2RKw-383XmUCDnrKvbHeXkR44sYY';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function fixTokens() {
    console.log('--- FIXING MISSING SIGNING TOKENS ---');

    // Find contracts pending company signature but missing a token
    const { data: contracts, error: cErr } = await supabase
        .from('contracts')
        .select('id, student:initiator_student_id(full_name)')
        .eq('status', 'pending_company')
        .is('signing_token', null);

    if (cErr) {
        console.error('Error fetching contracts:', cErr);
        return;
    }

    if (!contracts || contracts.length === 0) {
        console.log('No contracts found with missing tokens.');
        return;
    }

    console.log(`Found ${contracts.length} broken contracts:`);
    contracts.forEach(c => console.log(`- Contract ${c.id} (Student: ${c.student?.full_name || 'Unknown'})`));

    for (const c of contracts) {
        const newToken = crypto.randomUUID();
        const { error: uErr } = await supabase
            .from('contracts')
            .update({ signing_token: newToken })
            .eq('id', c.id);

        if (uErr) {
            console.error(`Failed to update contract ${c.id}:`, uErr);
        } else {
            console.log(`Generated token for contract ${c.id}: ${newToken}`);
        }
    }
}

fixTokens();
