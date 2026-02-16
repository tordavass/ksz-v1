'use client'

import { useActionState, useState } from 'react'
import { login } from './actions'
import { Eye, EyeOff } from 'lucide-react'

const initialState = {
    error: '',
}

export default function LoginForm({ initialError }: { initialError?: string }) {
    const [state, formAction, isPending] = useActionState(login, initialState)
    const [showPassword, setShowPassword] = useState(false)

    // Use either the state error (from form submission) or the initial URL error
    const errorMessage = state?.error || initialError

    return (
        <form action={formAction} className="space-y-4">
            {errorMessage && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm text-center animate-in fade-in slide-in-from-top-2">
                    {errorMessage === 'Could not authenticate user' ? 'Hitelesítési hiba. Kérjük jelentkezzen be újra.' :
                        errorMessage === 'Invalid login credentials' ? 'Hibás email cím vagy jelszó.' :
                            errorMessage}
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-gray-700">Email cím</label>
                <input
                    name="email"
                    type="email"
                    required
                    className="input-field"
                    placeholder="pelda@email.com"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Jelszó</label>
                <div className="relative mt-1">
                    <input
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        className="input-field pr-10" // Added padding-right to prevent text overlap with icon
                        placeholder="••••••••"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                    >
                        {showPassword ? (
                            <EyeOff className="h-5 w-5" aria-hidden="true" />
                        ) : (
                            <Eye className="h-5 w-5" aria-hidden="true" />
                        )}
                    </button>
                </div>
            </div>

            <div className="pt-2">
                <button
                    disabled={isPending}
                    className="btn-primary w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isPending ? 'Belépés folyamatban...' : 'Belépés'}
                </button>
            </div>
        </form>
    )
}
