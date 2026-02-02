'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export type ActionResult = {
    success: boolean
    message: string
}

export async function deleteUser(userId: string): Promise<ActionResult> {
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

    // 2. Delete User from Auth (Cascades to public tables)
    const adminSupabase = createAdminClient()
    const { error } = await adminSupabase.auth.admin.deleteUser(userId)

    if (error) {
        console.error('Error deleting user:', error)
        return { success: false, message: 'Failed to delete user: ' + error.message }
    }

    revalidatePath('/admin/users')
    return { success: true, message: 'Usuário excluído com sucesso.' }
}
