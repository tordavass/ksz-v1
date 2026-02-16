'use client'

import { useState } from 'react'
import { sendMessage } from '../messages/actions'

export default function MessageModal({
    recipientId,
    recipientName,
    onClose
}: {
    recipientId: string,
    recipientName: string,
    onClose: () => void
}) {
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        await sendMessage(formData)
        setLoading(false)
        setSuccess(true)

        // Auto-close after 1.5s
        setTimeout(() => {
            onClose()
        }, 1500)
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">

                {success ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center animate-in fade-in slide-in-from-bottom-2">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <span className="text-3xl">✅</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Üzenet elküldve!</h3>
                        <p className="text-gray-500">A címzett hamarosan megkapja.</p>
                    </div>
                ) : (
                    <>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-800">Üzenet küldése</h3>
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">&times;</button>
                        </div>

                        <p className="text-sm text-gray-500 mb-4">
                            Címzett: <span className="font-semibold text-[var(--kreta-blue)]">{recipientName}</span>
                        </p>

                        <form action={handleSubmit} className="space-y-4">
                            <input type="hidden" name="recipient_id" value={recipientId} />

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tárgy</label>
                                <input name="subject" required className="input-field" placeholder="Pl. Figyelmeztetés" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Üzenet</label>
                                <textarea name="body" required rows={4} className="input-field" placeholder="Írd ide az üzenetet..." />
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button type="button" onClick={onClose} className="btn-secondary">Mégse</button>
                                <button disabled={loading} className="btn-primary">
                                    {loading ? 'Küldés...' : 'Küldés'}
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    )
}
