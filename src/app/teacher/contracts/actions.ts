'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function getTeacherContracts() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // 1. Get Teacher's class(es)
    // Teachers usually see their own class.
    const { data: teacherProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (teacherProfile?.role !== 'homeroom_teacher') {
        redirect('/')
    }

    // We need to find which class this teacher owns.
    // The schema has `classes.homeroom_teacher_id`
    const { data: myClass } = await supabase
        .from('classes')
        .select('id')
        .eq('homeroom_teacher_id', user.id)
        .single()

    if (!myClass) return []

    // 2. Fetch Pending Contracts for students in this class
    // We join contracts -> initiator_student_id (profile) -> class_id
    // Safer query with Inner Join AND fetching Class Name for PDF
    const { data: robustContracts, error: robustError } = await supabase
        .from('contracts')
        .select(`
            *,
            companies ( name ),
            student:initiator_student_id!inner (
                full_name,
                class_id,
                classes!profiles_class_id_fkey ( name )
            ),
            signing_token
        `)
        .in('status', ['pending_teacher', 'pending_company'])
        .eq('initiator_student_id.class_id', myClass.id)
        .order('created_at', { ascending: true })

    if (robustError) {
        console.error('Error fetching teacher contracts (robust):', robustError)
        return []
    }

    return robustContracts || []
}

export async function approveContract(contractId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // 1. Fetch Contract to get Email and Token
    const { data: contract } = await supabase
        .from('contracts')
        .select('temp_company_email, signing_token, temp_company_name')
        .eq('id', contractId)
        .single()

    if (!contract) throw new Error('Contract not found')

    // 2. Transition: pending_teacher -> pending_company
    // Ensure we have a signing token if it was missing (e.g. from seed)
    const crypto = require('crypto')
    const finalToken = contract.signing_token || crypto.randomUUID()

    const { error } = await supabase
        .from('contracts')
        .update({
            status: 'pending_company',
            signing_token: finalToken
        })
        .eq('id', contractId)
        .eq('status', 'pending_teacher') // Safety check

    if (error) throw new Error('Failed to approve contract')

    // 3. Send Email Invite
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const token = finalToken
    const inviteLink = `${baseUrl}/sign/${token}`

    if (contract.temp_company_email) {
        if (process.env.RESEND_API_KEY) {
            const { sendEmail } = await import('@/utils/send-email')
            await sendEmail({
                to: contract.temp_company_email,
                subject: `Aláírási Kérelem - ${contract.temp_company_name}`,
                html: `
                    <p>Tisztelt Szervezet!</p>
                    <p>Egy tanuló közösségi szolgálati szerződést kezdeményezett Önökkel.</p>
                    <p>Kérjük, kattintson az alábbi linkre a szerződés megtekintéséhez és aláírásához:</p>
                    <p><a href="${inviteLink}">${inviteLink}</a></p>
                    <br/>
                    <p>Üdvözlettel,<br/>KSZ Rendszer</p>
                `
            })
        } else {
            console.log(`
            📧 [MOCK EMAIL] TO: ${contract.temp_company_email}
            LINK: ${inviteLink}
            `)
        }
    }

    revalidatePath('/teacher/contracts')
}

export async function rejectContract(contractId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // Transition: pending_teacher -> rejected
    const { error } = await supabase
        .from('contracts')
        .update({ status: 'rejected' })
        .eq('id', contractId)
        .eq('status', 'pending_teacher')

    if (error) throw new Error('Failed to reject contract')

    revalidatePath('/teacher/contracts')
}
