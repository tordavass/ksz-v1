'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'
import { headers } from 'next/headers'

export async function login(prevState: any, formData: FormData) {
    const supabase = await createClient()
    const origin = (await headers()).get('origin')

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return { error: 'Hibás email cím vagy jelszó. Kérjük próbálja újra!' }
    }

    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('role, is_dual_role')
            .eq('id', user.id)
            .single()

        if (profile?.is_dual_role) {
            revalidatePath('/select-role')
            redirect('/select-role')
        }


        if ((profile?.role as string) === 'admin') {
            revalidatePath('/admin', 'layout')
            redirect('/admin')
        }

        if (profile?.role === 'student') {
            revalidatePath('/student', 'layout')
            redirect('/student')
        }

        if (profile?.role === 'business_contact') {
            revalidatePath('/business', 'layout')
            redirect('/business')
        }

        if (profile?.role === 'homeroom_teacher') {
            revalidatePath('/teacher', 'layout')
            redirect('/teacher')
        }

        if (profile?.role === 'principal') {
            revalidatePath('/principal', 'layout')
            redirect('/principal')
        }

        if (profile?.role === 'business_owner') {
            revalidatePath('/business', 'layout')
            redirect('/business')
        }

        if (profile?.role === 'parent') {
            revalidatePath('/parent', 'layout')
            redirect('/parent')
        }
    }

    revalidatePath('/', 'layout')
    redirect('/')
}

export async function signup(formData: FormData) {
    const supabase = await createClient()
    const origin = (await headers()).get('origin')

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const fullName = formData.get('fullName') as string
    const role = formData.get('role') as string

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: `${origin}/auth/callback`,
            data: {
                full_name: fullName,
                role: role,
            },
        },
    })

    if (error) {
        return redirect(`/login?message=Could not authenticate user`)
    }

    return redirect(`/login?message=Check email to continue sign in process`)
}
