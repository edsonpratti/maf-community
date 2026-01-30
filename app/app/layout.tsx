import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Header } from '@/components/ui/header'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect('/onboarding')
  }

  if (profile.status_access !== 'ACTIVE') {
    redirect('/status')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        userRole={profile.role} 
        userName={profile.full_name || user.email || ''} 
      />
      {children}
    </div>
  )
}
