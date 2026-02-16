'use client'

import { updateLogStatus } from './actions'
import { useState } from 'react'

export function LogActionButtons({ logId }: { logId: string }) {
    const [loading, setLoading] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null)
    const [rejectionReason, setRejectionReason] = useState('')

    const openModal = (type: 'approve' | 'reject') => {
        setActionType(type)
        setRejectionReason('')
        setShowModal(true)
    }

    const closeModal = () => {
        setShowModal(false)
        setActionType(null)
        setRejectionReason('')
    }

    const handleConfirm = async () => {
        if (!actionType) return

        if (actionType === 'reject' && !rejectionReason.trim()) {
            alert('Kérjük, adja meg az elutasítás okát!')
            return
        }

        setLoading(true)
        try {
            if (actionType === 'approve') {
                await updateLogStatus(logId, 'approved')
            } else {
                await updateLogStatus(logId, 'rejected', rejectionReason)
            }
            closeModal()
        } catch (e) {
            alert('Hiba történt a művelet során.')
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return <span className="text-gray-400 text-xs animate-pulse">Feldolgozás...</span>
    }

    return (
        <>
            <div className="flex justify-center gap-2">
                <button
                    onClick={() => openModal('approve')}
                    className="bg-green-100 hover:bg-green-200 text-green-700 p-2 rounded-full transition-colors"
                    title="Jóváhagyás"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                </button>
                <button
                    onClick={() => openModal('reject')}
                    className="bg-red-100 hover:bg-red-200 text-red-700 p-2 rounded-full transition-colors"
                    title="Elutasítás"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
                        <h3 className={`text-lg font-bold mb-4 ${actionType === 'approve' ? 'text-green-600' : 'text-red-600'}`}>
                            {actionType === 'approve' ? 'Bejegyzés Jóváhagyása' : 'Bejegyzés Elutasítása'}
                        </h3>

                        <p className="text-gray-600 mb-4">
                            {actionType === 'approve'
                                ? 'Biztosan jóváhagyja ezt a szolgálati naplóbejegyzést? A diák megkapja a jóváírt órákat.'
                                : 'Kérjük, adja meg az elutasítás okát, hogy a diák tudja, mit kell javítania:'}
                        </p>

                        {actionType === 'reject' && (
                            <textarea
                                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all mb-4 text-sm"
                                rows={3}
                                placeholder="Indoklás..."
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                autoFocus
                            />
                        )}

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={closeModal}
                                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Mégse
                            </button>
                            <button
                                onClick={handleConfirm}
                                className={`px-4 py-2 text-sm font-bold text-white rounded-lg shadow-sm transition-colors ${actionType === 'approve'
                                        ? 'bg-green-600 hover:bg-green-700'
                                        : 'bg-red-600 hover:bg-red-700'
                                    }`}
                            >
                                {actionType === 'approve' ? 'Jóváhagyás' : 'Elutasítás'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
