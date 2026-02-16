'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function searchAllCompanies(query: string) {
    const supabase = await createClient()

    if (!query || query.length < 2) return []

    const { data } = await supabase
        .from('companies')
        .select('id, name, address, signing_token')
        .ilike('name', `%${query}%`)
        .limit(10)

    // Optional: We could check if a contract already exists to prevent duplicates?
    // For now, let's just return matches.
    return data || []
}

export async function submitContractRequest(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: profile } = await supabase.from('profiles').select('school_id, class_id, full_name').eq('id', user.id).single()
    if (!profile?.school_id) throw new Error('You are not assigned to a school.')

    const companyId = formData.get('company_id') as string // Can be empty if new company
    const fileUrl = formData.get('file_url') as string

    // New fields
    // New fields
    // New fields
    const isNewCompany = formData.get('is_new_company') === 'true'
    const tempCompanyName = formData.get('temp_company_name') as string
    const tempCompanyEmail = formData.get('temp_company_email') as string

    // Validation
    if (isNewCompany) {
        if (!tempCompanyName || !tempCompanyEmail) {
            throw new Error('Új szervezet neve és email címe kötelező!')
        }
    } else {
        if (!companyId) throw new Error('Válassz egy szervezetet!')
    }

    // Start Date defaults to today for the request
    const startDate = new Date().toISOString()

    const { error } = await supabase
        .from('contracts')
        .insert({
            school_id: profile.school_id!,
            company_id: isNewCompany ? null : companyId, // Null for new companies until approved/created
            initiator_student_id: user.id,
            file_url: fileUrl,
            start_date: startDate,
            status: 'pending_teacher',
            is_active: false,
            // Store temp data
            temp_company_name: isNewCompany ? tempCompanyName : null,
            temp_company_email: isNewCompany ? tempCompanyEmail : null,
        })

    if (error) {
        console.error('Submit Contract Error:', error)
        throw new Error(`Failed to submit request: ${error.message} (${error.code})`)
    }

    revalidatePath('/student/contracts')

    // Notify Homeroom Teacher
    if (profile.class_id) {
        const { data: classData } = await supabase
            .from('classes')
            .select('homeroom_teacher_id')
            .eq('id', profile.class_id)
            .single()

        if (classData?.homeroom_teacher_id) {
            await supabase.from('messages').insert({
                sender_id: user.id,
                recipient_id: classData.homeroom_teacher_id,
                subject: 'Új Szerződés Kérelem',
                body: `${profile.full_name} új szerződéskötési kérelmet nyújtott be (${isNewCompany ? tempCompanyName : 'Meglévő Szervezet'}). Kérlek ellenőrizd a kérelmet.`
            })
        }
    }
}

export async function deleteContract(contractId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    // Only allow deleting if status is 'pending_teacher'
    // And user is the initiator
    const { error } = await supabase
        .from('contracts')
        .delete()
        .eq('id', contractId)
        .eq('initiator_student_id', user.id)
        .eq('status', 'pending_teacher')

    if (error) {
        console.error('Delete Contract Error:', error)
        throw new Error('Nem sikerült törölni a kérelmet. Lehet, hogy már nem várakozó státuszban van.')
    }

    revalidatePath('/student/contracts')
}
