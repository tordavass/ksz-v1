import { getTeacherClass } from './actions'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import StudentTable from './student-table'
import PDFDownloadWrapper from '@/components/pdf/PDFDownloadWrapper'

export default async function TeacherDashboard() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { className, students, unreadCount } = await getTeacherClass()

    if (!className) {
        return (
            <div className="min-h-screen p-8 flex flex-col items-center justify-center text-center">
                <h1 className="text-2xl font-bold text-gray-700">Nincs osztály hozzárendelve</h1>
                <p className="text-gray-500 mt-2">Jelenleg nem vagy hozzárendelve egyetlen osztályhoz sem.</p>
                <p className="text-sm text-gray-400 mt-1">Kérjük, vedd fel a kapcsolatot a rendszergazdával.</p>
                <Link href="/" className="mt-6 text-[var(--kreta-blue)] hover:underline">Vissza a Főoldalra</Link>
            </div>
        )
    }

    return (
        <div className="min-h-screen p-4 md:p-8">
            <div className="mx-auto max-w-5xl space-y-8">

                {/* Header */}
                <header className="flex items-center justify-between mb-2">
                    <div>
                        <h1 className="text-3xl font-bold text-[var(--kreta-blue)] tracking-tight">Tanári Felület</h1>
                        <p className="text-sm font-medium text-gray-500 mt-1">
                            Osztályfőnöki nézet: <span className="font-bold text-gray-800 text-lg ml-1">{className}</span>
                        </p>
                    </div>
                    <div className="flex gap-4 items-center">
                        <Link href="/messages" className="p-2 rounded-full hover:bg-yellow-50 transition-colors relative group">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400 group-hover:text-amber-500"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
                            {unreadCount > 0 && (
                                <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                            )}
                        </Link>
                        <Link
                            href="/teacher/contracts"
                            className="bg-white text-[var(--kreta-blue)] border border-[var(--kreta-blue)] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-50 transition-colors flex items-center gap-2"
                        >
                            <span>📜</span>
                            <span className="hidden md:inline">Szerződések</span>
                        </Link>
                        <Link href="/" className="px-4 py-2 text-sm font-semibold text-[var(--kreta-blue)] bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                            Kezdőlap
                        </Link>
                    </div>
                </header>

                {/* Class Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="card p-4 border-l-4 border-[var(--kreta-blue)] flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Osztálylétszám</p>
                            <p className="text-3xl font-bold text-gray-800 mt-1">{students.length} <span className="text-sm font-medium text-gray-400">fő</span></p>
                        </div>
                        <div className="h-10 w-10 bg-blue-50 rounded-full flex items-center justify-center text-[var(--kreta-blue)]">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                        </div>
                    </div>
                    <div className="card p-4 border-l-4 border-green-500 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Összes Jóváhagyott Óra</p>
                            {/* Calculating total hours on the fly from students array */}
                            <p className="text-3xl font-bold text-gray-800 mt-1">
                                {students.reduce((sum, s) => sum + (s.total_hours || 0), 0).toLocaleString()}
                            </p>
                        </div>
                        <div className="h-10 w-10 bg-green-50 rounded-full flex items-center justify-center text-green-600">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                    </div>
                    <div className="card p-4 border-l-4 border-purple-500 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Jelentések</p>
                            <div className="mt-2">
                                <PDFDownloadWrapper className={className} students={students} />
                            </div>
                        </div>
                        <div className="h-10 w-10 bg-purple-50 rounded-full flex items-center justify-center text-purple-600">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        </div>
                    </div>
                </div>

                {/* Client Component for Table */}
                <StudentTable students={students} />

            </div>
        </div>
    )
}
