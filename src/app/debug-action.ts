'use server'
import { createClient } from '@/utils/supabase/server'

export async function debugFetch() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // 1. Get Class
    const { data: myClass } = await supabase
        .from('classes')
        .select('id')
        .eq('homeroom_teacher_id', user?.id)
        .single()

    console.log('Class ID:', myClass?.id)

    // 2. Fetch one student with class name
    const { data: student, error } = await supabase
        .from('profiles')
        .select('full_name, classes ( name )')
        .eq('class_id', myClass?.id)
        .limit(1)
        .single()

    console.log('Student Fetch:', { student, error })
    return { student, error }
}
