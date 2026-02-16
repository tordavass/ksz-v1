import { getStudentLogs } from './actions'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import StudentDashboardClient from './dashboard-client'

export default async function StudentDashboard() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { logs, totalHours, unreadCount, inviteToken } = await getStudentLogs()

    return (
        <StudentDashboardClient
            logs={logs}
            totalHours={totalHours}
            unreadCount={unreadCount}
            inviteToken={inviteToken}
        />
    )
}
