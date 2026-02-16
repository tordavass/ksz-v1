import { getParentChildren } from './actions'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function ParentDashboard() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const children = await getParentChildren()

    return (
        <div className="min-h-screen p-4 md:p-8 bg-gray-50">
            <div className="mx-auto max-w-4xl space-y-8">

                {/* Header */}
                <header className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-[var(--kreta-blue)] tracking-tight">Szülői Felület</h1>
                        <p className="text-gray-500 mt-1">Gyermekeid közösségi szolgálatának áttekintése</p>
                    </div>
                    <Link href="/" className="px-4 py-2 text-sm font-semibold text-[var(--kreta-blue)] bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                        Kezdőlap
                    </Link>
                </header>

                {/* Children List */}
                {children.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {children.map((child: any) => (
                            <Link
                                key={child.id}
                                href={`/parent/child/${child.id}`}
                                className="group bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:border-[var(--kreta-blue)]/30 transition-all duration-300 relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -mr-8 -mt-8 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                <div className="relative z-10 flex items-start justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-2xl bg-[var(--kreta-blue)] text-white flex items-center justify-center font-bold text-2xl shadow-lg shadow-blue-200">
                                            {child.full_name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-800 group-hover:text-[var(--kreta-blue)] transition-colors">
                                                {child.full_name}
                                            </h3>
                                            <p className="text-sm font-medium text-gray-500 mt-1 flex items-center gap-1">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                                {child.class_name}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-[var(--kreta-blue)] opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                                    </span>
                                </div>

                                <div className="mt-6 pt-6 border-t border-gray-100 relative z-10">
                                    <p className="text-sm text-gray-400 font-medium group-hover:text-gray-600 transition-colors">
                                        Kattints a részletes napló megtekintéséhez
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">Nincs gyermek hozzárendelve</h3>
                        <p className="text-gray-500 mt-2 text-sm max-w-xs mx-auto">Ha gyermeked már regisztrált a rendszerben, kérd meg az iskola adminisztrátorát, hogy rendelje hozzá a fiókodhoz.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
