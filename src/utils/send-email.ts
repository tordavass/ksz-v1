import { Resend } from 'resend'

const resendApiKey = process.env.RESEND_API_KEY
const resend = resendApiKey ? new Resend(resendApiKey) : null

const FROM_EMAIL = process.env.VERIFIED_FROM_EMAIL || 'onboarding@resend.dev'

export async function sendEmail({
    to,
    subject,
    html,
    text
}: {
    to: string
    subject: string
    html: string
    text?: string
}) {
    // 1. If no API key, log to console (Development / Demo Mode without Key)
    if (!resend) {
        console.log(`
        📧 [MOCK EMAIL] TO: ${to}
        SUBJECT: ${subject}
        BODY:
        ${text || html.replace(/<[^>]*>/g, '')}
        `)
        return { success: true, mocked: true }
    }

    try {
        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to,
            subject,
            html,
            text
        })

        if (error) {
            console.error('Resend Error:', error)
            return { success: false, error }
        }

        return { success: true, data }
    } catch (error) {
        console.error('Email Sending Failed:', error)
        return { success: false, error }
    }
}
