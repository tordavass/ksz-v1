'use client'

import { useState } from 'react'
import { searchAllCompanies, submitContractRequest } from './actions'
import { useRouter } from 'next/navigation'

export default function RequestContractForm() {
    const [formData, setFormData] = useState({
        name: '',
        email: ''
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const router = useRouter()

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setIsSubmitting(true)
        setSuccessMessage(null)
        setErrorMessage(null)

        try {
            const templateFileUrl = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'

            const actionData = new FormData()
            actionData.append('file_url', templateFileUrl)

            // Always set as new company flow for this simplified version
            actionData.append('is_new_company', 'true')
            actionData.append('temp_company_name', formData.name)
            actionData.append('temp_company_email', formData.email)

            await submitContractRequest(actionData)

            setSuccessMessage('Kérelem sikeresen elküldve! A szerződés megjelent a listában.')
            setFormData({ name: '', email: '' })
            router.refresh()

            // Auto-clear message after 5s
            setTimeout(() => setSuccessMessage(null), 5000)

        } catch (e: any) {
            console.error(e)
            setErrorMessage(e.message || 'Hiba történt a kérelem beküldésekor.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="card p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
                <h2 className="text-lg font-bold text-gray-800 mb-4">Szerződéskötési Kérelem</h2>
                <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-3 text-sm text-yellow-800 mb-6">
                    Kérjük, add meg a szervezet nevét és email címét. A rendszer erre a címre küldi majd a meghívót.
                </div>

                {successMessage && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4 flex items-center gap-2">
                        <span className="text-xl">✅</span>
                        <p>{successMessage}</p>
                    </div>
                )}

                {errorMessage && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 flex items-center gap-2">
                        <span className="text-xl">⚠️</span>
                        <p>{errorMessage}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Szervezet Neve</label>
                            <input
                                type="text"
                                className="input-field w-full"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Pl. Példa Kft."
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Szervezet Email Címe</label>
                            <input
                                type="email"
                                className="input-field w-full"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                placeholder="kapcsolat@pelda.hu"
                                required
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Küldés...' : 'Kérelem Beküldése'}
                        </button>
                    </div>
                </form>
            </div >
        </div >
    )
}
