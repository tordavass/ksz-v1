'use server'

import { createAdminClient } from '@/utils/supabase/admin'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// Security check helper
async function ensureAdmin() {
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
}

export async function fetchAllUsers() {
    await ensureAdmin()
    const supabaseAdmin = createAdminClient()

    // We fetch profiles and join with basic auth info if needed,
    // but since we want to manage "Users", listing profiles is usually best 
    // because it contains the role and name.
    // However, `profiles` only has the data we saved. Use `admin.listUsers` for raw auth data if needed.
    // Let's stick to profiles + email from auth if possible, but strict joins are hard across schemas.
    // For simplicity, we will fetch profiles.

    const { data: profiles, error } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)

    return profiles
}

export async function deleteUser(formData: FormData) {
    await ensureAdmin()
    const userId = formData.get('userId') as string
    if (!userId) return

    const supabaseAdmin = createAdminClient()
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)

    if (error) {
        console.error('Delete Error:', error)
        // In a real app we'd pass this error back to UI
    }

    revalidatePath('/admin')
}

export async function fetchAllCompanies() {
    await ensureAdmin()
    const supabase = await createClient()

    const { data: companies, error } = await supabase
        .from('companies')
        .select('*')
        .order('name')

    if (error) {
        console.error('Error fetching companies', error)
        return []
    }
    return companies
}

export async function createUser(formData: FormData) {
    await ensureAdmin()
    const supabaseAdmin = createAdminClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const fullName = formData.get('full_name') as string
    const role = formData.get('role') as string
    const companyId = formData.get('company_id') as string // Optional

    const metadata: any = {
        full_name: fullName,
        role: role
    }

    if (companyId) {
        metadata.company_id = companyId
    }

    // 1. Create User in Auth
    const { data: user, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: metadata
    })

    if (authError) {
        console.error('Create User Error:', authError)
        redirect('/admin?error=' + authError.message)
    }

    // 2. Profile creation is handled by TRIGGER.

    revalidatePath('/admin')
}

export async function linkUsers(formData: FormData) {
    await ensureAdmin()
    const supabaseAdmin = createAdminClient()

    const parentId = formData.get('parent_id') as string
    const studentId = formData.get('student_id') as string

    if (!parentId || !studentId) return

    const { error } = await supabaseAdmin
        .from('parent_student')
        .insert({ parent_id: parentId, student_id: studentId })

    if (error) {
        console.error('Link Error:', error)
        // In production, return error state
    }

    revalidatePath('/admin')
}

export async function fetchStudents() {
    await ensureAdmin()
    const supabaseAdmin = createAdminClient()

    const { data } = await supabaseAdmin
        .from('profiles')
        .select('id, full_name')
        .eq('role', 'student')
        .order('full_name')

    return data || []
}

export async function fetchParents() {
    await ensureAdmin()
    const supabaseAdmin = createAdminClient()

    const { data } = await supabaseAdmin
        .from('profiles')
        .select('id, full_name')
        .eq('role', 'parent')
        .order('full_name')

    return data || []
}
