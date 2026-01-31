'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from './button'

type HeaderProps = {
  userRole?: string
  userName?: string
}

export function Header({ userRole, userName }: HeaderProps) {
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="bg-white border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-bold text-gray-900">
              MAF Community
            </h1>
            <nav className="hidden md:flex gap-6">
              <Link
                href="/app/feed"
                className="text-gray-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Feed
              </Link>
              <Link
                href="/app/materials"
                className="text-gray-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Materiais
              </Link>
              <Link
                href="/app/profile"
                className="text-gray-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Perfil
              </Link>
              {userRole === 'ADMIN' && (
                <Link
                  href="/admin/dashboard"
                  className="text-primary hover:text-primary/80 px-3 py-2 rounded-md text-sm font-bold bg-primary/5 border border-primary/20 flex items-center gap-1 transition-colors"
                >
                  🛡️ Admin
                </Link>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 hidden sm:inline">
              {userName}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
            >
              Sair
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
