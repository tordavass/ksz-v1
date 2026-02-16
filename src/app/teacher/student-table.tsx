'use client'

import { useState } from 'react'
import Link from 'next/link'
import MessageModal from './message-modal'

type Student = {
    id: string
    full_name: string | null
    total_hours: number
}

type SortConfig = {
    key: 'name' | 'progress' | 'status'
    direction: 'asc' | 'desc'
}

export default function StudentTable({ students }: { students: Student[] }) {
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'name', direction: 'asc' })
    const [messageTarget, setMessageTarget] = useState<{ id: string, name: string } | null>(null)

    const handleSort = (key: SortConfig['key']) => {
        setSortConfig(current => ({
            key,
            direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
        }))
    }

    const sortedStudents = [...students].sort((a, b) => {
        const { key, direction } = sortConfig
        const modifier = direction === 'asc' ? 1 : -1

        if (key === 'name') {
            return (a.full_name || '').localeCompare(b.full_name || '') * modifier
        }

        if (key === 'progress') {
            return (a.total_hours - b.total_hours) * modifier
        }

        if (key === 'status') {
            const aComplete = a.total_hours >= 50
            const bComplete = b.total_hours >= 50
            return (Number(aComplete) - Number(bComplete)) * modifier
        }

        return 0
    })

    const SortIcon = ({ columnKey }: { columnKey: SortConfig['key'] }) => {
        if (sortConfig.key !== columnKey) return <span className="text-gray-300 ml-1">⇅</span>
        return <span className="ml-1 text-[var(--kreta-blue)]">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
    }

    return (
        <>
            {messageTarget && (
                <MessageModal
                    recipientId={messageTarget.id}
                    recipientName={messageTarget.name}
                    onClose={() => setMessageTarget(null)}
                />
            )}

            <div className="card overflow-hidden">
                <div className="border-b border-[var(--kreta-grey)] bg-gray-50 px-6 py-4">
                    <h3 className="font-semibold text-gray-700">Diákok Előrehaladása</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white text-gray-500 border-b border-[var(--kreta-grey)]">
                            <tr>
                                <th
                                    className="px-6 py-3 font-medium cursor-pointer hover:bg-gray-50 select-none"
                                    onClick={() => handleSort('name')}
                                >
                                    Tanuló Neve <SortIcon columnKey="name" />
                                </th>
                                <th
                                    className="px-6 py-3 font-medium cursor-pointer hover:bg-gray-50 select-none w-1/3"
                                    onClick={() => handleSort('progress')}
                                >
                                    Előrehaladás (50 óra) <SortIcon columnKey="progress" />
                                </th>
                                <th
                                    className="px-6 py-3 font-medium cursor-pointer hover:bg-gray-50 select-none text-right"
                                    onClick={() => handleSort('progress')}
                                >
                                    Teljesítve
                                </th>
                                <th
                                    className="px-6 py-3 font-medium cursor-pointer hover:bg-gray-50 select-none text-center"
                                    onClick={() => handleSort('status')}
                                >
                                    Állapot <SortIcon columnKey="status" />
                                </th>
                                <th className="px-6 py-3 font-medium text-center">Műveletek</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--kreta-grey)] bg-white">
                            {sortedStudents.map((student) => {
                                const percent = Math.min(100, (student.total_hours / 50) * 100)
                                const isComplete = student.total_hours >= 50

                                return (
                                    <tr key={student.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-[var(--kreta-text)]">
                                            {student.full_name}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                <div
                                                    className={`h-2.5 rounded-full transition-all duration-500 ${isComplete ? 'bg-green-500' : 'bg-[var(--kreta-blue)]'}`}
                                                    style={{ width: `${percent}%` }}
                                                ></div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="font-semibold">{student.total_hours}</span> / 50
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {isComplete ? (
                                                <span className="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800">
                                                    Teljesítve
                                                </span>
                                            ) : (
                                                <span className="inline-flex rounded-full bg-yellow-100 px-2 text-xs font-semibold leading-5 text-yellow-800">
                                                    Folyamatban
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => setMessageTarget({ id: student.id, name: student.full_name || '' })}
                                                className="text-gray-500 hover:text-[var(--kreta-blue)] p-1 transition-colors"
                                                title="Üzenet küldése"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                                            </button>
                                            <div className="h-4 w-px bg-gray-300 mx-1"></div>
                                            <Link href={`/teacher/student/${student.id}`} className="text-[var(--kreta-blue)] hover:underline text-sm font-medium">
                                                Megtekintés
                                            </Link>
                                        </td>
                                    </tr>
                                )
                            })}
                            {sortedStudents.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                                        Nincsenek tanulók ebben az osztályban.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    )
}
