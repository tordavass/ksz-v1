import { getBusinessLogs } from './actions'
import { createAdminClient } from '@/utils/supabase/admin'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import BusinessLogTable from './business-log-table'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export default async function BusinessDashboard() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // 1. Check if user is already linked to a company
    const { data: profile } = await supabase
        .from('profiles')
        .select('company_id, role, is_dual_role')
        .eq('id', user.id)
        .single()

    // 2. If no company_id, check if they are a 'pending' contact in contracts
    let showOverlay = false
    let pendingData = null

    // Use Admin Client to bypass RLS for this system check
    const adminSupabase = createAdminClient()

    if (!profile?.company_id) {
        const { data: pendingContract } = await adminSupabase
            .from('contracts')
            .select('status, companies(name)')
            .or(`temp_owner_email.eq."${user.email}",signer_email.eq."${user.email}"`)
            .in('status', ['pending_principal'])
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle()

        if (pendingContract) {
            showOverlay = true
            pendingData = pendingContract
        }
    }

    // Standard Dashboard Logic (if company exists)
    // Note: getBusinessLogs handles the undefined company_id case gracefully now
    const { logs, companyName, role, unreadCount } = await getBusinessLogs()

    // Determine Active Role
    // Default to the profile role, but override if cookie is set (and valid)
    const cookieStore = await cookies()
    const cookieRole = cookieStore.get('ksz_active_role')?.value

    // Safety: If not dual role, ignore cookie. If cookie is invalid, ignore it.
    const activeRole = (profile?.is_dual_role && cookieRole) ? cookieRole : role

    // isReadOnly: True if acting as Owner. False if acting as Contact.
    // However, the previous logic was: owner = readOnly.
    // If I switch to 'business_contact' mode, I should NOT be readOnly.
    const isReadOnly = activeRole === 'business_owner'

    /* Split logs into pending and history */
    const pendingLogs = logs?.filter((l: any) => l.status === 'pending') || []
    const historyLogs = logs?.filter((l: any) => l.status !== 'pending') || []

    return (
        <div className="min-h-screen p-4 md:p-8">

            <div className="mx-auto max-w-5xl space-y-8">

                {/* Header */}
                <header className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-[var(--kreta-blue)]">Szervezeti Áttekintés</h1>
                        <div className="flex items-center gap-2 mt-1">
                            {activeRole === 'business_owner' ? (
                                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-indigo-100 text-indigo-700 border border-indigo-200">CÉGVEZETŐ</span>
                            ) : (
                                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">KAPCSOLATTARTÓ</span>
                            )}
                            <p className="text-sm text-gray-600 font-medium font-sans">
                                {companyName || 'Nincs cég hozzárendelve'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Role Switcher */}
                        {profile?.is_dual_role && (
                            <Link
                                href="/select-role"
                                className="px-3 py-1.5 text-xs font-bold text-gray-600 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 transition-colors flex items-center gap-1 group"
                                title="Váltás a szerepkörök között"
                            >
                                <span>🔄</span>
                                <span className="hidden sm:inline">Szerepkör Váltás</span>
                            </Link>
                        )}

                        <Link href="/messages" className="relative group p-2 rounded-full hover:bg-yellow-50 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400 group-hover:text-amber-500"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
                            {unreadCount > 0 && (
                                <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                            )}
                        </Link>
                        <Link href="/business/contracts" className="px-4 py-2 text-sm font-bold text-[var(--kreta-blue)] bg-white border border-[var(--kreta-blue)]/20 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-2">
                            <span>📄</span> Beérkező Szerződések
                        </Link>
                        <Link href="/" className="px-4 py-2 text-sm font-semibold text-[var(--kreta-blue)] bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                            Kezdőlap
                        </Link>
                    </div>
                </header>

                {/* Stats Row */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="card p-4 border-l-4 border-yellow-400">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Függőben Lévő</p>
                        <p className="text-3xl font-bold text-gray-800 mt-1">{pendingLogs.length}</p>
                    </div>
                    <div className="card p-4 border-l-4 border-green-500">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Jóváhagyva / Előzmények</p>
                        <p className="text-3xl font-bold text-gray-800 mt-1">{historyLogs.length}</p>
                    </div>
                </div>

                {/* Pending List */}
                <BusinessLogTable logs={pendingLogs} isPending={true} isReadOnly={isReadOnly} />

                {/* History List */}
                <BusinessLogTable logs={historyLogs} isPending={false} isReadOnly={isReadOnly} />

            </div>

            {/* Overlay for Pending Status */}
            {showOverlay && (
                <div className="fixed inset-0 bg-gray-500/40 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-500">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 text-center border-t-4 border-[var(--kreta-blue)] animate-in zoom-in-95 duration-300">
                        <div className="text-6xl mb-6 animate-bounce">⏳</div>
                        <h1 className="text-2xl font-bold text-gray-800 mb-3">Várakozás az Igazgatóra</h1>
                        <p className="text-gray-600 mb-6 leading-relaxed">
                            A szerződést sikeresen aláírta. Jelenleg az iskola igazgatójának jóváhagyására várunk, hogy a fiókját összekapcsolhassuk a céggel.
                        </p>
                        <div className="bg-blue-50 p-4 rounded-xl text-sm text-blue-800 font-medium border border-blue-100">
                            Amint az igazgató ellenjegyzi a dokumentumot, e-mailben értesítjük, és ez a felület azonnal aktívvá válik.
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
