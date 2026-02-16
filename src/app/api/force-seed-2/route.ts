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
        .select('id')
        .eq('role', 'student')

    if (sErr || !students || students.length === 0) {
        return NextResponse.json({ error: 'No students found' }, { status: 404 })
    }

    // 2. Fetch Companies
    const { data: companies } = await supabase
        .from('companies')
        .select('id')
        .limit(5)

    if (!companies || companies.length === 0) {
        return NextResponse.json({ error: 'No companies found' }, { status: 404 })
    }

    let logsCreated = 0
    let contractsCreated = 0

    for (const student of students) {
        // Check for existing contract
        const { data: existingContracts } = await supabase
            .from('contracts')
            .select('id, company_id')
            .eq('student_id', student.id)

        let companyId = null

        if (existingContracts && existingContracts.length > 0) {
            companyId = existingContracts[0].company_id
        } else {
            // Create a dummy contract
            const randomCompany = companies[Math.floor(Math.random() * companies.length)]
            const { data: newContract, error: cErr } = await supabase
                .from('contracts')
                .insert({
                    student_id: student.id,
                    company_id: randomCompany.id,
                    status: 'active',
                    start_date: '2025-09-01',
                    is_active: true
                })
                .select()
                .single()

            if (newContract) {
                companyId = newContract.company_id
                contractsCreated++
            } else {
                console.error('Failed to create contract', cErr)
                continue
            }
        }

        // Generate Logs (Fix: REMOVED contract_id)
        const logCount = 5
        const logs = []
        for (let i = 0; i < logCount; i++) {
            const daysAgo = Math.floor(Math.random() * 60)
            const date = new Date()
            date.setDate(date.getDate() - daysAgo)

            logs.push({
                student_id: student.id,
                // contract_id: contractId, // REMOVED!
                company_id: companyId,
                date_of_service: date.toISOString().split('T')[0],
                hours_worked: Math.floor(Math.random() * 3) + 1,
                description: 'Demo munka',
                status: 'approved' as const
            })
        }

        const { error: lErr } = await supabase.from('service_logs').insert(logs)
        if (!lErr) {
            logsCreated += logs.length
        } else {
            console.error('Log insert error:', lErr)
        }
    }

    return NextResponse.json({
        success: true,
        contractsCreated,
        logsCreated
    })
}
