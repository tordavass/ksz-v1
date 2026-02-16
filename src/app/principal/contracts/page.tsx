import { getCompaniesWithContracts } from './actions'
import ContractList from './contract-list'
import Link from 'next/link'

export default async function ContractsPage() {
    const companies = await getCompaniesWithContracts()

    return (
        <div className="min-h-screen p-4 md:p-8 bg-gray-50">
            <div className="mx-auto max-w-6xl">
                <header className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-[var(--kreta-blue)]">Szerződések Kezelése</h1>
                        <p className="text-sm text-gray-500">Az iskola és a szervezetek közötti hivatalos megállapodások kezelése.</p>
                    </div>
                    <Link href="/principal" className="text-sm text-[var(--kreta-blue)] hover:underline">
                        ← Vissza az Igazgatói Oldalra
                    </Link>
                </header>

                <ContractList companies={companies} />
            </div>
        </div>
    )
}
