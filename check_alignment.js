const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://ardprgfbgqqrlekgjrkk.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFyZHByZ2ZiZ3Fxcmxla2dqcmtrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjkwODIxOSwiZXhwIjoyMDgyNDg0MjE5fQ.AJzh1kviFI6U72v2RKw-383XmUCDnrKvbHeXkR44sYY';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function checkAlignment() {
    console.log('--- SCHOOL ALIGNMENT CHECK ---');

    // 1. Get Principals
    const { data: principals, error: pErr } = await supabase
        .from('profiles')
        .select('id, full_name, school_id')
        .in('role', ['principal', 'admin']); // organization_owner is also principal-like

    if (pErr) console.error(pErr);

    console.log('Principals:');
    if (principals) {
        principals.forEach(p => {
            console.log(`- ${p.full_name} (${p.email}) | School ID: ${p.school_id}`);
        });
    }

    console.log('\nStudent Distribution by School ID:');

    // 2. Get All Students and group by school_id (manual grouping)
    const { data: students, error: sErr } = await supabase
        .from('profiles')
        .select('id, school_id')
        .eq('role', 'student');

    if (sErr) console.error(sErr);

    const distribution = {};
    let noSchoolCount = 0;

    if (students) {
        students.forEach(s => {
            if (!s.school_id) {
                noSchoolCount++;
            } else {
                distribution[s.school_id] = (distribution[s.school_id] || 0) + 1;
            }
        });
    }

    Object.entries(distribution).forEach(([schoolId, count]) => {
        console.log(`- School ${schoolId}: ${count} students`);
    });

    if (noSchoolCount > 0) {
        console.log(`- WARNING: ${noSchoolCount} students have NO School ID!`);
    }
}

checkAlignment();
