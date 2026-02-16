'use client'

import { useState } from 'react'

type QRInviteModalProps = {
    inviteToken: string
    onClose: () => void
}

export default function QRInviteModal({ inviteToken, onClose }: QRInviteModalProps) {
    const [copied, setCopied] = useState(false)

    // In production, this would be the actual domain
    // For local dev, we use window.location.origin
    const inviteUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/register/parent?token=${inviteToken}`
        : `/register/parent?token=${inviteToken}`

    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(inviteUrl)}`

    const handleCopy = () => {
        navigator.clipboard.writeText(inviteUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                <div className="text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--kreta-blue)]"><path d="M3 7V5a2 2 0 0 1 2-2h2" /><path d="M17 3h2a2 2 0 0 1 2 2v2" /><path d="M21 17v2a2 2 0 0 1-2 2h-2" /><path d="M7 21H5a2 2 0 0 1-2-2v-2" /><rect x="7" y="7" width="10" height="10" rx="1" /></svg>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Szülő Meghívása</h3>
                    <p className="mt-2 text-sm text-gray-500">
                        Olvasd be ezt a QR kódot a szülő telefonjával, vagy küldd el neki a linket.
                    </p>
                </div>

                <div className="mt-6 flex justify-center">
                    <img
                        src={qrImageUrl}
                        alt="QR Kód"
                        className="h-48 w-48 rounded-lg border-2 border-dashed border-gray-200 p-2"
                        width={200}
                        height={200}
                    />
                </div>

                <div className="mt-6">
                    <div className="relative rounded-md shadow-sm">
                        <input
                            type="text"
                            readOnly
                            value={inviteUrl}
                            className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-xs text-gray-500 bg-gray-50 focus:border-[var(--kreta-blue)] focus:ring-[var(--kreta-blue)]"
                        />
                        <button
                            onClick={handleCopy}
                            className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-[var(--kreta-blue)]"
                            title="Másolás"
                        >
                            {copied ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><path d="M20 6 9 17l-5-5" /></svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>
                            )}
                        </button>
                    </div>
                </div>

                <div className="mt-6">
                    <button
                        type="button"
                        className="w-full inline-flex justify-center rounded-lg border border-transparent bg-[var(--kreta-blue)] px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                        onClick={onClose}
                    >
                        Rendben
                    </button>
                </div>
            </div>
        </div>
    )
}
