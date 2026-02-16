const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://ardprgfbgqqrlekgjrkk.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFyZHByZ2ZiZ3Fxcmxla2dqcmtrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjkwODIxOSwiZXhwIjoyMDgyNDg0MjE5fQ.AJzh1kviFI6U72v2RKw-383XmUCDnrKvbHeXkR44sYY';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function seedData() {
    console.log('Starting Direct Seeding...');

    // 1. Fetch Students (and their school_id)
    const { data: students, error: sErr } = await supabase
        .from('profiles')
        .select('id, full_name, school_id')
        .eq('role', 'student');

    if (sErr || !students || students.length === 0) {
        console.error('No students found or error:', sErr);
        return;
    }
    console.log(`Found ${students.length} students.`);

    // 2. Fetch Companies
    const { data: companies } = await supabase
        .from('companies')
        .select('id, name')
        .limit(5);

    if (!companies || companies.length === 0) {
        console.error('No companies found.');
        return;
    }
    console.log(`Found ${companies.length} companies.`);

    let logsCreated = 0;
    let contractsCreated = 0;

    for (const student of students) {
        // Validation: Student must have a school_id to have a contract
        if (!student.school_id) {
            console.warn(`Skipping ${student.full_name} (ID: ${student.id}) - No School ID found.`);
            continue;
        }

        // Check for existing contract (using correct column: initiator_student_id)
        const { data: existingContracts } = await supabase
            .from('contracts')
            .select('id, company_id')
            .eq('initiator_student_id', student.id);

        let companyId = null;

        if (existingContracts && existingContracts.length > 0) {
            companyId = existingContracts[0].company_id;
        } else {
            // Create a dummy contract
            const randomCompany = companies[Math.floor(Math.random() * companies.length)];
            const { data: newContract, error: cErr } = await supabase
                .from('contracts')
                .insert({
                    initiator_student_id: student.id,
                    company_id: randomCompany.id,
                    school_id: student.school_id, // REQUIRED FIELD
                    status: 'active',
                    start_date: '2025-09-01',
                    is_active: true
                })
                .select()
                .single();

            if (newContract) {
                companyId = newContract.company_id;
                contractsCreated++;
                console.log(`Created contract for ${student.full_name} at ${randomCompany.name}`);
            } else {
                console.error(`Failed to create contract for ${student.full_name}`, cErr);
                continue;
            }
        }

        // Generate Logs (3-6 logs)
        const logCount = Math.floor(Math.random() * 4) + 3;
        const logs = [];
        for (let i = 0; i < logCount; i++) {
            const daysAgo = Math.floor(Math.random() * 90);
            const date = new Date();
            date.setDate(date.getDate() - daysAgo);
            const hours = Math.floor(Math.random() * 3) + 1;

            logs.push({
                student_id: student.id,
                company_id: companyId,
                date_of_service: date.toISOString().split('T')[0],
                hours_worked: hours,
                description: 'Demo munka feladat',
                status: 'approved'
            });
        }

        if (logs.length > 0) {
            const { error: lErr } = await supabase.from('service_logs').insert(logs);
            if (!lErr) {
                logsCreated += logs.length;
                console.log(`+ ${logs.length} logs for ${student.full_name}`);
            } else {
                console.error(`Log insert error for ${student.full_name}:`, lErr);
            }
        }
    }

    console.log(`\nSeeding Complete!`);
    console.log(`Contracts Created: ${contractsCreated}`);
    console.log(`Logs Created: ${logsCreated}`);
}

seedData();
