import { getPrincipalCompanies } from '../actions'
import CompanyList from './company-list'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function PrincipalCompaniesPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const companies = await getPrincipalCompanies()

    return (
        <div className="min-h-screen p-4 md:p-8">
            <div className="mx-auto max-w-6xl space-y-8">
                {/* Header */}
                <header className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-[var(--kreta-blue)]">Szervezetek Kezelése</h1>
                        <p className="text-sm text-gray-500">Közösségi szolgálati helyek felügyelete és tiltása.</p>
                    </div>
                    <Link href="/principal" className="text-sm text-[var(--kreta-blue)] hover:underline">
                        ← Vissza az Igazgatói Oldalra
                    </Link>
                </header>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-[var(--kreta-blue)]">
                    <span className="font-bold">Info:</span> A "Tiltás" gombbal elrejtheted a szervezetet a diákok elől. A tiltott szervezetek nem jelennek meg a tanulók szerződéskötési listájában.
                </div>

                <CompanyList initialCompanies={companies} />
            </div>
        </div>
    )
}
