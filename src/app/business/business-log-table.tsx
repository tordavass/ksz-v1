'use client'

import { useState } from 'react'
import { LogActionButtons } from './log-action-buttons'

type Log = {
    id: string
    date_of_service: string
    description: string
    hours_worked: number
    status: string
    rejection_reason?: string
    profiles: {
        full_name: string
    }
}

type SortConfig = {
    key: 'date' | 'student' | 'hours' | 'status'
    direction: 'asc' | 'desc'
}

export default function BusinessLogTable({ logs, isPending, isReadOnly }: { logs: any[], isPending?: boolean, isReadOnly?: boolean }) {
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'date', direction: 'desc' })

    const handleSort = (key: SortConfig['key']) => {
        setSortConfig(current => ({
            key,
            direction: current.key === key && current.direction === 'desc' ? 'asc' : 'desc'
        }))
    }

    const sortedLogs = [...logs].sort((a, b) => {
        const { key, direction } = sortConfig
        const modifier = direction === 'asc' ? 1 : -1

        if (key === 'date') {
            return (new Date(a.date_of_service).getTime() - new Date(b.date_of_service).getTime()) * modifier
        }

        if (key === 'student') {
            return (a.profiles?.full_name || '').localeCompare(b.profiles?.full_name || '') * modifier
        }

        if (key === 'hours') {
            return (Number(a.hours_worked) - Number(b.hours_worked)) * modifier
        }

        if (key === 'status') {
            return (a.status || '').localeCompare(b.status || '') * modifier
        }

        return 0
    })

    const SortIcon = ({ columnKey }: { columnKey: SortConfig['key'] }) => {
        if (sortConfig.key !== columnKey) return <span className="text-gray-300 ml-1">⇅</span>
        return <span className="ml-1 text-[var(--kreta-blue)]">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
    }

    const showActions = isPending && !isReadOnly

    return (
        <div className={`card overflow-hidden ${!isPending ? 'opacity-90' : ''}`}>
            <div className={`border-b border-[var(--kreta-grey)] ${isPending ? 'bg-yellow-50' : 'bg-gray-50'} px-6 py-4 flex justify-between items-center`}>
                <h3 className={`font-semibold ${isPending ? 'text-yellow-800' : 'text-gray-700'}`}>
                    {isPending ? 'Függőben lévő Jóváhagyások' : 'Jóváhagyási Előzmények'}
                </h3>
                {isPending && (
                    <span className="bg-white text-yellow-800 text-xs px-2 py-1 rounded-full font-medium border border-yellow-200">
                        {logs.length} Függőben
                    </span>
                )}
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-white text-gray-500 border-b border-[var(--kreta-grey)]">
                        <tr>
                            <th
                                className="px-6 py-3 font-medium cursor-pointer hover:bg-gray-50 select-none"
                                onClick={() => handleSort('date')}
                            >
                                Dátum <SortIcon columnKey="date" />
                            </th>
                            <th
                                className="px-6 py-3 font-medium cursor-pointer hover:bg-gray-50 select-none"
                                onClick={() => handleSort('student')}
                            >
                                Tanuló <SortIcon columnKey="student" />
                            </th>
                            <th className="px-6 py-3 font-medium">Leírás</th>
                            <th
                                className="px-6 py-3 font-medium text-right cursor-pointer hover:bg-gray-50 select-none"
                                onClick={() => handleSort('hours')}
                            >
                                Óra <SortIcon columnKey="hours" />
                            </th>
                            <th
                                className="px-6 py-3 font-medium text-center cursor-pointer hover:bg-gray-50 select-none"
                                onClick={() => handleSort('status')}
                            >
                                {showActions ? 'Műveletek' : 'Állapot'} <SortIcon columnKey="status" />
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--kreta-grey)] bg-white">
                        {sortedLogs.map((log) => (
                            <tr key={log.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {new Date(log.date_of_service).toLocaleDateString('hu-HU')}
                                </td>
                                <td className="px-6 py-4 font-medium text-[var(--kreta-text)]">
                                    {log.profiles?.full_name}
                                </td>
                                <td className="px-6 py-4 text-gray-600 max-w-xs truncate">
                                    {log.description}
                                    {!isPending && log.rejection_reason && (
                                        <div className="text-xs text-red-600 italic block mt-1">
                                            "{log.rejection_reason}"
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right font-medium">
                                    {log.hours_worked}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    {showActions ? (
                                        <LogActionButtons logId={log.id} />
                                    ) : (
                                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium 
                                            ${log.status === 'approved' ? 'bg-green-100 text-green-800 grayscale' :
                                                log.status === 'rejected' ? 'bg-red-100 text-red-800 grayscale' :
                                                    'bg-yellow-100 text-yellow-800'}`}>
                                            {log.status === 'approved' ? 'JÓVÁHAGYVA' :
                                                log.status === 'rejected' ? 'ELUTASÍTVA' :
                                                    log.status === 'pending' ? 'FÜGGŐBEN' : log.status.toUpperCase()}
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {sortedLogs.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                                    {isPending ? 'Nincs függőben lévő jóváhagyás.' : 'Még nincs előzmény.'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
