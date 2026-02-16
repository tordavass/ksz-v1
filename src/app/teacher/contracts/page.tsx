import { getTeacherContracts, approveContract, rejectContract } from './actions'
import ContractList from './contract-list' // We will create this client component
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function TeacherContractsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const contracts = await getTeacherContracts()

    return (
        <div className="min-h-screen p-4 md:p-8 bg-gray-50">
            <div className="mx-auto max-w-4xl space-y-8">
                {/* Header */}
                <header className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-[var(--kreta-blue)]">Szerződések Jóváhagyása</h1>
                        <p className="text-sm text-gray-500">Tanulói kérelmek ellenőrzése (1. lépés)</p>
                    </div>
                    <Link href="/teacher" className="text-sm text-[var(--kreta-blue)] hover:underline">
                        ← Vissza a Tanári Oldalra
                    </Link>
                </header>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
                    <span className="font-bold">Folyamat:</span> Itt hagyhatod jóvá a diákok szerződéskötési kérelmeit. Jóváhagyás után a kérelem továbbítódik a céghez aláírásra.
                </div>

                <ContractList initialContracts={contracts} />
            </div>
        </div>
    )
}
