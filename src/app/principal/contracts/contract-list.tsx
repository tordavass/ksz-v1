'use client'

import { useState } from 'react'
import { CompanyContractStatus, saveContract, finalizeContract } from './actions'
import { createClient } from '@/utils/supabase/client'
import dynamic from 'next/dynamic'

const ContractPDFViewer = dynamic(() => import('@/components/pdf/ContractPDFViewer'), {
    ssr: false,
    loading: () => <span className="text-xs text-gray-400">PDF betöltése...</span>
})

export default function ContractList({ companies }: { companies: CompanyContractStatus[] }) {
    const [selectedCompany, setSelectedCompany] = useState<CompanyContractStatus | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [uploading, setUploading] = useState(false)

    const [confirmId, setConfirmId] = useState<string | null>(null)
    const [copiedId, setCopiedId] = useState<string | null>(null)

    const handleCopyLink = (token: string, id: string) => {
        const link = `${window.location.origin}/sign/${token}`
        navigator.clipboard.writeText(link)
        setCopiedId(id)
        setTimeout(() => setCopiedId(null), 2000)
    }

    const handleManage = (company: CompanyContractStatus) => {
        setSelectedCompany(company)
        setIsDialogOpen(true)
    }

    const closeDialog = () => {
        setIsDialogOpen(false)
        setSelectedCompany(null)
    }

    const requestFinalize = (contractId: string) => {
        setConfirmId(contractId)
    }

    const confirmFinalize = async () => {
        if (!confirmId) return
        try {
            await finalizeContract(confirmId)
            // Revalidation handles UI
            setConfirmId(null)
        } catch (e: any) {
            alert(e.message)
        }
    }

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setIsSubmitting(true)
        const formData = new FormData(event.currentTarget)
        const file = (event.currentTarget.elements.namedItem('contract_file') as HTMLInputElement)?.files?.[0]

        try {
            let fileUrl = formData.get('existing_file_url') as string

            if (file) {
                setUploading(true)
                const supabase = createClient()
                const fileExt = file.name.split('.').pop()
                const fileName = `${selectedCompany?.id}-${Date.now()}.${fileExt}`
                const { error: uploadError } = await supabase.storage
                    .from('contracts')
                    .upload(fileName, file)

                if (uploadError) throw new Error('Upload failed: ' + uploadError.message)

                const { data: { publicUrl } } = supabase.storage
                    .from('contracts')
                    .getPublicUrl(fileName)

                fileUrl = publicUrl
                setUploading(false)
            }

            const actionData = new FormData()
            actionData.append('company_id', selectedCompany!.id)
            actionData.append('start_date', formData.get('start_date') as string)
            if (fileUrl) actionData.append('file_url', fileUrl)

            await saveContract(actionData)
            closeDialog()
        } catch (e: any) {
            console.error(e)
            alert(e.message || 'Hiba a szerződés mentésekor')
        } finally {
            setIsSubmitting(false)
            setUploading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="overflow-x-auto bg-white rounded-lg shadow border border-[var(--kreta-grey)]">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-500 border-b border-[var(--kreta-grey)]">
                        <tr>
                            <th className="px-6 py-4 font-medium">Szervezet</th>
                            <th className="px-6 py-4 font-medium">Szerződés Állapota</th>
                            <th className="px-6 py-4 font-medium">Megállapodás Részletei</th>
                            <th className="px-6 py-4 font-medium text-right">Műveletek</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--kreta-grey)]">
                        {companies.map((company) => (
                            <tr key={company.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-medium text-[var(--kreta-text)]">{company.name}</div>
                                    <div className="text-xs text-gray-500">{company.address || 'Nincs cím megadva'}</div>
                                </td>
                                <td className="px-6 py-4">
                                    {company.contract?.status === 'active' ? (
                                        <span className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800">
                                            Aktív Szerződés
                                        </span>
                                    ) : company.contract?.status === 'pending_principal' ? (
                                        <span className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium bg-purple-100 text-purple-800 animate-pulse">
                                            Véglegesítésre Vár
                                        </span>
                                    ) : company.contract?.status === 'pending_company' ? (
                                        <span className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800">
                                            Aláírásra Vár (Cég)
                                        </span>
                                    ) : company.contract?.status === 'pending_teacher' ? (
                                        <span className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800">
                                            Tanári Jóváhagyásra Vár
                                        </span>
                                    ) : (
                                        <span className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-600">
                                            Nincs Szerződés
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-gray-600">
                                    {company.contract ? (
                                        <div className="text-xs space-y-2">
                                            <div>Kezdés: {new Date(company.contract.start_date).toLocaleDateString()}</div>

                                            <ContractPDFViewer
                                                studentName={company.contract.initiator?.full_name || 'Tanuló'}
                                                studentClass={company.contract.initiator?.class_id}
                                                companyName={company.name || company.contract.temp_company_name || 'Cég'}
                                                companyAddress={company.address || company.contract.temp_address}
                                                ownerName={company.contract.signer_name || company.contract.temp_owner_name || 'Tulajdonos'}
                                                date={company.contract.start_date}
                                                status={company.contract.status}
                                            />
                                        </div>
                                    ) : (
                                        <span className="text-gray-400 italic">--</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {company.contract?.status === 'pending_principal' ? (
                                        <button
                                            onClick={() => requestFinalize(company.contract!.id)}
                                            className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-xs font-bold shadow-sm"
                                        >
                                            ✍️ Véglegesítés & Aláírás
                                        </button>
                                    ) : company.contract?.status === 'pending_company' && company.contract.signing_token ? (
                                        <button
                                            onClick={() => handleCopyLink(company.contract!.signing_token!, company.contract!.id)}
                                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-bold transition-all border ${copiedId === company.contract.id
                                                ? 'bg-green-50 text-green-700 border-green-200'
                                                : 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100'
                                                }`}
                                        >
                                            {copiedId === company.contract.id ? '✅ Másolva!' : '🔗 Link Másolása'}
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleManage(company)}
                                            className="text-[var(--kreta-blue)] hover:text-blue-800 font-medium text-sm transition-colors"
                                        >
                                            {company.contract ? (
                                                <span className="flex items-center gap-1.5">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3" /></svg>
                                                    Frissítés
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1.5">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>
                                                    Szerződés Hozzáadása
                                                </span>
                                            )}
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal Dialog for Manual Add/Update */}
            {isDialogOpen && selectedCompany && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 space-y-4">
                        <header>
                            <h3 className="text-lg font-bold text-gray-900">Szerződés Kezelése</h3>
                            <p className="text-sm text-gray-500">{selectedCompany.name} részére</p>
                        </header>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input type="hidden" name="existing_file_url" value={selectedCompany.contract?.file_url || ''} />

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Szerződés Dokumentum (PDF)</label>
                                <input
                                    name="contract_file"
                                    type="file"
                                    accept=".pdf,application/pdf"
                                    className="input-field p-2"
                                />
                                {selectedCompany.contract?.file_url && (
                                    <p className="text-xs text-green-600 mt-1">
                                        ✓ Jelenlegi fájl: <a href={selectedCompany.contract.file_url} target="_blank" className="underline">PDF Megtekintése</a>
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Kezdés Dátuma</label>
                                <input
                                    name="start_date"
                                    type="date"
                                    required
                                    className="input-field"
                                    defaultValue={selectedCompany.contract?.start_date || new Date().toISOString().split('T')[0]}
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={closeDialog}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
                                    disabled={isSubmitting}
                                >
                                    Mégse
                                </button>
                                <button
                                    type="submit"
                                    className="btn-primary"
                                    disabled={isSubmitting}
                                >
                                    {uploading ? 'Feltöltés...' : isSubmitting ? 'Mentés...' : 'Mentés és Aktiválás'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            {confirmId && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 text-center transform transition-all animate-in zoom-in-95 duration-200 border-t-8 border-purple-600">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 mb-4 animate-bounce">
                            <span className="text-3xl">✍️</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Szerződés Véglegesítése</h3>
                        <p className="text-sm text-gray-500 mb-6">
                            Biztosan ellenjegyzed és aktiválod ezt a szerződést? Ez a művelet hivatalossá teszi a megállapodást.
                        </p>
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={() => setConfirmId(null)}
                                className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                            >
                                Mégse
                            </button>
                            <button
                                onClick={confirmFinalize}
                                className="px-5 py-2.5 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 shadow-lg shadow-purple-600/30 transition-all hover:scale-105"
                            >
                                Igen, Aláírom
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
