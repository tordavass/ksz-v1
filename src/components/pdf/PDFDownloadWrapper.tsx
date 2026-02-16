'use client'

import dynamic from 'next/dynamic'
import React from 'react'

const PDFDownloadButton = dynamic(
    () => import('./PDFDownloadButton'),
    { ssr: false, loading: () => <span className="text-sm text-gray-400">PDF Betöltése...</span> }
)

export default function PDFDownloadWrapper(props: any) {
    return <PDFDownloadButton {...props} />
}
