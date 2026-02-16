'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

async function ensurePrincipalOrAdmin() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (!['principal', 'admin'].includes(profile?.role || '')) {
        redirect('/')
    }

    const { data: userProfile } = await supabase
        .from('profiles')
        .select('school_id')
        .eq('id', user.id)
        .single()

    return userProfile?.school_id
}

export type CompanyContractStatus = {
    id: string
    name: string
    address: string | null
    contract: {
        id: string
        start_date: string
        end_date: string | null
        file_url: string | null
        is_active: boolean
        status: 'pending_teacher' | 'pending_company' | 'pending_principal' | 'active' | 'rejected'
        temp_company_name?: string
        temp_owner_name?: string
        temp_address?: string
        signer_name?: string
        signing_token?: string | null
        initiator?: {
            full_name: string | null
            class_id: string | null
        } | null
    } | null
}

export async function getCompaniesWithContracts(): Promise<CompanyContractStatus[]> {
    const supabase = await createClient()

    // 1. Fetch all companies
    const { data: companies, error: companyError } = await supabase
        .from('companies')
        .select('*')
        .order('name')

    if (companyError) throw new Error(companyError.message)

    // 2. Fetch all RELEVANT contracts (Active OR Pending Principal)
    // We ignore 'pending_company' here because the Principal doesn't need to act on them yet.
    const { data: contracts, error: contractError } = await supabase
        .from('contracts')
        .select('*, initiator:initiator_student_id(full_name, class_id)')
        .or('is_active.eq.true,status.eq.pending_principal,status.eq.pending_company,status.eq.pending_teacher')

    if (contractError) throw new Error(contractError.message)

    // 3. Merge them
    // Strategy: Start with real companies, then append "virtual" companies from contracts awaiting finalization
    const result: CompanyContractStatus[] = companies.map(company => {
        const relevantContract = contracts
            .filter(c => c.company_id === company.id)
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0] || null

        return {
            id: company.id,
            name: company.name,
            address: company.address,
            contract: relevantContract ? {
                id: relevantContract.id,
                start_date: relevantContract.start_date,
                end_date: relevantContract.end_date,
                file_url: relevantContract.file_url,
                is_active: relevantContract.is_active ?? false,
                status: relevantContract.status as 'pending_teacher' | 'pending_company' | 'pending_principal' | 'active' | 'rejected',
                temp_company_name: relevantContract.temp_company_name || undefined,
                temp_owner_name: relevantContract.temp_owner_name || undefined,
                temp_address: relevantContract.temp_company_address || undefined,
                signer_name: relevantContract.signer_name || undefined,
                signing_token: relevantContract.signing_token,
                initiator: relevantContract.initiator ? (
                    Array.isArray(relevantContract.initiator)
                        ? (relevantContract.initiator[0] as { full_name: string | null; class_id: string | null })
                        : (relevantContract.initiator as { full_name: string | null; class_id: string | null })
                ) : null
            } : null
        }
    })

    // 4. Find contracts with NO company_id (New Company Requests)
    const newCompanyContracts = contracts.filter(c => !c.company_id && c.temp_company_name)

    // Group by temp_company_name to avoid duplicates if multiple contracts (shouldn't happen often but good to handle)
    // Actually, usually 1 contract per new company attempt.
    for (const contract of newCompanyContracts) {
        // Check if we already have this "company" in result (unlikely if company_id is null, but maybe name collision?)
        // For display, we create a fake ID or use contract ID as ID prefix
        result.unshift({
            id: `temp-${contract.id}`,
            name: contract.temp_company_name + ' (ÚJ)',
            address: contract.temp_company_address || 'Cím feldolgozás alatt...',
            contract: {
                id: contract.id,
                start_date: contract.start_date,
                end_date: contract.end_date,
                file_url: contract.file_url,
                is_active: contract.is_active ?? false,
                status: contract.status as 'pending_teacher' | 'pending_company' | 'pending_principal' | 'active' | 'rejected',
                temp_company_name: contract.temp_company_name || undefined,
                temp_owner_name: contract.temp_owner_name || undefined,
                temp_address: contract.temp_company_address || undefined,
                signer_name: contract.signer_name || undefined,
                signing_token: contract.signing_token,
                initiator: contract.initiator ? (
                    Array.isArray(contract.initiator)
                        ? (contract.initiator[0] as { full_name: string | null; class_id: string | null })
                        : (contract.initiator as { full_name: string | null; class_id: string | null })
                ) : null
            }
        })
    }

    // Sort: Pending Principal first, then Alphabetical?
    // Let's sort by Name for now, but Maybe put Pending at top.
    result.sort((a, b) => {
        const aPending = a.contract?.status === 'pending_principal'
        const bPending = b.contract?.status === 'pending_principal'
        if (aPending !== bPending) return aPending ? -1 : 1
        return a.name.localeCompare(b.name)
    })

    return result as any
}

import { createAdminClient } from '@/utils/supabase/admin'

