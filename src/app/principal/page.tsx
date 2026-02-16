import { getSchoolStats } from './actions'
import { CompletionChart, ClassPerformanceChart } from './charts'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function PrincipalDashboard() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const stats = await getSchoolStats()

    if (!stats) {
        return (
            <div className="min-h-screen p-8 flex flex-col items-center justify-center text-center">
                <h1 className="text-2xl font-bold text-gray-700">Error Loading Data</h1>
                <p className="text-gray-500 mt-2">Could not fetch school statistics.</p>
                <Link href="/" className="mt-6 text-[var(--kreta-blue)] hover:underline">Return Home</Link>
            </div>
        )
    }

    const { totalStudents, totalHours, completionRate, pendingCount, classLeaderboard, unreadCount } = stats

    return (
        <div className="min-h-screen p-4 md:p-8">
            <div className="mx-auto max-w-6xl space-y-8">

                {/* Header */}
                <header className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-[var(--kreta-blue)]">Iskolai Áttekintés</h1>
                        <p className="text-sm text-gray-500">Igazgatói Oldal</p>
                    </div>
                    <div className="flex gap-4 items-center">
                        <Link href="/messages" className="relative group p-2 rounded-full hover:bg-yellow-50 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400 group-hover:text-amber-500"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
                            {unreadCount > 0 && (
                                <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                            )}
                        </Link>

                        <Link href="/" className="text-sm text-[var(--kreta-blue)] hover:underline">
                            Kezdőlap
                        </Link>
                        <Link
                            href="/principal/contracts"
                            className="bg-white text-[var(--kreta-blue)] border border-[var(--kreta-blue)] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-50 transition-colors"
                        >
                            📜 Szerződések Kezelése
                        </Link>
                        <Link
                            href="/principal/companies"
                            className="bg-[var(--kreta-blue)] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
                        >
                            🏢 Szervezetek
                        </Link>
                    </div>
                </header>

                {/* KPI Cards & Charts Row - Desktop: Fixed Height & Custom Cols */}
                <div className="flex flex-col md:grid md:grid-cols-[0.7fr_1fr_1fr] gap-4 md:h-[280px]">

                    {/* Stats Column - 3 Equal Rows */}
                    <div className="grid grid-rows-3 gap-3 h-full">
                        <div className="card px-4 py-3 border-l-4 border-[var(--kreta-blue)] flex flex-col justify-center">
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Összes Tanuló</p>
                            <p className="text-2xl font-bold text-gray-800 mt-1 leading-none">{totalStudents}</p>
                        </div>
                        <div className="card px-4 py-3 border-l-4 border-green-500 flex flex-col justify-center">
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Összes Rögzített Óra</p>
                            <p className="text-2xl font-bold text-gray-800 mt-1 leading-none">{totalHours.toLocaleString()}</p>
                        </div>
                        <div className={`card px-4 py-3 border-l-4 ${pendingCount > 0 ? 'border-yellow-500' : 'border-gray-300'} flex flex-col justify-center`}>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Rendszer Elakadások</p>
                            <div className="flex items-baseline gap-2 mt-1 leading-none">
                                <p className="text-2xl font-bold text-gray-800">{pendingCount}</p>
                                <span className="text-[10px] text-gray-400 font-medium">Függőben</span>
                            </div>
                        </div>
                    </div>

                    {/* Completion Pie Chart */}
                    <div className="card p-4 flex flex-col items-center justify-center h-full min-h-[250px]">
                        <h3 className="text-gray-400 font-bold mb-2 uppercase text-[10px] tracking-wide shrink-0">Iskolai Teljesítés</h3>
                        <div className="w-full h-48">
                            <CompletionChart rate={completionRate} />
                        </div>
                    </div>

                    {/* Top Classes Bar Chart */}
                    <div className="card p-4 flex flex-col h-full min-h-[250px]">
                        <h3 className="text-gray-400 font-bold mb-2 uppercase text-[10px] tracking-wide shrink-0">Top 5 Osztály (Átlagóra)</h3>
                        <div className="w-full h-48">
                            <ClassPerformanceChart data={classLeaderboard} />
                        </div>
                    </div>
                </div>

                {/* Class Leaderboard */}
                <div className="card overflow-hidden">
                    <div className="border-b border-[var(--kreta-grey)] bg-gray-50 px-6 py-4 flex justify-between items-center">
                        <h3 className="font-semibold text-gray-700">Osztályok Teljesítménye</h3>
                        <span className="text-xs text-gray-500">Tanulónkénti átlagos óraszám alapján</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-white text-gray-500 border-b border-[var(--kreta-grey)]">
                                <tr>
                                    <th className="px-6 py-3 font-medium w-16 text-center">Helyezés</th>
                                    <th className="px-6 py-3 font-medium">Osztály</th>
                                    <th className="px-6 py-3 font-medium text-right">Tanulók</th>
                                    <th className="px-6 py-3 font-medium text-right">Összes Óra</th>
                                    <th className="px-6 py-3 font-medium text-right">Átlagos Óra</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--kreta-grey)] bg-white">
                                {classLeaderboard.map((cls, index) => (
                                    <tr key={cls.name} className="hover:bg-gray-50 group">
                                        <td className="px-6 py-4 text-center font-bold text-gray-400">
                                            {index + 1}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-[var(--kreta-text)]">
                                            <Link href={`/principal/class/${cls.id}`} className="text-[var(--kreta-blue)] font-medium block w-full h-full">
                                                {cls.name}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4 text-right text-gray-600">
                                            {cls.studentCount}
                                        </td>
                                        <td className="px-6 py-4 text-right font-medium text-gray-700">
                                            {cls.totalHours}
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-[var(--kreta-blue)]">
                                            {cls.avgHours.toFixed(1)}
                                        </td>
                                    </tr>
                                ))}
                                {classLeaderboard.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                                            Nincs osztály adat.
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
