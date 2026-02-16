import { createAdminClient } from '@/utils/supabase/admin'
import ContractForm from './contract-form'
import { notFound } from 'next/navigation'

export default async function GuestSigningPage({ params }: { params: Promise<{ token: string }> }) {
    const supabase = createAdminClient()
    const { token } = await params

    // Fetch contract with School and Company details
    console.log('--- SIGNING PAGE DEBUG ---')
    console.log('Token:', token)

    const { data: contract, error } = await supabase
        .from('contracts')
        .select(`
            id,
            created_at,
            status,
            temp_company_name,
            schools (
                name,
                city
            ),
            companies (
                name
            )
        `)
        .eq('signing_token', token)
        .single()

    console.log('Contract Data:', contract)
    console.log('Error:', error)

    if (!contract) {
        console.log('Contract NOT FOUND -> Triggering 404')
        return notFound()
    }

    if (contract.status !== 'pending_company') {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
                <div className="text-center">
                    <h1 className="text-xl font-bold text-gray-800">A link érvénytelen vagy lejárt.</h1>
                    <p className="text-gray-600">Lehet, hogy a szerződést már aláírták.</p>
                </div>
            </div>
        )
    }

    // Determine Company Name (use registered name if exists, otherwise temp name)
    const companyData = Array.isArray(contract.companies) ? contract.companies[0] : contract.companies
    const companyName = companyData?.name || contract.temp_company_name || 'Ismeretlen Cég'

    const schoolData = Array.isArray(contract.schools) ? contract.schools[0] : contract.schools
    const schoolName = schoolData?.name || 'Ismeretlen Iskola'
    const schoolCity = schoolData?.city || 'Budapest'

    return (
        <ContractForm
            token={token}
            schoolName={schoolName}
            schoolCity={schoolCity}
            companyName={companyName}
            createdAt={contract.created_at}
        />
    )
}
