const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://ardprgfbgqqrlekgjrkk.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFyZHByZ2ZiZ3Fxcmxla2dqcmtrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjkwODIxOSwiZXhwIjoyMDgyNDg0MjE5fQ.AJzh1kviFI6U72v2RKw-383XmUCDnrKvbHeXkR44sYY';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function checkData() {
    console.log('Checking database...');

    // 1. Get Students
    const { data: students, error: sErr } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('role', 'student');

    if (sErr) {
        console.error('Error fetching students:', sErr);
        return;
    }

    console.log(`Found ${students.length} students.`);

    for (const student of students) {
        // Check contracts (FIX: initiator_student_id)
        const { count: contractCount } = await supabase
            .from('contracts')
            .select('*', { count: 'exact', head: true })
            .eq('initiator_student_id', student.id);

        // Check logs
        const { count: logCount, error: lErr } = await supabase
            .from('service_logs')
            .select('*', { count: 'exact', head: true })
            .eq('student_id', student.id);

        if (lErr) {
            console.error(`Error checking logs for ${student.full_name}:`, lErr);
        } else {
            console.log(`- ${student.full_name}: Contracts: ${contractCount} | Logs: ${logCount}`);
        }
    }
}

checkData();
