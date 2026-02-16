import { getMessages, markAsRead } from './actions'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function InboxPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // Fetch role for navigation
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    const role = profile?.role
    let backLink = '/'
    let backText = 'Vissza a főoldalra'

    if (role === 'student') {
        backLink = '/student'
        backText = 'Vissza a Tanulói Oldalra'
    } else if (role === 'homeroom_teacher') {
        backLink = '/teacher'
        backText = 'Vissza a Tanári Oldalra'
    } else if (role === 'business') {
        backLink = '/business'
        backText = 'Vissza a Céges Oldalra'
    } else if (role === 'admin') {
        backLink = '/admin'
        backText = 'Vissza az Adminisztrációhoz'
    } else if (role === 'principal') {
        backLink = '/principal'
        backText = 'Vissza az Igazgatói Oldalra'
    }

    const messages = await getMessages()

    return (
        <div className="min-h-screen p-4 md:p-8 bg-gray-50">
            <div className="mx-auto max-w-4xl space-y-8">

                <header className="flex items-center justify-between">
                    <div>
                        <Link href={backLink} className="text-sm text-[var(--kreta-blue)] hover:underline mb-2 block">
                            ← {backText}
                        </Link>
                        <h1 className="text-3xl font-bold text-[var(--kreta-blue)]">Üzenetek</h1>
                        <p className="text-gray-500">Értesítések és figyelmeztetések</p>
                    </div>
                </header>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {messages.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">
                            Nincs beérkező üzeneted.
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {messages.map((msg: any) => (
                                <div
                                    key={msg.id}
                                    className={`p-6 transition-colors hover:bg-blue-50 ${!msg.is_read ? 'bg-blue-50/50' : ''}`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className={`text-lg ${!msg.is_read ? 'font-bold text-[var(--kreta-blue)]' : 'font-semibold text-gray-800'}`}>
                                                {msg.subject}
                                            </h3>
                                            <p className="text-sm text-gray-500">
                                                Feladó: {msg.sender?.full_name || 'Rendszerüzenet'} • {new Date(msg.created_at).toLocaleDateString('hu-HU')}
                                            </p>
                                        </div>
                                        {!msg.is_read && (
                                            <form action={async () => {
                                                'use server'
                                                await markAsRead(msg.id)
                                            }}>
                                                <button className="text-xs bg-blue-100 text-[var(--kreta-blue)] px-3 py-1 rounded-full font-medium hover:bg-blue-200 transition-colors">
                                                    Olvasottnak jelöl
                                                </button>
                                            </form>
                                        )}
                                    </div>
                                    <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">
                                        {msg.body}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
