'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getMessages() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    const { data: messages, error } = await supabase
        .from('messages' as any)
        .select(`
            *,
            sender:sender_id(full_name, role)
        `)
        .eq('recipient_id', user.id)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching messages:', error)
        return []
    }

    return messages
}

export async function getUnreadCount() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return 0

    const { count, error } = await supabase
        .from('messages' as any)
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', user.id)
        .eq('is_read', false)

    return count || 0
}

export async function markAsRead(messageId: string) {
    const supabase = await createClient()
    await supabase
        .from('messages' as any)
        .update({ is_read: true })
        .eq('id', messageId)

    revalidatePath('/messages')
}

export async function sendMessage(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Unauthorized' }

    const recipientId = formData.get('recipient_id') as string
    const subject = formData.get('subject') as string
    const body = formData.get('body') as string

    if (!recipientId || !subject || !body) {
        return { error: 'All fields are required' }
    }

    const { error } = await supabase
        .from('messages' as any)
        .insert({
            sender_id: user.id,
            recipient_id: recipientId,
            subject,
            body
        })

    if (error) {
        console.error('Send Error:', error)
        return { error: 'Failed to send message' }
    }

    revalidatePath('/messages')
    return { success: true }
}
