'use client'

export default function CopyLinkButton({ signingToken }: { signingToken: string }) {
    const handleCopy = () => {
        const link = `${window.location.origin}/sign/${signingToken}`
        navigator.clipboard.writeText(link)
        alert('Aláíró link másolva vágólapra! Küldd el a cégvezetőnek.')
    }

    return (
        <button
            onClick={handleCopy}
            className="text-sm bg-blue-50 text-[var(--kreta-blue)] px-3 py-1 rounded border border-blue-100 hover:bg-blue-100 transition-colors font-medium flex items-center gap-1"
        >
            🔗 Link Másolása
        </button>
    )
}
