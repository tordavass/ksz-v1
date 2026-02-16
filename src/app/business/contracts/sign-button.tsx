'use client'

import { useState } from 'react'
import { signContract } from './actions'

export default function SignButton({ contractId }: { contractId: string }) {
    const [loading, setLoading] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSign = async () => {
        setLoading(true)
        setError(null)
        try {
            await signContract(contractId)
            setShowModal(false)
        } catch (e: any) {
            setError(e.message || 'Hiba történt az aláírás során.')
            setLoading(false)
        }
    }

    return (
        <>
            <button
                onClick={() => setShowModal(true)}
                disabled={loading}
                className="btn-primary bg-green-600 hover:bg-green-700 disabled:opacity-50 transition-colors shadow-sm"
            >
                ✍️ Megállapodás Aláírása
            </button>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Megállapodás Aláírása</h3>

                        <p className="text-gray-600 mb-6 leading-relaxed">
                            Az aláírással kijelenti, hogy a tanulót a hatályos jogszabályoknak és az iskolai feltételeknek megfelelően fogadja, és a közösségi szolgálat teljesítését felügyeli.
                        </p>

                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 border border-red-100 flex items-center gap-2">
                                ⚠️ {error}
                            </div>
                        )}

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => { setShowModal(false); setError(null); }}
                                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                disabled={loading}
                            >
                                Mégse
                            </button>
                            <button
                                onClick={handleSign}
                                disabled={loading}
                                className="px-4 py-2 text-sm font-bold text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-sm transition-colors flex items-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                        Aláírás...
                                    </>
                                ) : (
                                    'Elfogadom és Aláírom'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