export async function finalizeContract(contractId: string) {
    await ensurePrincipalOrAdmin()
    const supabase = await createClient()
    const adminSupabase = createAdminClient()

    // 1. Fetch Contract
    const { data: contract, error: fetchError } = await supabase
        .from('contracts')
        .select('*, companies(name)')
        .eq('id', contractId)
        .single()

    if (fetchError || !contract) throw new Error('Contract not found')

    let targetCompanyId = contract.company_id

    // 2. If no Company ID, Create Company
    if (!targetCompanyId) {
        if (!contract.temp_company_name) throw new Error('No company info found')

        const { data: newCompany, error: createError } = await supabase
            .from('companies')
            .insert({
                name: contract.temp_company_name,
                address: contract.temp_company_address || '',
                city: contract.temp_company_city || '',
                is_active: true
            })
            .select('id')
            .single()

        if (createError) throw new Error('Failed to create company: ' + createError.message)
        targetCompanyId = newCompany.id
    }

    // 3. Update Contract
    const { error: updateError } = await supabase
        .from('contracts')
        .update({
            status: 'active',
            is_active: true,
            company_id: targetCompanyId,
            principal_signed_at: new Date().toISOString()
        } as any)
        .eq('id', contractId)

    if (updateError) throw new Error('Failed to update contract status')

    // 4. Link Owner Profile to Company
    if (contract.signer_email) {
        const { data: { users } } = await adminSupabase.auth.admin.listUsers({ perPage: 1000 })
        const ownerUser = users.find(u => u.email === contract.signer_email)

        if (ownerUser) {
            const { error: profileError } = await adminSupabase
                .from('profiles')
                .update({ company_id: targetCompanyId })
                .eq('id', ownerUser.id)

            if (profileError) console.error('Failed to link profile:', profileError)
        }
    }

    // 5. [NEW] Invite Contact Person (Manager) -> Only NOW do we send the invite
    // We check if temp_owner_email (Contact Email) exists and is DIFFERENT from signer_email (Owner)
    if (contract.temp_owner_email && contract.temp_owner_email !== contract.signer_email) {
        const contactEmail = contract.temp_owner_email
        const contactName = contract.temp_owner_name || 'Kapcsolattartó'

        const { data: { users } } = await adminSupabase.auth.admin.listUsers({ perPage: 1000 })
        const existingUser = users.find(u => u.email === contactEmail)

        if (!existingUser) {
            // Generate Invite Link (Don't send email via Supabase)
            const { data: linkData, error: linkError } = await adminSupabase.auth.admin.generateLink({
                type: 'invite',
                email: contactEmail,
                options: {
                    data: {
                        full_name: contactName,
                        role: 'business_owner',
                        company_id: targetCompanyId
                    }
                }
            })

            if (linkError) {
                console.error('Failed to generate invite link:', linkError)
            } else {
                const inviteLink = linkData.properties.action_link

                if (process.env.RESEND_API_KEY) {
                    const { sendEmail } = await import('@/utils/send-email')
                    await sendEmail({
                        to: contactEmail,
                        subject: `Meghívó - Közösségi Szolgálat Rendszer`,
                        html: `
                            <p>Tisztelt ${contactName}!</p>
                            <p>A(z) <strong>${contract.companies?.name}</strong> szervezet közösségi szolgálati szerződését az iskola igazgatója jóváhagyta.</p>
                            <p>Önt jelölték meg kapcsolattartóként. Fiókja elkészült, kérjük, kattintson az alábbi linkre a jelszó beállításához:</p>
                            <p><a href="${inviteLink}">${inviteLink}</a></p>
                            <br/>
                            <p>Üdvözlettel,<br/>KSZ Rendszer</p>
                        `
                    })
                } else {
                    console.log(`
                    📧 [MOCK EMAIL] TO MANAGER: ${contactEmail}
                    Subject: Meghívó - Közösségi Szolgálat Rendszer
                    Body: 
                    Tisztelt ${contactName}!
                    A(z) ${contract.companies?.name} szervezet közösségi szolgálati szerződését az iskola igazgatója jóváhagyta.
                    Önt jelölték meg kapcsolattartóként. Fiókja elkészült, kérjük, kattintson az alábbi linkre a jelszó beállításához:
                    
                    ${inviteLink}
                    `)
                }
            }
        } else {
            console.log(`User ${contactEmail} already exists, skipping invite.`)
            await adminSupabase.from('profiles').update({ company_id: targetCompanyId }).eq('id', existingUser.id)
        }
    }

    revalidatePath('/principal/contracts')
    revalidatePath('/principal/companies')
}

export async function saveContract(formData: FormData) {
    const schoolId = await ensurePrincipalOrAdmin()
    const supabase = await createClient()

    let targetSchoolId = schoolId
    if (!targetSchoolId) {
        const { data: firstSchool } = await supabase.from('schools').select('id').limit(1).single()
        targetSchoolId = firstSchool?.id
    }
    if (!targetSchoolId) throw new Error('No school found.')

    const companyId = formData.get('company_id') as string
    const startDate = formData.get('start_date') as string
    const fileUrl = formData.get('file_url') as string

    if (!companyId || !startDate) {
        throw new Error('Missing required fields')
    }

    // Deactivate old
    await supabase.from('contracts').update({ is_active: false }).eq('school_id', targetSchoolId).eq('company_id', companyId)

    // Insert new ACTIVE (manual override)
    const { error } = await supabase
        .from('contracts')
        .insert({
            school_id: targetSchoolId,
            company_id: companyId,
            start_date: startDate,
            file_url: fileUrl,
            is_active: true,
            status: 'active',
            principal_signed_at: new Date().toISOString()
        } as any)

    if (error) throw new Error('Failed to save contract')

    revalidatePath('/principal/contracts')
}
