import { getPrincipalClassDetails } from '../../actions'
import PrincipalStudentList from '../student-list'
import Link from 'next/link'

export default async function PrincipalClassPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const data = await getPrincipalClassDetails(id)

    if (!data) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4">
                <p className="text-gray-500">Az osztály nem található, vagy nincs jogosultságod megtekinteni.</p>
                <Link href="/principal" className="text-[var(--kreta-blue)] hover:underline">
                    &larr; Vissza a vezérlőpultra
                </Link>
            </div>
        )
    }

    const { classData, students } = data

    return (
        <div className="min-h-screen p-4 md:p-8">
            <div className="mx-auto max-w-6xl space-y-8">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-[var(--kreta-blue)]">{classData.name} Osztály</h1>
                        <p className="text-gray-500">{students.length} tanuló</p>
                    </div>
                    <Link href="/principal" className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors">
                        &larr; Vissza
                    </Link>
                </div>

                {/* Student List */}
                <PrincipalStudentList students={students} />

            </div>
        </div>
    )
}
