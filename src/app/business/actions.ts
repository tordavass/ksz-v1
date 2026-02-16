'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function getBusinessLogs() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // Get the current user's company_id
    const { data: profile } = await supabase
        .from('profiles')
        .select('company_id, role')
        .eq('id', user.id)
        .single()

    if (!profile || !['business_contact', 'business_owner'].includes(profile.role!) || !profile.company_id) {
        // Not a valid business user or not linked to a company
        return { logs: [], companyName: 'Nincs cég hozzárendelve', role: profile?.role || null }
    }

    // Fetch company name for display
    const { data: company } = await supabase
        .from('companies')
        .select('name')
        .eq('id', profile.company_id)
        .single()

    // Fetch ALL logs for this company (Pending + History)
    const { data: logs, error } = await supabase
        .from('service_logs')
        .select(`
      *,
      profiles:student_id ( full_name )
    `)
        .eq('company_id', profile.company_id)
        .order('date_of_service', { ascending: false })

    if (error) {
        console.error('Error fetching business logs:', error)
        return { logs: [], companyName: company?.name, role: profile.role }
    }

    // Fetch Unread Messages Count
    const { count: unreadCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', user.id)
        .eq('is_read', false)

    return { logs, companyName: company?.name, role: profile.role, unreadCount: unreadCount || 0 }
}

export async function updateLogStatus(logId: string, status: 'approved' | 'rejected', reason?: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const updateData: any = {
        status,
        business_contact_id: user.id // Log who approved it
    }

    if (status === 'rejected' && reason) {
        updateData.rejection_reason = reason
    }

    const { error } = await supabase
        .from('service_logs')
        .update(updateData)
        .eq('id', logId)

    if (error) {
        throw new Error(error.message)
    }

    revalidatePath('/business')
}
