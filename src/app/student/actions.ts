'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function getStudentLogs() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // Fetch logs for the current student
    const { data: logs, error } = await supabase
        .from('service_logs')
        .select(`
      *,
      companies ( name )
    `)
        .eq('student_id', user.id)
        .order('date_of_service', { ascending: false })

    if (error) {
        console.error('Error fetching logs:', error)
        // Note: profile is not defined at this point if an error occurs here.
        // So, profile?.parent_invite_token will be undefined.
        return { logs: [], totalHours: 0, unreadCount: 0, inviteToken: undefined }
    }

    // Calculate total APPROVED hours
    // We only count 'approved' towards the 50 hours
    const totalHours = logs
        .filter(log => log.status === 'approved')
        .reduce((sum, log) => sum + Number(log.hours_worked), 0)

    // Fetch Unread Messages Count
    const { count: unreadCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', user.id)
        .eq('is_read', false)

    // Fetch Invite Token
    const { data: profile } = await supabase
        .from('profiles')
        .select('parent_invite_token')
        .eq('id', user.id)
        .single()

    return {
        logs,
        totalHours,
        unreadCount: unreadCount || 0,
        inviteToken: profile?.parent_invite_token
    }
}

export async function createServiceLog(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const description = formData.get('description') as string
    const hours = parseFloat(formData.get('hours') as string)
    const date = formData.get('date') as string
    // For now, we optionally allow picking a company ID or just typing a name? 
    // The schema has company_id. Let's assume for this step we need a valid company_id.
    // We'll fetch companies in the UI. 
    // If the user selects "Other", we might have issues. 
    // Let's assume strictly picking a company for now as per "Kréta structure".
    const companyId = formData.get('company_id') as string

    const { error } = await supabase
        .from('service_logs')
        .insert({
            student_id: user.id,
            company_id: companyId || null, // Allow null if not applicable, though schema might want it
            description,
            hours_worked: hours,
            date_of_service: date,
            status: 'pending' // Always pending at start
        })

    if (error) {
        console.error('Create Log Error:', error)
        return { error: error.message }
    }

    revalidatePath('/student')
    redirect('/student')
}

export async function getCompanies() {
    const supabase = await createClient()

    // 1. Get current user's school
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    // We need to fetch the school_id safely.
    // Profiles should be readable by the user themselves.
    const { data: profile } = await supabase
        .from('profiles')
        .select('school_id')
        .eq('id', user.id)
        .single()

    if (!profile?.school_id) {
        // Fallback: If no school assigned, return empty list (Strict mode)
        // This forces students to be properly assigned to a school to see companies.
        return []
    }

    // 2. Fetch only companies with ACTIVE CONTRACTS for this school
    // We use the Inner Join on contracts table to filter.
    const { data: companies, error } = await supabase
        .from('companies')
        .select(`
            id, 
            name,
            contracts!inner(*)
        `)
        .eq('contracts.school_id', profile.school_id)
        .eq('contracts.is_active', true)
        .eq('is_banned', false) // Filter out banned companies
        .order('name')

    if (error) {
        console.error('Error fetching companies:', error)
        return []
    }

    return companies
}

export async function getServiceLog(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data } = await supabase
        .from('service_logs')
        .select('*')
        .eq('id', id)
        .eq('student_id', user.id)
        .single()

    return data
}

export async function updateServiceLog(id: string, formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const description = formData.get('description') as string
    const hours = parseFloat(formData.get('hours') as string)
    const date = formData.get('date') as string
    const companyId = formData.get('company_id') as string

    const { error } = await supabase
        .from('service_logs')
        .update({
            company_id: companyId || null,
            description,
            hours_worked: hours,
            date_of_service: date
        })
        .eq('id', id)
        .eq('student_id', user.id)
        .eq('status', 'pending') // Double check status here too

    if (error) {
        console.error('Update Log Error:', error)
        return { error: error.message }
    }

    revalidatePath('/student')
    redirect('/student')
}
