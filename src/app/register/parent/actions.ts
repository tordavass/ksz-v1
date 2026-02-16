'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function registerParent(prevState: any, formData: FormData) {
    const supabase = await createClient()
    const supabaseAdmin = createAdminClient()

    const token = formData.get('token') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirm_password') as string
    const fullName = formData.get('full_name') as string

    if (!token || !email || !password || !fullName) {
        return { error: 'Minden mező kitöltése kötelező!' }
    }

    if (password !== confirmPassword) {
        return { error: 'A két jelszó nem egyezik meg!' }
    }

    // 1. Validate Token & Find Student
    const { data: studentProfile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('id, full_name')
        .eq('parent_invite_token', token)
        .single()

    if (profileError || !studentProfile) {
        return { error: 'Érvénytelen meghívó kód.' }
    }

    // 2. Check Parent Limit (Max 2)
    const { count, error: countError } = await supabaseAdmin
        .from('parent_student')
        .select('*', { count: 'exact', head: true })
        .eq('student_id', studentProfile.id)

    if (countError) {
        console.error('Count Error:', countError)
        return { error: 'Rendszerhiba történt.' }
    }

    if (count && count >= 2) {
        return { error: `Ehhez a tanulóhoz (${studentProfile.full_name}) már 2 szülő van regisztrálva.` }
    }

    // 3. Create Parent User in Auth
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
            full_name: fullName,
            role: 'parent'
        }
    })

    if (authError) {
        if (authError.message === 'User already registered') {
            return { error: 'Ez az email cím már regisztrálva van.' }
        }
        return { error: authError.message }
    }

    if (!authUser.user) {
        return { error: 'Nem sikerült létrehozni a felhasználót.' }
    }

    // --- SELF-HEALING: Ensure Profile Exists ---
    // If the trigger failed or is dropped, we must insert the profile manually.
    const { data: existingProfile } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('id', authUser.user.id)
        .single()

    if (!existingProfile) {
        console.log('Profile missing (Trigger bypassed?), inserting manually...')
        const { error: profileInsertError } = await supabaseAdmin
            .from('profiles')
            .insert({
                id: authUser.user.id,
                full_name: fullName,
                role: 'parent',
                // is_dual_role: false // Default
            })

        if (profileInsertError) {
            console.error('Manual Profile Insert Error:', profileInsertError)
            // If this fails, we are in trouble, but let's try to proceed or return error?
            // If profile missing, linking will fail.
            return { error: 'Hiba történt a felhasználói profil létrehozásakor. (DB Error)' }
        }
    }
    // -------------------------------------------

    // 4. Link Parent to Student
    // Profile creation is likely handled by a trigger, but we need to ensure it exists before linking?
    // The trigger usually runs immediately.
    // Let's Insert the link.

    const { error: linkError } = await supabaseAdmin
        .from('parent_student')
        .insert({
            parent_id: authUser.user.id,
            student_id: studentProfile.id
        })

    if (linkError) {
        console.error('Link Error:', linkError)
        // Cleanup? If linking fails, we might want to delete the user or warn.
        // For now, return error.
        return { error: 'Sikeres regisztráció, de a tanuló összekapcsolása sikertelen. Kérjük jelezze az adminisztrátornak.' }
    }

    // 5. Auto-Login
    const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
    })

    if (signInError) {
        console.error('Auto-Login Error:', signInError)
        // Fallback to login page if auto-login fails
        redirect('/login?message=Sikeres regisztráció! Kérjük jelentkezzen be.')
    }

    redirect('/')
}
