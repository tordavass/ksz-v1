
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

const envLocalPath = path.resolve(__dirname, '../.env.local');
const envLocal = fs.readFileSync(envLocalPath, 'utf8');
const env = dotenv.parse(envLocal);

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function debugClasses() {
    console.log('--- DEBUG: Listing Classes & Teachers ---');

    // 1. Fetch All Classes with Teacher ID
    const { data: classes, error: classError } = await supabase
        .from('classes')
        .select('id, name, homeroom_teacher_id');

    if (classError) {
        console.error('Error fetching classes:', classError);
        return;
    }

    // 2. Fetch All Profiles for these teacher IDs to get names
    const teacherIds = classes.map(c => c.homeroom_teacher_id).filter(id => id);
    let teacherMap = {};

    if (teacherIds.length > 0) {
        const { data: teachers, error: teacherError } = await supabase
            .from('profiles')
            .select('id, full_name, role')
            .in('id', teacherIds);

        if (teacherError) console.error('Error fetching teacher profiles:', teacherError);
        else {
            teachers.forEach(t => { teacherMap[t.id] = t; });
        }
    }

    console.log(`Found ${classes.length} classes.`);
    classes.forEach(c => {
        const teacher = teacherMap[c.homeroom_teacher_id];
        const teacherName = teacher ? `${teacher.full_name} (${teacher.role})` : 'UNKNOWN/MISSING PROFILE';
        const teacherId = c.homeroom_teacher_id || 'NULL';
        console.log(`- Class: [${c.name}] | TeacherID: ${teacherId} | Name: ${teacherName}`);
    });

    console.log('\n--- DEBUG: Users with "teacher" email in Auth vs Profiles ---');
    // Try to find a user with email "teacher@example.com" if possible via listUsers
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers({ page: 1, perPage: 100 });

    if (authError) console.error('Auth List Error:', authError);
    else {
        const potentialTeachers = users.filter(u => u.email.includes('teacher') || u.email.includes('tanar'));
        if (potentialTeachers.length === 0) {
            console.log('No users found with "teacher" or "tanar" in email.');
        } else {
            for (const u of potentialTeachers) {
                // Check if they have a profile
                const { data: p } = await supabase.from('profiles').select('*').eq('id', u.id).single();
                console.log(`AuthUser: ${u.email} (ID: ${u.id})`);
                console.log(`   -> Profile: ${p ? JSON.stringify(p) : 'MISSING'}`);

                // Check if assigned to any class
                const assignedClass = classes.find(c => c.homeroom_teacher_id === u.id);
                console.log(`   -> Assigned Class: ${assignedClass ? assignedClass.name : 'NONE'}`);
            }
        }
    }
}

debugClasses();
