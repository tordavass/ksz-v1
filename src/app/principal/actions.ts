'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// --- Company Management Actions ---

export async function toggleCompanyBan(companyId: string, currentStatus: boolean) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // Verify role (admin or principal)
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'admin' && profile?.role !== 'principal') {
        throw new Error('Unauthorized')
    }

    const { error } = await supabase
        .from('companies')
        // @ts-ignore: is_banned might be missing in generated types
        .update({ is_banned: !currentStatus })
        .eq('id', companyId)
        .select('name') // Return name for message
        .single()

    if (error) {
        console.error('Error toggling ban:', error)
        throw new Error('Failed to update company status')
    }

    // If we just BANNED it (!currentStatus === true), notify ALL students
    if (!currentStatus) {
        // 1. Fetch ALL students (school-wide announcement)
        const { data: students } = await supabase
            .from('profiles')
            .select('id')
            .eq('role', 'student')

        if (students && students.length > 0) {
            // 2. Fetch company name
            const { data: company } = await supabase.from('companies').select('name').eq('id', companyId).single()
            const companyName = company?.name || 'Szervezet'

            // 3. Send Message to ALL students
            const messages = students.map(student => ({
                sender_id: user.id,
                recipient_id: student.id,
                subject: 'Szervezet Tiltásra Került',
                body: `FIGYELEM: A(z) "${companyName}" szervezetet az igazgató letiltotta. Ehhez a helyhez új szerződés vagy naplóbejegyzés már nem rögzíthető.`,
                is_read: false
            }))

            if (messages.length > 0) {
                const { error: msgError } = await supabase
                    .from('messages')
                    .insert(messages as any) // suppress strict type check for now if needed

                if (msgError) console.error('Error sending ban notifications:', msgError)
            }
        }
    }

    revalidatePath('/principal/companies')
    revalidatePath('/student/companies') // Update student view too
}

export async function getPrincipalCompanies() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // Verify role
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'admin' && profile?.role !== 'principal') {
        redirect('/')
    }

    const { data: companies, error } = await supabase
        .from('companies')
        .select(`
            *,
            contracts (
                status,
                is_active
            )
        `)
        .order('name')

    if (error) {
        console.error('Error fetching companies:', error)
        return []
    }

    return companies
}

// --- Dashboard Stats Actions ---

export async function getSchoolStats() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // 1. Get School ID from Principal's profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('school_id')
        .eq('id', user.id)
        .single()

    if (!profile?.school_id) return null

    const schoolId = profile.school_id

    // 2. Fetch all students in this school
    const { data: students } = await supabase
        .from('profiles')
        .select('id')
        .eq('school_id', schoolId)
        .eq('role', 'student')

    const totalStudents = students?.length || 0
    const studentIds = students?.map(s => s.id) || []

    // 3. Fetch all logs for these students
    let totalHours = 0
    let pendingCount = 0

    if (studentIds.length > 0) {
        const { data: logs } = await supabase
            .from('service_logs')
            .select('hours_worked, status')
            .in('student_id', studentIds)

        if (logs) {
            totalHours = logs
                .filter(l => l.status === 'approved')
                .reduce((sum, l) => sum + Number(l.hours_worked), 0)

            pendingCount = logs.filter(l => l.status === 'pending').length
        }
    }

    // 4. Calculate Completion Rate (Global Hours)
    // Formula: Total Completed Hours / (Total School Capacity = Students * 50)
    const schoolTotalCapacity = totalStudents * 50
    const completionRate = schoolTotalCapacity > 0
        ? Math.min((totalHours / schoolTotalCapacity) * 100, 100) // Cap at 100% just in case
        : 0

    // 5. Calculate Class Leaderboard
    const { data: classes } = await supabase
        .from('classes')
        .select('id, name')
        .eq('school_id', schoolId)

    const classLeaderboard = []

    if (classes && studentIds.length > 0) {
        // Fetch students with their class_id
        const { data: studentsWithClass } = await supabase
            .from('profiles')
            .select('id, class_id')
            .in('id', studentIds)

        const { data: logs } = await supabase
            .from('service_logs')
            .select('student_id, hours_worked')
            .in('student_id', studentIds)
            .eq('status', 'approved')

        const sMap: Record<string, number> = {}
        logs?.forEach(l => sMap[l.student_id] = (sMap[l.student_id] || 0) + Number(l.hours_worked))

        for (const cls of classes) {
            const classStudents = studentsWithClass?.filter(s => s.class_id === cls.id) || []
            const count = classStudents.length
            const clsTotalHours = classStudents.reduce((sum, s) => sum + (sMap[s.id] || 0), 0)
            const avg = count > 0 ? clsTotalHours / count : 0

            if (count > 0) {
                classLeaderboard.push({
                    id: cls.id,
                    name: cls.name,
                    studentCount: count,
                    totalHours: clsTotalHours,
                    avgHours: avg
                })
            }
        }
    }

    // Sort by Avg Hours desc, take top 5
    classLeaderboard.sort((a, b) => b.avgHours - a.avgHours)
    const top5 = classLeaderboard.slice(0, 5)

    // Fetch Unread Messages Count
    const { count: unreadCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', user.id)
        .eq('is_read', false)

    return {
        totalStudents,
        totalHours,
        completionRate,
        pendingCount,
        classLeaderboard: top5,
        unreadCount: unreadCount || 0
    }
}

