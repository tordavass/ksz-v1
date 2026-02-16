'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function getParentChildren() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // Verify role
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'parent') {
        redirect('/') // or error
    }

    // Fetch linked students
    // We join through parent_student -> profiles (student)
    const { data: links, error } = await supabase
        .from('parent_student')
        .select(`
            student_id,
            profiles:student_id (
                id,
                full_name,
                avatar_url,
                school_id,
                class_id,
                classes:classes!profiles_class_id_fkey ( name )
            )
        `)
        .eq('parent_id', user.id)

    if (error) {
        console.error('Error fetching children:', JSON.stringify(error, null, 2))
        return []
    }

    // Transform result
    const children = links.map((link: any) => ({
        id: link.profiles.id,
        full_name: link.profiles.full_name,
        class_name: link.profiles.classes?.name || 'Nincs osztály'
    }))

    return children
}

export async function getChildLogs(studentId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    // Security check: Am I a parent of this student?
    const { data: link } = await supabase
        .from('parent_student')
        .select('parent_id')
        .eq('parent_id', user?.id)
        .eq('student_id', studentId)
        .single()

    if (!link) {
        throw new Error('Unauthorized: Not a parent of this student')
    }

    // Fetch logs
    const { data: logs, error } = await supabase
        .from('service_logs')
        .select(`
            id,
            date_of_service,
            hours_worked,
            description,
            status,
            rejection_reason,
            companies ( name )
        `)
        .eq('student_id', studentId)
        .order('date_of_service', { ascending: false })

    if (error) {
        console.error('Error fetching child logs:', error)
        return { logs: [], totalHours: 0 }
    }

    // Calculate totals
    const totalHours = logs.filter((l: any) => l.status === 'approved')
        .reduce((sum: number, l: any) => sum + Number(l.hours_worked), 0)

    return { logs, totalHours }
}

export async function getChildProfile(studentId: string) {
    const supabase = await createClient()
    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, classes:classes!profiles_class_id_fkey(name)')
        .eq('id', studentId)
        .single()

    return profile
}
