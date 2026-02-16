'use client'

import { useState } from 'react'
import { deleteUser } from './actions'

type User = {
    id: string
    full_name: string | null
    role: string | null
    created_at: string
}

type SortConfig = {
    key: 'full_name' | 'role' | 'created_at'
    direction: 'asc' | 'desc'
}

type UserTableProps = {
    users: User[]
    currentUserId: string
}

export default function UserTable({ users, currentUserId }: UserTableProps) {
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'full_name', direction: 'asc' })

    const handleSort = (key: SortConfig['key']) => {
        setSortConfig(current => ({
            key,
            direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
        }))
    }

    const sortedUsers = [...(users || [])].sort((a, b) => {
        const { key, direction } = sortConfig
        const modifier = direction === 'asc' ? 1 : -1

        if (key === 'full_name') {
            return (a.full_name || '').localeCompare(b.full_name || '') * modifier
        }
        if (key === 'role') {
            const rolePriority: Record<string, number> = {
                'admin': 1,
                'principal': 2,
                'homeroom_teacher': 3,
                'business_owner': 4,
                'business_contact': 5,
                'parent': 6,
                'student': 7
            }
            const priorityA = rolePriority[a.role || ''] || 99
            const priorityB = rolePriority[b.role || ''] || 99
            return (priorityA - priorityB) * modifier
        }
        if (key === 'created_at') {
            return (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) * modifier
        }
        return 0
    })

    const SortIcon = ({ columnKey }: { columnKey: SortConfig['key'] }) => {
        if (sortConfig.key !== columnKey) return <span className="text-gray-300 ml-1">⇅</span>
        return <span className="ml-1 text-[var(--kreta-blue)]">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
    }

    const getRoleBadge = (role: string | null) => {
        switch (role) {
            case 'admin': return <span className="inline-flex rounded-full px-2 text-xs font-semibold leading-5 bg-[var(--kreta-blue)] text-white">Admin</span>
            case 'student': return <span className="inline-flex rounded-full px-2 text-xs font-semibold leading-5 bg-green-100 text-green-800">Tanuló</span>
            case 'homeroom_teacher': return <span className="inline-flex rounded-full px-2 text-xs font-semibold leading-5 bg-yellow-100 text-yellow-800">Tanár</span>
            case 'principal': return <span className="inline-flex rounded-full px-2 text-xs font-semibold leading-5 bg-purple-100 text-purple-800">Igazgató</span>
            case 'business_owner': return <span className="inline-flex rounded-full px-2 text-xs font-semibold leading-5 bg-indigo-100 text-indigo-800">Szervezeti Vezető</span>
            case 'business_contact': return <span className="inline-flex rounded-full px-2 text-xs font-semibold leading-5 bg-blue-100 text-blue-800">Kapcsolattartó</span>
            case 'parent': return <span className="inline-flex rounded-full px-2 text-xs font-semibold leading-5 bg-pink-100 text-pink-800">Szülő</span>
            default: return <span className="inline-flex rounded-full px-2 text-xs font-semibold leading-5 bg-gray-100 text-gray-800">{role}</span>
        }
    }

    return (
        <section className="card">
            <div className="border-b border-[var(--kreta-grey)] px-6 py-4">
                <h2 className="text-xl font-semibold">Összes Felhasználó</h2>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-500">
                        <tr>
                            <th
                                className="px-6 py-3 font-medium cursor-pointer hover:bg-gray-100 transition-colors select-none"
                                onClick={() => handleSort('full_name')}
                            >
                                Név <SortIcon columnKey="full_name" />
                            </th>
                            <th
                                className="px-6 py-3 font-medium cursor-pointer hover:bg-gray-100 transition-colors select-none"
                                onClick={() => handleSort('role')}
                            >
                                Szerepkör <SortIcon columnKey="role" />
                            </th>
                            <th
                                className="px-6 py-3 font-medium cursor-pointer hover:bg-gray-100 transition-colors select-none"
                                onClick={() => handleSort('created_at')}
                            >
                                Csatlakozott <SortIcon columnKey="created_at" />
                            </th>
                            <th className="px-6 py-3 font-medium">Műveletek</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--kreta-grey)]">
                        {sortedUsers.map((u) => (
                            <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-medium text-[var(--kreta-text)]">{u.full_name}</td>
                                <td className="px-6 py-4">
                                    {getRoleBadge(u.role)}
                                </td>
                                <td className="px-6 py-4 text-gray-500">
                                    {new Date(u.created_at).toLocaleDateString('hu-HU')}
                                </td>
                                <td className="px-6 py-4">
                                    <form action={deleteUser}>
                                        <input type="hidden" name="userId" value={u.id} />
                                        {u.id !== currentUserId ? (
                                            <button
                                                className="text-red-600 hover:text-red-900 font-medium transition-colors"
                                                onClick={(e) => {
                                                    if (!confirm('Biztosan törölni szeretnéd ezt a felhasználót?')) {
                                                        e.preventDefault()
                                                    }
                                                }}
                                            >
                                                Törlés
                                            </button>
                                        ) : (
                                            <span className="text-gray-400 cursor-not-allowed" title="Saját magad nem törölheted">Törlés</span>
                                        )}
                                    </form>
                                </td>
                            </tr>
                        ))}
                        {sortedUsers.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">Nincs felhasználó a rendszerben.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    )
}
