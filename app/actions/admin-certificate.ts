'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendApprovalEmail, sendRejectionEmail } from '@/lib/email'
import { revalidatePath } from 'next/cache'

export type ReviewResult = {
    success: boolean
    message: string
}

export async function reviewCertificate(
    certId: string | null | undefined,
    userId: string,
    action: 'APPROVED' | 'REJECTED'
): Promise<ReviewResult> {
    const supabase = await createClient()

    // 1. Verify Admin Access
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, message: 'Unauthorized' }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'ADMIN') {
        return { success: false, message: 'Forbidden: Admin access required' }
    }

    // 2. Fetch User Details (Name from Profile, Email from Auth Admin)
    let userName = 'Usuária'
    let userEmail = ''

    // Fetch Name
    const { data: targetProfile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', userId)
        .single()

    if (targetProfile?.full_name) userName = targetProfile.full_name

    // Fetch Email using Admin Client (Service Role)
    const adminSupabase = createAdminClient()
    const { data: userData, error: userError } = await adminSupabase.auth.admin.getUserById(userId)

    if (userData?.user?.email) {
        userEmail = userData.user.email
    } else {
        console.warn(`Could not find email for user ${userId}`, userError)
    }

    // 3. Update Certificate Status (If certId exists)
    if (certId) {
        const { error: certError } = await supabase
            .from('certificates')
            .update({
                review_status: action,
                reviewed_at: new Date().toISOString(),
                reviewed_by: user.id
            })
            .eq('id', certId)

        if (certError) return { success: false, message: 'Failed to update certificate' }
    }

    // 4. Update Profile Status
    const newStatus = action === 'APPROVED' ? 'ACTIVE' : 'REVOKED'

    const { error: profileError } = await supabase
        .from('profiles')
        .update({
            status_access: newStatus,
            verified_badge: action === 'APPROVED' // Grant badge on approval
        })
        .eq('id', userId)

    if (profileError) return { success: false, message: 'Failed to update profile status' }

    // 5. Send Email Notification
    if (userEmail) {
        if (action === 'APPROVED') {
            await sendApprovalEmail(userEmail, userName)
        } else if (action === 'REJECTED') {
            await sendRejectionEmail(userEmail, userName)
        }
    } else {
        console.error('Skipping email notification: No email found.')
    }

    revalidatePath('/admin/certificates')
    revalidatePath('/admin/users') // Revalidate users page as well
    return { success: true, message: `Review ${action} processed successfully` }
}
