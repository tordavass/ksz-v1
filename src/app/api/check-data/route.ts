import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { Database } from '@/types/database.types'

export async function GET() {
    // Service Role Key to bypass RLS
    const supabase = createClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    )

    // 1. Fetch Students
    const { data: students, error: sErr } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('role', 'student')

    if (sErr || !students || students.length === 0) {
        return NextResponse.json({ error: 'No students found' }, { status: 404 })
    }

    const report = []

    for (const student of students) {
        const { count } = await supabase
            .from('service_logs')
            .select('*', { count: 'exact', head: true })
            .eq('student_id', student.id)

        report.push({
            name: student.full_name,
            email: student.email,
            logCount: count || 0
        })
    }

    // Sort by log count desc
    report.sort((a, b) => b.logCount - a.logCount)

    return NextResponse.json({
        totalStudents: students.length,
        data: report
    })
}
