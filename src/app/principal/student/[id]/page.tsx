import { getPrincipalStudentDetails } from '../../actions'
import Link from 'next/link'

export default async function PrincipalStudentPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const data = await getPrincipalStudentDetails(id)

    if (!data) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4">
                <p className="text-gray-500">A tanuló nem található, vagy nincs jogosultságod megtekinteni.</p>
                <Link href="/principal" className="text-[var(--kreta-blue)] hover:underline">
                    &larr; Vissza a vezérlőpultra
                </Link>
            </div>
        )
    }

    const { student, logs, totalHours } = data
    const percent = Math.min(100, (totalHours / 50) * 100)
    // @ts-ignore
    const className = student.classes?.name || 'Ismeretlen Osztály'
    const classId = student.class_id

    return (
        <div className="min-h-screen p-4 md:p-8">
            <div className="mx-auto max-w-4xl space-y-8">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-[var(--kreta-blue)]">{student.full_name}</h1>
                        <p className="text-gray-500">{className}</p>
                    </div>
                    <div className="flex gap-4">
                        {classId && (
                            <Link href={`/principal/class/${classId}`} className="text-sm text-[var(--kreta-blue)] hover:underline flex items-center">
                                &larr; Vissza az Osztályhoz
                            </Link>
                        )}
                        <Link href="/principal" className="text-sm text-gray-500 hover:underline flex items-center">
                            Vezérlőpult
                        </Link>
                    </div>
                </div>

                {/* Progress Card */}
                <div className="card p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex-1 w-full">
                        <div className="flex justify-between mb-2">
                            <span className="font-semibold text-gray-700">Közösségi Szolgálat Állapota</span>
                            <span className="font-bold text-[var(--kreta-blue)]">{totalHours} / 50 Óra</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-4">
                            <div
                                className={`h-4 rounded-full transition-all duration-1000 ${totalHours >= 50 ? 'bg-green-500' : 'bg-[var(--kreta-blue)]'}`}
                                style={{ width: `${percent}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* Logs Table */}
                <div className="card overflow-hidden">
                    <div className="border-b border-[var(--kreta-grey)] bg-gray-50 px-6 py-4">
                        <h3 className="font-semibold text-gray-700">Szolgálati Előzmények</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-white text-gray-500 border-b border-[var(--kreta-grey)]">
                                <tr>
                                    <th className="px-6 py-3 font-medium">Dátum</th>
                                    <th className="px-6 py-3 font-medium">Szervezet</th>
                                    <th className="px-6 py-3 font-medium">Leírás</th>
                                    <th className="px-6 py-3 font-medium text-right">Óra</th>
                                    <th className="px-6 py-3 font-medium text-center">Állapot</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--kreta-grey)] bg-white">
                                {logs?.map((log: any) => (
                                    <tr key={log.id} className="hover:bg-gray-50 text-gray-700">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {new Date(log.date_of_service).toLocaleDateString('hu-HU')}
                                        </td>
                                        <td className="px-6 py-4 font-medium">
                                            {log.companies?.name || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 max-w-xs truncate">
                                            {log.description}
                                            {log.rejection_reason && (
                                                <div className="text-xs text-red-600 italic mt-1">
                                                    "{log.rejection_reason}"
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
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
                                        <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                                            Nincs rögzített szolgálat.
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
