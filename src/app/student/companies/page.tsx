import { getCompanies } from '../actions'
import Link from 'next/link'

export default async function ApprovedCompaniesPage() {
    const companies = await getCompanies()

    return (
        <div className="min-h-screen p-4 md:p-8 bg-gray-50">
            <div className="mx-auto max-w-4xl space-y-6">

                {/* Header */}
                <header className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-[var(--kreta-blue)]">Jóváhagyott Szervezetek</h1>
                        <p className="text-sm text-gray-500">Aktív szerződések</p>
                    </div>
                    <Link href="/student" className="text-sm text-[var(--kreta-blue)] hover:underline">
                        ← Vissza a Tanulói Oldalra
                    </Link>
                </header>

                {/* List Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {companies.map((company: any) => {
                        const contract = company.contracts
                        const activeContract = Array.isArray(contract) ? contract[0] : contract

                        return (
                            <div key={company.id} className="card p-6 hover:shadow-md transition-shadow">
                                <h3 className="text-lg font-bold text-gray-800 mb-1">{company.name}</h3>
                                <p className="text-sm text-gray-600 mb-4">{company.address || 'Nincs cím megadva'}</p>

                                <div className="border-t pt-4 flex justify-between items-center">
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        ✓ Aktív Szerződés
                                    </span>

                                    {activeContract?.file_url && (
                                        <a
                                            href={activeContract.file_url}
                                            target="_blank"
                                            className="text-xs font-medium text-[var(--kreta-blue)] hover:underline flex items-center gap-1"
                                        >
                                            📄 Szerződés Megtekintése
                                        </a>
                                    )}
                                </div>
                            </div>
                        )
                    })}

                    {companies.length === 0 && (
                        <div className="col-span-full text-center py-12 text-gray-500">
                            <p className="text-lg">Nincsenek jóváhagyott szervezetek.</p>
                            <p className="text-sm">Kérd az Igazgatót a szerződések rögzítésére.</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    )
}
