'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function signContractByToken(token: string, formData: {
    ownerName: string,
    ownerContact: string,
    contactName: string,
    contactEmail: string,
    isDualRole?: boolean
}) {
    const supabase = createAdminClient()

    // 1. Validate Token
    const { data: contract, error } = await supabase
        .from('contracts')
        .select(`
            id, 
            status, 
            temp_owner_name, 
            school_id, 
            temp_company_name,
            companies ( name )
        `)
        .eq('signing_token', token)
        .single()

    if (error || !contract) {
        throw new Error('Érvénytelen vagy lejárt aláíró link.')
    }

    if (contract.status !== 'pending_company') {
        throw new Error('Ez a szerződés már aláírásra került vagy nem aláírható státuszban van.')
    }

    // Determine final contact details
    const ownerName = formData.ownerName
    const ownerEmail = formData.ownerContact
    const isDualRole = formData.isDualRole || false

    // If dual role, force contact to be owner
    const contactName = isDualRole ? ownerName : formData.contactName
    const contactEmail = isDualRole ? ownerEmail : formData.contactEmail

    // 2. Update Contract
    const { error: updateError } = await supabase
        .from('contracts')
        .update({
            status: 'pending_principal',
            // Signer = The Owner (Legal Rep)
            signer_name: ownerName,
            signer_email: ownerEmail,
            // Temp Owner = The Contact Person (Who gets the account)
            temp_owner_name: contactName,
            temp_owner_email: contactEmail,
        })
        .eq('id', contract.id)

    if (updateError) {
        console.error('Sign Error:', updateError)
        throw new Error(`Hiba az adatbázis frissítésekor: ${updateError.message} (Code: ${updateError.code})`)
    }

    // 3. Dual Flow: Owner Auto-Login AND Manager Invite
    let autoLoginSuccess = false
    let inviteSent = false
    let signerUserId: string | null = null

    // A) Handle OWNER (Auto-Login)
    try {
        const { data: { users } } = await supabase.auth.admin.listUsers({ perPage: 1000 })
        const existingOwner = users.find(u => u.email === ownerEmail)

        if (!existingOwner) {
            const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8)
            const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
                email: ownerEmail,
                password: tempPassword,
                email_confirm: true,
                user_metadata: {
                    full_name: ownerName,
                    role: 'business_owner',
                    is_dual_role: isDualRole // Store in metadata
                }
            })
            if (createError) throw createError
            signerUserId = newUser.user?.id || null

            // Log in
            const cookieSupabase = await createClient()
            const { error: loginError } = await cookieSupabase.auth.signInWithPassword({
                email: ownerEmail,
                password: tempPassword
            })
            if (!loginError) autoLoginSuccess = true

            // If dual role, try to update profile immediately?
            if (isDualRole && autoLoginSuccess) {
                const { data: { user } } = await cookieSupabase.auth.getUser()
                if (user) {
                    await supabase.from('profiles').update({ is_dual_role: true }).eq('id', user.id)
                }
            }

        } else {
            // User exists
            signerUserId = existingOwner.id
            if (isDualRole) {
                await supabase.from('profiles').update({ is_dual_role: true }).eq('id', existingOwner.id)
            }
        }
    } catch (e) {
        console.error('Owner setup failed:', e)
    }

    // 4. Send Notification to Principal
    try {
        if (signerUserId && contract.school_id) {
            // Find Principal
            const { data: school } = await supabase
                .from('schools')
                .select('principal_id')
                .eq('id', contract.school_id)
                .single()

            if (school?.principal_id) {
                const companyData = Array.isArray(contract.companies) ? contract.companies[0] : contract.companies
                const companyName = companyData?.name || contract.temp_company_name || 'Ismeretlen Cég'
                await supabase.from('messages').insert({
                    sender_id: signerUserId,
                    recipient_id: school.principal_id,
                    subject: `Szerződés Aláírva: ${companyName}`,
                    body: `A(z) ${companyName} aláírta a szerződést. A véglegesítéshez az Ön jóváhagyása szükséges.`,
                    is_read: false
                })
            } else {
                console.warn('No principal found for school:', contract.school_id)
            }
        }
    } catch (e) {
        console.error('Failed to send notification to principal:', e)
        // Don't fail the whole request just because notification failed
    }

    // B) Handle MANAGER (Invite) - DEPRECATED HERE
    // We now send the invite only after Principal Approval.
    // So we do nothing here for the manager account yet.
    if (contactEmail !== ownerEmail && !isDualRole) {
        console.log('Manager invite deferred until Principal verification.')
    }

    return {
        autoLogin: autoLoginSuccess,
        inviteSent: inviteSent,
        contactEmail: contactEmail
    }
}
