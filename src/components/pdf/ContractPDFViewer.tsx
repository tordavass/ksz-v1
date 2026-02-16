'use client'

import React, { useEffect, useState } from 'react'
import { usePDF } from '@react-pdf/renderer'
import { ContractDocument } from './ContractDocument'

interface Props {
    studentName: string
    studentClass?: string
    companyName: string
    companyAddress?: string
    ownerName: string
    date: string
    status: string
    className?: string
}

export default function ContractPDFViewer({
    studentName,
    studentClass,
    companyName,
    companyAddress,
    ownerName,
    date,
    status,
    className
}: Props) {
    const [isClient, setIsClient] = useState(false)

    useEffect(() => {
        setIsClient(true)
    }, [])

    const isSignedByOwner = ['pending_principal', 'active', 'rejected'].includes(status)
    const isSignedByPrincipal = ['active'].includes(status)

    const [instance, updateInstance] = usePDF({
        document: (
            <ContractDocument
                studentName={studentName}
                studentClass={studentClass}
                companyName={companyName}
                companyAddress={companyAddress}
                ownerName={ownerName}
                date={date}
                isSignedByOwner={isSignedByOwner}
                isSignedByPrincipal={isSignedByPrincipal}
            />
        ),
    })

    if (!isClient) {
        return (
            <span className={`inline-block px-4 py-2 text-sm text-gray-500 bg-gray-100 rounded animate-pulse ${className}`}>
                PDF Előkészítése...
            </span>
        )
    }

    if (instance.loading) {
        return <span className="text-xs text-gray-400">Generálás...</span>
    }

    if (instance.error) {
        return <span className="text-xs text-red-500">Hiba: {instance.error}</span>
    }

    return (
        <a
            href={instance.url || '#'}
            target="_blank"
            rel="noreferrer"
            className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 ${className || 'text-blue-600 bg-blue-50 hover:bg-blue-100'}`}
        >
            <span className="text-lg">📄</span>
            Szerződés Megnyitása
        </a>
    )
}
