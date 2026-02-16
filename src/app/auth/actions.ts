'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
    const supabase = await createClient()

    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    }

    const { error } = await supabase.auth.signInWithPassword(data)

    if (error) {
        console.error('Login Error:', error)
        redirect('/login?error=' + error.message)
    }

    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

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

    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        full_name: formData.get('full_name') as string,
        role: formData.get('role') as string,
    }

    const allowedRoles = [
        'student',
        'parent',
        'homeroom_teacher',
        'principal',
        'business_owner',
        'business_contact'
    ]

    if (!allowedRoles.includes(data.role)) {
        redirect('/signup?error=Invalid role selected')
    }

    const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
            data: {
                full_name: data.full_name,
                role: data.role,
            },
        },
    })

    if (error) {
        console.error('Signup Error:', error)
        redirect('/signup?error=' + error.message)
    }

    revalidatePath('/', 'layout')
    redirect('/')
}
