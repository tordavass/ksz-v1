'use client'

import { useActionState, useState } from 'react'
import { registerParent } from './actions'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

const initialState = {
    error: '',
}

export default function ParentRegisterPage() {
    const searchParams = useSearchParams()
    const token = searchParams.get('token')
    const [state, formAction, isPending] = useActionState(registerParent, initialState)

    if (!token) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
                <div className="w-full max-w-md rounded-lg bg-white p-8 shadow text-center">
                    <div className="text-red-500 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Érvénytelen Meghívó</h2>
                    <p className="text-gray-600 mb-6">Hiányzik a meghívó kód (token). Kérjük, olvasd be újra a QR kódot a tanulói felületről.</p>
                    <Link href="/login" className="text-[var(--kreta-blue)] hover:underline">Vissza a bejelentkezéshez</Link>
                </div>
            </div>
        )
    }

    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-[var(--kreta-blue)]">Szülői Regisztráció</h1>
                    <p className="text-sm text-gray-500 mt-2">Készíts fiókot a gyermeked követéséhez</p>
                </div>

                <form action={formAction} className="space-y-6">
                    <input type="hidden" name="token" value={token} />

                    {state?.error && (
                        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700 border border-red-200">
                            {state.error}
                        </div>
                    )}

                    <div>
                        <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">Teljes Név</label>
                        <input
                            id="full_name"
                            name="full_name"
                            type="text"
                            required
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[var(--kreta-blue)] focus:outline-none focus:ring-[var(--kreta-blue)] sm:text-sm"
                            placeholder="Pl. Szabó István"
                        />
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Cím</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[var(--kreta-blue)] focus:outline-none focus:ring-[var(--kreta-blue)] sm:text-sm"
                            placeholder="pelda@email.hu"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Jelszó</label>
                        <div className="relative mt-1">
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                required
                                minLength={6}
                                className="block w-full rounded-md border border-gray-300 px-3 py-2 pr-10 shadow-sm focus:border-[var(--kreta-blue)] focus:outline-none focus:ring-[var(--kreta-blue)] sm:text-sm"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-[var(--kreta-blue)] focus:outline-none"
                            >
                                {showPassword ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                )}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700">Jelszó Megerősítése</label>
                        <div className="relative mt-1">
                            <input
                                id="confirm_password"
                                name="confirm_password"
                                type={showConfirmPassword ? "text" : "password"}
                                required
                                minLength={6}
                                className="block w-full rounded-md border border-gray-300 px-3 py-2 pr-10 shadow-sm focus:border-[var(--kreta-blue)] focus:outline-none focus:ring-[var(--kreta-blue)] sm:text-sm"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-[var(--kreta-blue)] focus:outline-none"
                            >
                                {showConfirmPassword ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                )}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full flex justify-center rounded-lg border border-transparent bg-[var(--kreta-blue)] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
                    >
                        {isPending ? 'Regisztráció...' : 'Regisztráció'}
                    </button>

                    <div className="text-center text-sm">
                        <span className="text-gray-500">Van már fiókod? </span>
                        <Link href="/login" className="font-medium text-[var(--kreta-blue)] hover:text-blue-500">
                            Bejelentkezés
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    )
}
