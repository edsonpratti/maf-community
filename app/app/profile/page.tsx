import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import { EditProfileDialog } from '@/components/profile/edit-profile-dialog'

export default async function ProfilePage() {
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

  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'PUBLISHED')
    .order('created_at', { ascending: false })

  const handleLogout = async () => {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <h1 className="text-2xl font-bold">MAF Community</h1>
          <nav className="flex items-center gap-4">
            <Link href="/app/feed" className="text-sm font-medium">
              Feed
            </Link>
            <Link href="/app/materials" className="text-sm font-medium">
              Biblioteca
            </Link>
            <Link href="/app/profile" className="text-sm font-medium text-primary">
              Perfil
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto max-w-4xl px-4 py-8">
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profile.avatar_url || undefined} />
                  <AvatarFallback className="text-2xl">
                    {profile.full_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold">{profile.full_name}</h2>
                    {profile.verified_badge && (
                      <span className="text-blue-500 text-xl" title="Habilitada Verificada">✓</span>
                    )}
                  </div>
                  <div className="flex flex-col gap-1 mt-1 text-sm text-muted-foreground">
                    <p>{user.email}</p>
                    {profile.city && (
                      <p className="flex items-center gap-1">
                        📍 {profile.city}
                      </p>
                    )}
                  </div>
                  {profile.bio && (
                    <p className="mt-4 text-sm leading-relaxed max-w-lg">{profile.bio}</p>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2 items-end">
                <form action={handleLogout}>
                  <Button variant="ghost" size="sm" type="submit" className="text-muted-foreground hover:text-destructive">
                    Sair
                  </Button>
                </form>
                <EditProfileDialog profile={profile} />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 border-t">
            <div className="grid grid-cols-3 gap-8 text-center divide-x">
              <div>
                <div className="text-3xl font-bold text-primary">{posts?.length || 0}</div>
                <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground mt-1">Contribuições</div>
              </div>
              <div>
                <div className="text-lg font-bold mt-1.5">
                  {profile.role === 'ADMIN' ? 'Admin' : profile.role === 'MOD' ? 'Moderadora' : 'Habilitada'}
                </div>
                <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground mt-2">Nível</div>
              </div>
              <div>
                <div className="text-lg font-bold mt-1.5">{formatDate(profile.created_at)}</div>
                <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground mt-2">Data de Habilitação</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Histórico de Contribuições</CardTitle>
          </CardHeader>
          <CardContent>
            {posts && posts.length > 0 ? (
              <div className="space-y-6">
                {posts.map((post: any) => (
                  <div key={post.id} className="border-b pb-6 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                        {post.category || 'GERAL'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(post.created_at)}
                      </span>
                    </div>
                    <p className="whitespace-pre-wrap leading-relaxed text-sm">{post.content}</p>
                    <div className="flex gap-4 mt-3 text-muted-foreground text-xs">
                      <span>❤️ {post.reactions?.filter((r: any) => r.type === 'LIKE').length || 0}</span>
                      <span>💬 {post.comments?.length || 0}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-12">
                Nenhuma contribuição pública ainda.
              </p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
