import { createServiceLog, getCompanies } from '../actions'
import Link from 'next/link'

export default async function NewLogPage() {
    const companies = await getCompanies()

    return (
        <div className="min-h-screen p-4 md:p-8 flex justify-center">
            <div className="w-full max-w-lg space-y-6">

                <header>
                    <Link href="/student" className="text-sm text-[var(--kreta-blue)] hover:underline mb-2 block">
                        ← Vissza a Tanulói Oldalra
                    </Link>
                    <h1 className="text-2xl font-bold">Közösségi Szolgálat Rögzítése</h1>
                </header>

                <div className="card p-6">
                    <form action={createServiceLog as any} className="space-y-4">

                        {/* Company Selection */}
                        <div>
                            <label className="block text-sm font-medium mb-1">Szervezet / Intézmény</label>
                            {companies && companies.length > 0 ? (
                                <select name="company_id" required defaultValue="" className="input-field bg-white">
                                    <option value="" disabled>Válassz Szervezetet</option>
                                    {companies.map((c: any) => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            ) : (
                                <div className="rounded-md bg-yellow-50 p-3 text-sm text-yellow-700">
                                    Nincsenek elérhető szervezetek. Kérj szerződéskötést vagy jelezd az adminisztrátornak!
                                </div>
                            )}
                        </div>



                        {/* Date */}
                        <div>
                            <label className="block text-sm font-medium mb-1">Tevékenység Dátuma</label>
                            <input
                                name="date"
                                type="date"
                                required
                                className="input-field"
                            />
                        </div>

                        {/* Hours */}
                        <div>
                            <label className="block text-sm font-medium mb-1">Ledolgozott Órák</label>
                            <input
                                name="hours"
                                type="number"
                                step="0.5"
                                min="0.5"
                                max="24"
                                required
                                className="input-field"
                                placeholder="pl. 4.0"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium mb-1">Tevékenység Leírása</label>
                            <textarea
                                name="description"
                                rows={3}
                                required
                                className="input-field"
                                placeholder="Mit csináltál pontosan?"
                            />
                        </div>

                        <div className="pt-4">
                            <button type="submit" className="btn-primary w-full">
                                Naplóbejegyzés Mentése
                            </button>
                        </div>

                    </form>
                </div>

            </div>
        </div>
    )
}
