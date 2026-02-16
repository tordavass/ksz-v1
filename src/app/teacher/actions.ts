'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function getTeacherClass() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // 1. Find the class this teacher manages
    const { data: classData, error: classError } = await supabase
        .from('classes')
        .select('*')
        .eq('homeroom_teacher_id', user.id)
        .single()

    if (classError || !classData) {
        // Not an error, some teachers might not have a class yet.
        // console.warn('Teacher has no class assigned', classError)
        return { className: null, students: [] }
    }

    // 2. Fetch Students in this class
    const { data: students, error: studentError } = await supabase
        .from('profiles')
        .select('*')
        .eq('class_id', classData.id)
        .eq('role', 'student')
        .order('full_name')

    if (studentError) {
        console.error('Error fetching students', studentError)
        return { className: classData.name, students: [] }
    }

    // 3. Calculate Hours for each student
    // We fetch ALL logs for these students to aggregate
    const studentIds = students.map(s => s.id)

    // Check if we have any students before querying logs
    if (studentIds.length === 0) {
        return { className: classData.name, students: [] }
    }

    const { data: logs } = await supabase
        .from('service_logs')
        .select('student_id, hours_worked, status')
        .in('student_id', studentIds)
        .eq('status', 'approved') // Only count approved for the total

    // Helper map for O(1) lookup
    // totalHoursMap[studentId] = hours
    const totalHoursMap: Record<string, number> = {}

    logs?.forEach(log => {
        const sid = log.student_id
        const hours = Number(log.hours_worked)
        totalHoursMap[sid] = (totalHoursMap[sid] || 0) + hours
    })

    // Merge data
    const studentsWithStats = students.map(student => ({
        ...student,
        total_hours: totalHoursMap[student.id] || 0
    }))

    // Fetch Unread Messages Count for Teacher
    const { count: unreadCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', user.id)
        .eq('is_read', false)

    return {
        className: classData.name,
        students: studentsWithStats,
        unreadCount: unreadCount || 0
    }
}

export async function getStudentDetailsForTeacher(studentId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // 1. Get Teacher's Class ID
    const { data: teacherClass } = await supabase
        .from('classes')
        .select('id')
        .eq('homeroom_teacher_id', user.id)
        .single()

    if (!teacherClass) {
        return { student: null, logs: [], totalHours: 0 }
    }

    // 2. Verify Student belongs to this Class
    const { data: student } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', studentId)
        .eq('class_id', teacherClass.id)
        .single()

    if (!student) {
        return { student: null, logs: [], totalHours: 0 }
    }

    // 3. Fetch Logs
    const { data: logs } = await supabase
        .from('service_logs')
        .select(`
            *,
            companies ( name )
        `)
        .eq('student_id', studentId)
        .order('date_of_service', { ascending: false })

    // 4. Calc Total
    const totalHours = logs
        ?.filter(l => l.status === 'approved')
        .reduce((sum, l) => sum + Number(l.hours_worked), 0) || 0

    return { student, logs, totalHours }
}
