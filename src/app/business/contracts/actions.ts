'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function getBusinessContracts() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // 1. Get user's company_id
    const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single()

    if (!profile?.company_id) return [] // No company assigned

    // 2. Fetch contracts
    const { data, error } = await supabase
        .from('contracts')
        .select('*') // Simplify query to test RLS on contracts table only
        .eq('company_id', profile.company_id)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('getBusinessContracts Error:', error)
        // We can't easily return the error string to the component without changing signature, 
        // but it will show in server terminal.
    }

    return data || []
}

export async function signContract(contractId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // Verify ownership via RLS policy implicitly, but good to be safe.
    // The RLS policy "Business Owners can sign contracts" handles security.

    const { error } = await supabase
        .from('contracts')
        .update({
            status: 'pending_principal',
            company_signed_at: new Date().toISOString()
        } as any)
        .eq('id', contractId)
        // We ensure status is correct to prevent double signing or jumping steps
        .eq('status', 'pending_company')

    if (error) {
        console.error('Sign Contract Error:', error)
        throw new Error('Failed to sign contract')
    }

    revalidatePath('/business/contracts')
}
