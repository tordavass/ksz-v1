'use client'

import { useState } from 'react'
import Link from 'next/link'
import QRInviteModal from './qr-invite-modal'

type StudentDashboardClientProps = {
    logs: any[]
    totalHours: number
    unreadCount: number
    inviteToken?: string
}

export default function StudentDashboardClient({ logs, totalHours, unreadCount, inviteToken }: StudentDashboardClientProps) {
    const [showQRModal, setShowQRModal] = useState(false)
    const goal = 50
    const progress = Math.min((totalHours / goal) * 100, 100)

    return (
        <div className="min-h-screen p-4 md:p-8">
            <div className="mx-auto max-w-4xl space-y-6">

                {/* Header */}
                <header className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-[var(--kreta-blue)] tracking-tight">Közösségi Szolgálat</h1>
                        <p className="text-sm font-medium text-gray-500">Tanulói Felület</p>
                    </div>
                    <div className="flex items-center gap-4">
                        {inviteToken && (
                            <button
                                onClick={() => setShowQRModal(true)}
                                className="px-3 py-2 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                                title="Szülő meghívása"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="5" height="5" x="3" y="3" rx="1" /><rect width="5" height="5" x="16" y="3" rx="1" /><rect width="5" height="5" x="3" y="16" rx="1" /><path d="M21 16h-3a2 2 0 0 0-2 2v3" /><path d="M21 21v.01" /><path d="M12 7v3a2 2 0 0 1-2 2H7" /><path d="M3 12h.01" /><path d="M12 3h.01" /><path d="M12 16v.01" /><path d="M16 12h1" /><path d="M21 12v.01" /><path d="M12 21v-1" /></svg>
                                <span className="hidden sm:inline">Szülő Meghívása</span>
                            </button>
                        )}

                        <Link href="/messages" className="relative group p-2 rounded-full hover:bg-yellow-50 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400 group-hover:text-amber-500"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>

                            {unreadCount > 0 && (
                                <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                            )}
                        </Link>
                        <Link href="/" className="px-4 py-2 text-sm font-semibold text-[var(--kreta-blue)] bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                            Kezdőlap
                        </Link>
                    </div>
                </header>

                <div className="grid md:grid-cols-3 gap-6">
                    {/* Progress Card */}
                    <div className="card md:col-span-2 p-6 flex flex-col justify-center relative overflow-hidden">
                        <div className="relative z-10">
                            <div className="flex items-end justify-between mb-4">
                                <div>
                                    <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide">Teljesítés Állapota</h2>
                                    <div className="flex items-baseline gap-2 mt-1">
                                        <p className="text-4xl font-bold text-[var(--kreta-blue)] tracking-tight">{totalHours}</p>
                                        <span className="text-lg font-medium text-gray-400">/ {goal} óra</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-3xl font-bold text-gray-800">{Math.round(progress)}%</span>
                                </div>
                            </div>

                            {/* Range Bar */}
                            <div className="h-3 w-full rounded-full bg-gray-100 overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-[var(--kreta-blue)] to-blue-400 transition-all duration-1000 ease-out rounded-full"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            {progress >= 100 && (
                                <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 text-sm font-semibold rounded-full">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                    Teljesítetted az előírt óraszámot!
                                </div>
                            )}
                        </div>
                        {/* Decorative Background Blob */}
                        <div className="absolute -right-10 -top-10 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl -z-0"></div>
                    </div>

                    {/* Quick Actions Card */}
                    <div className="card p-6 flex flex-col justify-center space-y-3">
                        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-2">Műveletek</h2>
                        <Link href="/student/new" className="w-full flex items-center justify-center gap-2 bg-[var(--kreta-blue)] text-white px-4 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                            Új Bejegyzés
                        </Link>
                        <div className="grid grid-cols-2 gap-3">
                            <Link href="/student/companies" className="flex flex-col items-center justify-center p-3 rounded-xl border border-gray-100 hover:border-blue-100 hover:bg-blue-50/50 transition-all text-center">
                                <span className="text-2xl mb-1">🏢</span>
                                <span className="text-xs font-semibold text-gray-600">Szervezetek</span>
                            </Link>
                            <Link href="/student/contracts" className="flex flex-col items-center justify-center p-3 rounded-xl border border-gray-100 hover:border-blue-100 hover:bg-blue-50/50 transition-all text-center">
                                <span className="text-2xl mb-1">📄</span>
                                <span className="text-xs font-semibold text-gray-600">Szerződések</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Logs List */}
                <div className="card overflow-hidden">
                    <div className="border-b border-[var(--kreta-grey)] bg-gray-50 px-6 py-4">
                        <h3 className="font-semibold text-gray-700">Szolgálati Előzmények</h3>
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
                                            {log.rejection_reason && (
                                                <div className="text-xs text-red-600 mt-1">
                                                    Indoklás: {log.rejection_reason}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right font-medium">
                                            {log.hours_worked}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium 
                                            ${log.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                        log.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                            'bg-yellow-100 text-yellow-800'}`}>
                                                    {log.status === 'approved' ? 'Jóváhagyva' :
                                                        log.status === 'rejected' ? 'Elutasítva' : 'Függőben'}
                                                </span>

                                                {log.status === 'pending' && (
                                                    <Link href={`/student/edit/${log.id}`} className="text-xs text-[var(--kreta-blue)] hover:underline flex items-center gap-1">
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                                                        Szerkesztés
                                                    </Link>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {logs?.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                                            Még nincs rögzített tevékenység. Kezdj hozzá most!
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            {/* QR Modal */}
            {showQRModal && inviteToken && (
                <QRInviteModal inviteToken={inviteToken} onClose={() => setShowQRModal(false)} />
            )}
        </div>
    )
}
