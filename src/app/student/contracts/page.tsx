import { createClient } from '@/utils/supabase/server'
import RequestForm from './request-form'
import Link from 'next/link'
import DeleteContractButton from './delete-button'
import CopyLinkButton from './copy-link-button'

export default async function StudentContractsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Fetch my requests
    const { data: myContracts } = await supabase
        .from('contracts')
        .select(`
            id, 
            status, 
            created_at, 
            temp_company_name,
            temp_company_email,
            companies ( name )
        `)
        .eq('initiator_student_id', user!.id)
        .order('created_at', { ascending: false })

    return (
        <div className="min-h-screen p-4 md:p-8 bg-gray-50">
            <div className="mx-auto max-w-4xl space-y-8">
                <header className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-[var(--kreta-blue)]">Szerződéskötési Kérelmek</h1>
                        <p className="text-sm text-gray-500">Új szerződések indítása és nyomonkövetése.</p>
                    </div>
                    <Link href="/student" className="text-sm text-[var(--kreta-blue)] hover:underline">
                        ← Vissza a Tanulói Oldalra
                    </Link>
                </header>

                <RequestForm />

                {/* My Requests List */}
                <div className="space-y-4">
                    <h3 className="font-bold text-gray-700">Kérelmeim</h3>

                    {myContracts?.map((contract: any) => (
                        <div key={contract.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex justify-between items-center">
                            <div>
                                <div className="font-bold text-gray-800">
                                    {contract.companies?.name || contract.temp_company_name || 'Ismeretlen Cég'}
                                </div>
                                <div className="text-xs text-gray-500">
                                    Indítva: {new Date(contract.created_at).toLocaleDateString('hu-HU')}
                                </div>
                            </div>
                            <div>
                                {contract.status === 'pending_teacher' && (
                                    <div className="flex flex-col items-end gap-1">
                                        <span className="badge bg-blue-100 text-blue-800">Várakozás az Osztályfőnökre</span>
                                        <DeleteContractButton contractId={contract.id} />
                                    </div>
                                )}
                                {contract.status === 'pending_company' && (
                                    <div className="flex flex-col items-start gap-2 mt-2">
                                        <span className="badge bg-yellow-100 text-yellow-800">Aláírásra Vár</span>
                                        <p className="text-xs text-gray-500">
                                            Meghívó elküldve: {contract.temp_company_email}
                                        </p>
                                    </div>
                                )}
                                {contract.status === 'pending_principal' && (
                                    <span className="badge bg-purple-100 text-purple-800">Várakozás az Igazgatóra</span>
                                )}
                                {contract.status === 'active' && (
                                    <span className="badge bg-green-100 text-green-800">✓ Aktív</span>
                                )}
                                {contract.status === 'rejected' && (
                                    <span className="badge bg-red-100 text-red-800">✕ Elutasítva</span>
                                )}
                            </div>
                        </div>
                    ))}

                    {(!myContracts || myContracts.length === 0) && (
                        <p className="text-gray-500 text-sm italic">Még nem küldtél be kérelmet.</p>
                    )}
                </div>
            </div>
        </div>
    )
}
