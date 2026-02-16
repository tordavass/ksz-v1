'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import { approveContract, rejectContract } from './actions'

const ContractPDFViewer = dynamic(() => import('@/components/pdf/ContractPDFViewer'), {
    ssr: false,
    loading: () => <span className="text-xs text-gray-400">PDF Előkészítése...</span>
})

type Contract = {
    id: string
    created_at: string
    companies: { name: string } | null
    student: { full_name: string, classes?: { name: string } }
    file_url?: string
    status: string
    signing_token?: string
    temp_company_name?: string
    temp_company_address?: string
    temp_owner_name?: string
    temp_owner_email?: string
}

export default function ContractList({ initialContracts }: { initialContracts: any[] }) {
    const [contracts, setContracts] = useState<Contract[]>(initialContracts)
    const [processingId, setProcessingId] = useState<string | null>(null)
    const [copiedId, setCopiedId] = useState<string | null>(null)

    // Modal State
    const [showModal, setShowModal] = useState(false)
    const [selectedContract, setSelectedContract] = useState<string | null>(null)
    const [modalAction, setModalAction] = useState<'approve' | 'reject' | null>(null)

    const openModal = (id: string, action: 'approve' | 'reject') => {
        setSelectedContract(id)
        setModalAction(action)
        setShowModal(true)
    }

    const confirmAction = async () => {
        if (!selectedContract || !modalAction) return

        const id = selectedContract
        const action = modalAction
        setShowModal(false)

        setProcessingId(id)
        try {
            if (action === 'approve') {
                await approveContract(id)
            } else {
                await rejectContract(id)
            }
            setContracts(prev => prev.filter(c => c.id !== id))
        } catch (e) {
            console.error(e)
            alert('Hiba történt: ' + (e as Error).message)
        } finally {
            setProcessingId(null)
            setSelectedContract(null)
            setModalAction(null)
        }
    }

    const handleCopyLink = (token: string, id: string) => {
        const link = `${window.location.origin}/sign/${token}`
        navigator.clipboard.writeText(link)
        setCopiedId(id)
        setTimeout(() => setCopiedId(null), 2000)
    }

    if (contracts.length === 0) {
        return (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
                <p className="text-gray-500">Nincs függőben lévő szerződés kérelem.</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {contracts.map(contract => (
                <div key={contract.id} className="card p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-800">{contract.student.full_name} <span className="text-sm font-normal text-gray-500">({contract.student.classes?.name || 'Ismeretlen osztály'})</span></h3>
                        <p className="text-gray-600">
                            Szervezet: <span className="font-semibold">{contract.companies?.name || contract.temp_company_name || 'Ismeretlen'}</span>
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                            Tulajdonos: {contract.temp_owner_name || 'Nincs megadva'} ({contract.temp_owner_email || 'nincs email'})
                        </p>
                        <p className="text-xs text-gray-400 mt-1">Beadva: {new Date(contract.created_at).toLocaleDateString('hu-HU')}</p>

                        <div className="mt-4">
                            {/* If it's a new system-generated contract request (has temp data), generate PDF */}
                            {(contract.temp_company_name || !contract.file_url) ? (
                                <ContractPDFViewer
                                    studentName={contract.student.full_name}
                                    studentClass={contract.student.classes?.name}
                                    companyName={contract.companies?.name || contract.temp_company_name || 'Ismeretlen Cég'}
                                    companyAddress={contract.temp_company_address || 'Cím nincs megadva'}
                                    ownerName={contract.temp_owner_name || 'Cégképviselő'}
                                    date={contract.created_at}
                                    status={contract.status}
                                    className="bg-gray-100/50 hover:bg-gray-100 border-gray-200 text-gray-700"
                                />
                            ) : (
                                // Fallback to uploaded file if it exists and no temp data (Legacy support)
                                contract.file_url && (
                                    <a
                                        href={contract.file_url}
                                        target="_blank"
                                        className="inline-flex items-center gap-2 text-sm text-[var(--kreta-blue)] hover:underline"
                                    >
                                        📄 Beküldött Fájl Megtekintése
                                    </a>
                                )
                            )}
                        </div>
                    </div>

                    <div className="flex gap-2">
                        {contract.status === 'pending_teacher' && (
                            <>
                                <button
                                    onClick={() => openModal(contract.id, 'reject')}
                                    disabled={!!processingId}
                                    className="px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 text-sm font-semibold transition-colors disabled:opacity-50"
                                >
                                    Elutasítás
                                </button>
                                <button
                                    onClick={() => openModal(contract.id, 'approve')}
                                    disabled={!!processingId}
                                    className="px-4 py-2 bg-[var(--kreta-blue)] text-white rounded-lg hover:bg-blue-700 text-sm font-semibold transition-colors disabled:opacity-50"
                                >
                                    {processingId === contract.id ? '...' : 'Jóváhagyás'}
                                </button>
                            </>
                        )}

                        {contract.status === 'pending_company' && contract.signing_token && (
                            <div className="flex flex-col items-end gap-2">
                                <span className="text-xs text-yellow-600 font-bold uppercase tracking-wider bg-yellow-100 px-2 py-1 rounded">
                                    Aláírásra Vár
                                </span>
                                <button
                                    onClick={() => handleCopyLink(contract.signing_token!, contract.id)}
                                    className={`text-sm font-medium flex items-center gap-1 border px-3 py-2 rounded-lg transition-all ${copiedId === contract.id
                                        ? 'bg-green-50 text-green-700 border-green-200'
                                        : 'bg-blue-50 text-blue-600 hover:text-blue-800 border-blue-200 hover:bg-blue-100'
                                        }`}
                                >
                                    {copiedId === contract.id ? (
                                        <>✅ Másolva!</>
                                    ) : (
                                        <>🔗 Link Másolása</>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            ))}

            {/* Confirmation Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 animate-in zoom-in-95 duration-200">
                        <h3 className="text-lg font-bold text-gray-800 mb-2">
                            {modalAction === 'approve' ? 'Kérelem Jóváhagyása' : 'Kérelem Elutasítása'}
                        </h3>
                        <p className="text-gray-600 mb-6">
                            {modalAction === 'approve'
                                ? 'Biztosan jóváhagyod ezt a kérelmet? A státusz "Várakozás a Cégre" lesz.'
                                : 'Biztosan elutasítod ezt a kérelmet? A diák értesítést kap róla.'}
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Mégsem
                            </button>
                            <button
                                onClick={confirmAction}
                                className={`px-4 py-2 text-white font-medium rounded-lg transition-colors ${modalAction === 'approve' ? 'bg-[var(--kreta-blue)] hover:bg-blue-700' : 'bg-red-500 hover:bg-red-600'
                                    }`}
                            >
                                {modalAction === 'approve' ? 'Jóváhagyás' : 'Elutasítás'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
