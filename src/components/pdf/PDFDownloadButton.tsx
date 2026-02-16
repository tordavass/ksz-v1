'use client'

import React from 'react'
import { PDFDownloadLink } from '@react-pdf/renderer'
import ClassSummaryDocument from './ClassSummaryDocument'


interface StudentSummary {
    id: string;
    full_name: string | null;
    total_hours: number;
}

interface PDFDownloadButtonProps {
    className: string;
    students: StudentSummary[];
}

export default function PDFDownloadButton({ className, students }: PDFDownloadButtonProps) {
    const generatedAt = Date.now().toString();

    return (
        <div className="inline-block">
            <PDFDownloadLink
                key={generatedAt} // Force re-render
                document={<ClassSummaryDocument className={className} students={students} generatedAt={new Date().toLocaleDateString('hu-HU')} />}
                fileName={`${className.replace(/\s+/g, '_')}_IKSZ_Osszesito_${generatedAt}.pdf`}
                className="inline-flex items-center gap-2 rounded-md bg-[var(--kreta-blue)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--kreta-blue-light)]"
            >
                {({ blob, url, loading, error }) =>
                    loading ? (
                        'PDF Generálás...'
                    ) : (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
                            Exportálás PDF-be
                        </>
                    )
                }
            </PDFDownloadLink>
        </div>
    )
}
