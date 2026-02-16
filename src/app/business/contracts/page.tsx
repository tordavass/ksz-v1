import { getBusinessContracts, signContract } from './actions'
import Link from 'next/link'
import SignButton from './sign-button'
import DynamicContractViewer from '@/components/pdf/DynamicContractViewer'

export default async function BusinessContractsPage() {
    const contracts = await getBusinessContracts()

    return (
        <div className="min-h-screen p-4 md:p-8 bg-gray-50">
            <div className="mx-auto max-w-4xl space-y-6">

                {/* Header */}
                <header className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-[var(--kreta-blue)]">Beérkező Szerződések</h1>
                        <p className="text-sm text-gray-500">Tanulói szerződések áttekintése és aláírása.</p>
                    </div>
                    <Link href="/business" className="px-4 py-2 text-sm font-semibold text-[var(--kreta-blue)] bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                        ← Vissza a Szervezeti Oldalra
                    </Link>
                </header>

                {/* Contracts List */}
                <div className="grid gap-4">
                    {contracts.map((contract: any) => (
                        <div key={contract.id} className="card p-6 border border-gray-200">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-lg font-bold text-gray-800">
                                            Kérelem tőle: {contract.initiator?.full_name || 'Tanuló'}
                                        </h3>
                                        {contract.status === 'pending_company' && (
                                            <span className="badge bg-yellow-100 text-yellow-800 animate-pulse">
                                                Beavatkozás Szükséges
                                            </span>
                                        )}
                                        {contract.status === 'pending_principal' && (
                                            <span className="badge bg-purple-100 text-purple-800">
                                                Iskolai Jóváhagyásra Vár
                                            </span>
                                        )}
                                        {contract.status === 'active' && (
                                            <span className="badge bg-green-100 text-green-800">
                                                Aktív
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-500 mb-2">
                                        Beküldve: {new Date(contract.created_at).toLocaleDateString('hu-HU')}
                                    </p>

                                    <DynamicContractViewer
                                        studentName={contract.initiator?.full_name || 'Tanuló'}
                                        studentClass={contract.initiator?.class_id}
                                        companyName={contract.companies?.name || contract.temp_company_name || 'Cég'}
                                        companyAddress={contract.companies?.address || contract.temp_address}
                                        ownerName={contract.signer_name || contract.temp_owner_name || 'Tulajdonos'}
                                        date={contract.created_at}
                                        status={contract.status}
                                    />
                                </div>

                                <div>
                                    {contract.status === 'pending_company' ? (
                                        <SignButton contractId={contract.id} />
                                    ) : (
                                        <div className="text-sm text-gray-400 italic">
                                            {contract.status === 'active' ? 'Aláírva & Aktív' : 'Igazgatóra Vár'}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    {contracts.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                            <p>Nincs beérkező kérelem.</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    )
}
