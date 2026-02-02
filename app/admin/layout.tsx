import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = (await createClient()) as any

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Verificar se o usuário é ADMIN
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, status_access')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'ADMIN') {
    redirect('/app/feed')
  }

  if (profile.status_access !== 'ACTIVE') {
    redirect('/status')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/admin/dashboard" className="text-xl font-bold text-primary flex items-center gap-2">
                  🛡️ MAF Admin
                </Link>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  href="/admin/dashboard"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  href="/admin/users"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Usuários
                </Link>
                <Link
                  href="/admin/reports"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Denúncias
                </Link>

                <Link
                  href="/app/feed"
                  className="border-transparent text-blue-600 hover:text-blue-800 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ml-4"
                >
                  ➔ Voltar ao App
                </Link>
              </div>
            </div>

            {/* Mobile Menu Button - Simplified Placeholder */}
            <div className="flex items-center sm:hidden">
              <span className="text-xs text-muted-foreground mr-2">Menu no Desktop</span>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}
