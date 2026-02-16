'use client'

import { setRoleCookie } from './actions'
import { useState } from 'react'

export default function SelectRolePage() {
    const [isLoading, setIsLoading] = useState(false)

    const handleSelect = async (role: 'business_owner' | 'business_contact') => {
        setIsLoading(true)
        await setRoleCookie(role)
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-4xl w-full">
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-bold text-[var(--kreta-blue)] mb-4">Üdvözöljük a Rendszerben!</h1>
                    <p className="text-gray-600 text-lg">Ön kettős jogosultsággal rendelkezik (Cégvezető és Kapcsolattartó).</p>
                    <p className="text-gray-600">Kérjük, válassza ki, milyen minőségben szeretne belépni:</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Owner Card */}
                    <button
                        disabled={isLoading}
                        onClick={() => handleSelect('business_owner')}
                        className="group relative bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all border border-gray-200 hover:border-indigo-500 text-left disabled:opacity-50 disabled:cursor-wait"
                    >
                        <div className="absolute top-4 right-4 text-4xl opacity-10 group-hover:opacity-100 transition-opacity">🏢</div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2 group-hover:text-indigo-600">Cégvezetői Felület</h2>
                        <div className="h-1 w-12 bg-indigo-500 rounded my-4"></div>
                        <ul className="space-y-2 text-gray-600 text-sm">
                            <li className="flex items-center gap-2">✓ Szerződések aláírása</li>
                            <li className="flex items-center gap-2">✓ Szervezeti adatok kezelése</li>
                            <li className="flex items-center gap-2">✓ Kapcsolattartók menedzselése</li>
                        </ul>
                        <div className="mt-8 text-indigo-600 font-semibold group-hover:underline">Belépés vezetőként →</div>
                    </button>

                    {/* Contact Card */}
                    <button
                        disabled={isLoading}
                        onClick={() => handleSelect('business_contact')}
                        className="group relative bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all border border-gray-200 hover:border-blue-500 text-left disabled:opacity-50 disabled:cursor-wait"
                    >
                        <div className="absolute top-4 right-4 text-4xl opacity-10 group-hover:opacity-100 transition-opacity">👥</div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2 group-hover:text-blue-600">Kapcsolattartói Felület</h2>
                        <div className="h-1 w-12 bg-blue-500 rounded my-4"></div>
                        <ul className="space-y-2 text-gray-600 text-sm">
                            <li className="flex items-center gap-2">✓ Diákok igazolása (Naplózás)</li>
                            <li className="flex items-center gap-2">✓ Napi feladatok kezelése</li>
                            <li className="flex items-center gap-2">✓ Üzenetek küldése</li>
                        </ul>
                        <div className="mt-8 text-blue-600 font-semibold group-hover:underline">Belépés kapcsolattartóként →</div>
                    </button>
                </div>

                {isLoading && (
                    <div className="text-center mt-8 text-gray-500 animate-pulse">
                        Átirányítás a választott felületre...
                    </div>
                )}
            </div>
        </div>
    )
}
