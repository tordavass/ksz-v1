'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function setRoleCookie(role: 'business_owner' | 'business_contact') {
    const cookieStore = await cookies()

    // Set cookie for 7 days
    cookieStore.set('ksz_active_role', role, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
        sameSite: 'lax'
    })

    redirect('/business')
}
