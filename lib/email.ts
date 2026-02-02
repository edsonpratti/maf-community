import { Resend } from 'resend';
import { AccessApproved } from '@/emails/access-approved';
import { AccessRejected } from '@/emails/access-rejected';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = 'Comunidade MAF <onboarding@resend.dev>'; // Update with verified domain

export async function sendApprovalEmail(email: string, name: string) {
    try {
        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: [email],
            subject: 'Bem-vinda à Comunidade MAF! Seu acesso foi aprovado 🎉',
            react: AccessApproved({ name }),
        });

        if (error) {
            console.error('Error sending approval email:', error);
            return { success: false, error };
        }

        return { success: true, data };
    } catch (error) {
        console.error('Exception sending approval email:', error);
        return { success: false, error };
    }
}

export async function sendRejectionEmail(email: string, name: string, reason?: string) {
    try {
        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: [email],
            subject: 'Atualização sobre sua solicitação de acesso',
            react: AccessRejected({ name, reason }),
        });

        if (error) {
            console.error('Error sending rejection email:', error);
            return { success: false, error };
        }

        return { success: true, data };
    } catch (error) {
        console.error('Exception sending rejection email:', error);
        return { success: false, error };
    }
}
