import { getChildLogs, getChildProfile } from '../../actions'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function ChildViewPage({ params }: { params: { id: string } }) {
    const { id } = await params

    // Fetch data
    let data;
    try {
        data = await getChildLogs(id)
    } catch (e) {
        redirect('/parent')
    }

    const { logs, totalHours } = data
    const profile = await getChildProfile(id)
    const goal = 50
    const progress = Math.min((totalHours / goal) * 100, 100)

    return (
        <div className="min-h-screen p-4 md:p-8 bg-gray-50">
            <div className="mx-auto max-w-4xl space-y-6">

                {/* Header */}
                <header className="flex items-center justify-between">
                    <div>
                        <Link href="/parent" className="text-sm text-[var(--kreta-blue)] hover:underline mb-2 block">
                            ← Vissza a gyermekekhez
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-800">
                            {profile?.full_name} <span className="text-gray-400 font-normal">| {profile?.classes?.name}</span>
                        </h1>
                    </div>
                </header>

                {/* Progress Card */}
                <div className="card p-6">
                    <div className="flex items-end justify-between mb-2">
                        <div>
                            <h2 className="text-lg font-semibold">Teljesítés</h2>
                            <p className="text-3xl font-bold text-[var(--kreta-blue)]">
                                {totalHours} <span className="text-base font-normal text-gray-500">/ {goal} óra</span>
                            </p>
                        </div>
                        <div className="text-right">
                            <span className="text-2xl font-bold">{Math.round(progress)}%</span>
                        </div>
                    </div>
                    <div className="h-4 w-full rounded-full bg-gray-200 overflow-hidden">
                        <div
                            className="h-full bg-[var(--kreta-blue)] transition-all duration-500 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Logs List - Read Only */}
                <div className="card overflow-hidden">
                    <div className="border-b border-[var(--kreta-grey)] bg-gray-50 px-6 py-4">
                        <h3 className="font-semibold text-gray-700">Szolgálati Napló (Csak megtekintés)</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-white text-gray-500 border-b border-[var(--kreta-grey)]">
                                <tr>
                                    <th className="px-6 py-3 font-medium">Dátum</th>
                                    <th className="px-6 py-3 font-medium">Szervezet/Leírás</th>
                                    <th className="px-6 py-3 font-medium text-right">Óra</th>
                                    <th className="px-6 py-3 font-medium text-center">Állapot</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--kreta-grey)] bg-white">
                                {logs?.map((log: any) => (
                                    <tr key={log.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {new Date(log.date_of_service).toLocaleDateString('hu-HU')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-[var(--kreta-text)]">
                                                {log.companies?.name || 'Független'}
                                            </div>
                                            <div className="text-xs text-gray-500 truncate max-w-[200px]">
                                                {log.description}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right font-medium">
                                            {log.hours_worked}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium 
                                        ${log.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                    log.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                        'bg-yellow-100 text-yellow-800'}`}>
                                                {log.status === 'approved' ? 'Jóváhagyva' :
                                                    log.status === 'rejected' ? 'Elutasítva' : 'Függőben'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {logs?.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                                            Nincs rögzített adat.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    )
}