// --- Class & Student Details for Principal ---

export async function getPrincipalClassDetails(classId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // Verify role
    const { data: profile } = await supabase
        .from('profiles')
        .select('role, school_id')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'admin' && profile?.role !== 'principal') {
        redirect('/')
    }

    if (!profile?.school_id) {
        redirect('/')
    }

    // 1. Fetch Class Info & Verify it belongs to Principal's School
    const { data: classData, error: classError } = await supabase
        .from('classes')
        .select('*')
        .eq('id', classId)
        .eq('school_id', profile.school_id)
        .single()

    if (classError || !classData) {
        return null
    }

    // 2. Fetch Students
    const { data: students } = await supabase
        .from('profiles')
        .select('*')
        .eq('class_id', classId)
        .eq('role', 'student')
        .order('full_name')

    if (!students || students.length === 0) {
        return { classData, students: [] }
    }

    // 3. Calc Stats (Hours)
    const studentIds = students.map(s => s.id)
    const { data: logs } = await supabase
        .from('service_logs')
        .select('student_id, hours_worked')
        .in('student_id', studentIds)
        .eq('status', 'approved')

    const hoursMap: Record<string, number> = {}
    logs?.forEach(l => {
        hoursMap[l.student_id] = (hoursMap[l.student_id] || 0) + Number(l.hours_worked)
    })

    const studentsWithStats = students.map(s => ({
        ...s,
        total_hours: hoursMap[s.id] || 0
    }))

    return { classData, students: studentsWithStats }
}

export async function getPrincipalStudentDetails(studentId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // Verify role
    const { data: profile } = await supabase
        .from('profiles')
        .select('role, school_id')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'admin' && profile?.role !== 'principal') {
        redirect('/')
    }

    if (!profile?.school_id) {
        redirect('/')
    }

    // 1. Fetch Student & Verify School Match
    const { data: student, error: studentError } = await supabase
        .from('profiles')
        .select(`
            *,
            classes!profiles_class_id_fkey ( name )
        `)
        .eq('id', studentId)
        .eq('school_id', profile.school_id)
        .single()

    if (studentError || !student) {
        // console.error('Error fetching student:', studentError)
        return null
    }

    // Check school ID manually (Double-Check)
    if (student.school_id !== profile.school_id) {
        return null
    }

    // 2. Fetch Logs
    const { data: logs } = await supabase
        .from('service_logs')
        .select(`
            *,
            companies ( name )
        `)
        .eq('student_id', studentId)
        .order('date_of_service', { ascending: false })

    // 3. Calc Total
    const totalHours = logs
        ?.filter(l => l.status === 'approved')
        .reduce((sum, l) => sum + Number(l.hours_worked), 0) || 0

    return { student, logs, totalHours }
}
