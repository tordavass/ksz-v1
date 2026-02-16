import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import LogoutButton from '@/components/logout-button'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const role = user?.user_metadata?.role
  const fullName = user?.user_metadata?.full_name || user?.email

  // Map roles to their dashboard paths
  const getDashboardLink = (role: string) => {
    switch (role) {
      case 'student': return '/student'
      case 'homeroom_teacher': return '/teacher'
      case 'principal': return '/principal'
      case 'business_contact':
      case 'business_owner': return '/business'
      case 'admin': return '/admin'
      case 'parent': return '/parent'
      default: return '/student' // Fallback
    }
  }

  const dashboardLink = getDashboardLink(role)

  // Helper for role display name (Hungarian)
  const getRoleName = (role: string) => {
    if (!role) return 'Felhasználó'
    switch (role) {
      case 'student': return 'Tanuló'
      case 'homeroom_teacher': return 'Osztályfőnök'
      case 'principal': return 'Igazgató'
      case 'business_owner': return 'Szervezeti Vezető'
      case 'business_contact': return 'Szervezeti Kapcsolattartó'
      case 'admin': return 'Rendszergazda'
      case 'parent': return 'Szülő'
      default: return role
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar / Header */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[var(--kreta-blue)] rounded-lg flex items-center justify-center text-white font-bold">
            K
          </div>
          <span className="font-semibold text-xl text-gray-700">IKSZ Rendszer</span>
        </div>
        <div className="flex items-center gap-4">
          {user && (
            <Link href="/messages" className="text-gray-600 hover:text-[var(--kreta-blue)] transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bell"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
            </Link>
          )}
          {user && <LogoutButton />}
        </div>
      </nav>

      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-white to-blue-50/50">

        {!user ? (
          <div className="max-w-4xl w-full animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-12">

            <div className="space-y-6">
              <span className="inline-block px-4 py-1.5 rounded-full bg-blue-100 text-[var(--kreta-blue)] font-semibold text-sm tracking-wide uppercase">
                2025/2026 Tanév
              </span>
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900">
                Iskolai <span className="bg-gradient-to-r from-[var(--kreta-blue)] to-blue-600 bg-clip-text text-transparent">Közösségi Szolgálat</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Modern, papírmentes megoldás az 50 órás közösségi szolgálat adminisztrációjára és követésére.
              </p>

              <div className="pt-4">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all bg-[var(--kreta-blue)] rounded-xl shadow-lg hover:bg-blue-700 hover:shadow-xl hover:-translate-y-1 ring-offset-2 hover:ring-2 ring-[var(--kreta-blue)]"
                >
                  Belépés a Rendszerbe
                </Link>
              </div>
            </div>

            {/* Feature Grid */}
            <div className="grid md:grid-cols-3 gap-8 text-left mt-16 pt-8 border-t border-gray-100">
              <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-[var(--kreta-blue)] mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Valós idejű Követés</h3>
                <p className="text-gray-500">Azonnali visszajelzés a teljesített órákról és a hátralévő feladatokról.</p>
              </div>
              <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Digitális Napló</h3>
                <p className="text-gray-500">Nincs több elveszett papír. Minden igazolás és szerződés egy helyen, biztonságban.</p>
              </div>
              <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Könnyű Kapcsolattartás</h3>
                <p className="text-gray-500">Beépített üzenetküldés tanárok, diákok és szervezetek között.</p>
              </div>
            </div>

          </div>
        ) : (
          <div className="max-w-2xl w-full animate-in zoom-in-50 duration-500">
            {/* Same Dashboard Card as before but cleaner */}
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 ring-1 ring-gray-900/5">
              <div className="mb-8">
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-[var(--kreta-blue)] rounded-full text-sm font-bold mb-4">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  Bejelentkezve: {getRoleName(role)}
                </span>
                <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">Üdvözöljük, {fullName}!</h2>
              </div>

              <div className="grid gap-4">
                <Link
                  href={dashboardLink}
                  className="group block p-8 border-2 border-[var(--kreta-blue)]/10 rounded-2xl hover:border-[var(--kreta-blue)] hover:bg-blue-50/50 transition-all duration-300 relative overflow-hidden"
                >
                  <div className="relative z-10">
                    <h3 className="text-2xl font-bold text-[var(--kreta-blue)] mb-2 flex items-center justify-center gap-2">
                      Oldal Megnyitása
                      <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                    </h3>
                    <p className="text-gray-500 font-medium">
                      Feladatok kezelése, előrehaladás megtekintése.
                    </p>
                  </div>
                </Link>
              </div>

            </div>
          </div>
        )}

      </div>

      {/* Footer */}
      <footer className="py-6 text-center text-gray-400 text-sm">
        &copy; {new Date().getFullYear()} IKSZ - Iskolai Közösségi Szolgálat
      </footer>
    </main>
  )
}
