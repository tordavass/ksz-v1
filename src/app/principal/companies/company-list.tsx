'use client'

import { useState } from 'react'
import { toggleCompanyBan } from '../actions'

// We define a local type for the company including what we fetch
type Company = {
    id: string
    name: string
    address?: string
    is_banned: boolean
    contracts?: { is_active: boolean }[] // Supabase returns an array of joined relations
}

export default function CompanyList({ initialCompanies }: { initialCompanies: any[] }) {
    const [companies, setCompanies] = useState<Company[]>(initialCompanies)
    const [loadingId, setLoadingId] = useState<string | null>(null)

    const handleToggleBan = async (company: Company) => {
        if (!confirm(company.is_banned
            ? `Biztosan feloldod a tiltást erről a helyről: ${company.name}?`
            : `Biztosan le akarod tiltani ezt a helyet: ${company.name}? A diákok nem fogják látni a listában.`)) {
            return
        }

        setLoadingId(company.id)
        try {
            await toggleCompanyBan(company.id, company.is_banned)

            // Optimistic update
            setCompanies(prev => prev.map(c =>
                c.id === company.id ? { ...c, is_banned: !c.is_banned } : c
            ))
        } catch (error) {
            alert('Hiba történt a módosítás közben.')
        } finally {
            setLoadingId(null)
        }
    }

    return (
        <div className="card overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-500 border-b border-[var(--kreta-grey)]">
                        <tr>
                            <th className="px-6 py-3 font-medium">Szervezet Neve</th>
                            <th className="px-6 py-3 font-medium">Cím</th>
                            <th className="px-6 py-3 font-medium text-center">Aktív Szerződés</th>
                            <th className="px-6 py-3 font-medium text-center">Állapot</th>
                            <th className="px-6 py-3 font-medium text-right">Műveletek</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--kreta-grey)] bg-white">
                        {companies.map((company) => {
                            const hasActiveContract = company.contracts && company.contracts.some((c: any) => c.is_active)

                            return (
                                <tr key={company.id} className={`hover:bg-gray-50 ${company.is_banned ? 'bg-red-50' : ''}`}>
                                    <td className="px-6 py-4 font-medium text-[var(--kreta-text)]">
                                        {company.name}
                                        {company.is_banned && <span className="ml-2 text-xs text-red-600 font-bold">(TILTVA)</span>}
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        {company.address || '-'}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {hasActiveContract ? (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                Igen
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                                Nincs
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {company.is_banned ? (
                                            <span className="text-red-600 font-bold text-xs">TILTVA</span>
                                        ) : (
                                            <span className="text-green-600 font-bold text-xs">ENGEDÉLYEZVE</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleToggleBan(company)}
                                            disabled={loadingId === company.id}
                                            className={`text-xs font-bold px-3 py-1 rounded border transition-colors
                                                ${company.is_banned
                                                    ? 'border-gray-300 text-gray-600 hover:bg-gray-100'
                                                    : 'border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300'
                                                }
                                                ${loadingId === company.id ? 'opacity-50 cursor-not-allowed' : ''}
                                            `}
                                        >
                                            {loadingId === company.id ? '...' : (company.is_banned ? 'Feloldás' : 'Tiltás')}
                                        </button>
                                    </td>
                                </tr>
                            )
                        })}
                        {companies.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                                    Nincs megjeleníthető szervezet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
