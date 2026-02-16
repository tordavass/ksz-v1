import { fetchAllUsers, deleteUser, createUser, fetchAllCompanies, fetchStudents, fetchParents, linkUsers } from './actions'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import AddUserForm from './add-user-form'
import LinkParentForm from './link-parent-form'
import UserTable from './user-table'

export default async function AdminDashboard() {
    // Double check protection (also in actions, but good for page load)
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if ((profile?.role as string) !== 'admin') {
        redirect('/')
    }

    const users = await fetchAllUsers()
    const companies = await fetchAllCompanies()
    const students = await fetchStudents()
    const parents = await fetchParents()

    return (
        <div className="min-h-screen p-8">
            <div className="mx-auto max-w-6xl">
                <header className="mb-8 flex items-center justify-between">
                    <h1 className="text-3xl font-bold">Adminisztrátori Oldal</h1>
                    <a href="/" className="text-sm text-[var(--kreta-blue)] hover:text-[var(--kreta-blue-light)]">← Vissza a Kezdőlapra</a>
                </header>

                {/* Add User Section */}
                <section className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <AddUserForm createUserAction={createUser} companies={companies} />
                    <LinkParentForm
                        linkAction={linkUsers}
                        students={students}
                        parents={parents}
                    />
                </section>

                {/* User List Section */}
                <UserTable users={users || []} currentUserId={user.id} />
            </div>
        </div>
    )
}

