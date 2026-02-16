'use client'

import dynamic from 'next/dynamic'

const ContractPDFViewer = dynamic(() => import('./ContractPDFViewer'), {
    ssr: false,
    loading: () => <span className="text-xs text-gray-400">PDF betöltése...</span>
})

export default function DynamicContractViewer(props: any) {
    return <ContractPDFViewer {...props} />
}
