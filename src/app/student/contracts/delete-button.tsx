'use client'

import { useState } from 'react'
import { deleteContract } from './actions'

export default function DeleteContractButton({ contractId }: { contractId: string }) {
    const [isDeleting, setIsDeleting] = useState(false)

    const [showModal, setShowModal] = useState(false)

    const handleDelete = async () => {
        setIsDeleting(true)
        try {
            await deleteContract(contractId)
            setShowModal(false)
        } catch (error: any) {
            console.error(error)
            alert('Hiba történt a törlés során.') // Fallback for error only
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <>
            <button
                onClick={() => setShowModal(true)}
                disabled={isDeleting}
                className="text-xs text-red-500 hover:text-red-700 hover:underline disabled:opacity-50"
            >
                Kérelem Visszavonása
            </button>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 transform transition-all scale-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Biztosan visszavonod?</h3>
                        <p className="text-sm text-gray-600 mb-6">
                            A kérelem törlése végleges, és nem lehet visszavonni.
                        </p>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                                Mégsem
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition-colors flex items-center gap-2"
                            >
                                {isDeleting ? (
                                    <>
                                        <span className="animate-spin">⏳</span> Törlés...
                                    </>
                                ) : (
                                    'Igen, Visszavonás'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
