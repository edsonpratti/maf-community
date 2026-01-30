import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'

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
                      <span className="text-blue-500 text-xl">✓</span>
                    )}
                  </div>
                  <p className="text-muted-foreground">{user.email}</p>
                  {profile.bio && (
                    <p className="mt-2 text-sm">{profile.bio}</p>
                  )}
                </div>
              </div>
              <form action={handleLogout}>
                <Button variant="outline" type="submit">
                  Sair
                </Button>
              </form>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{posts?.length || 0}</div>
                <div className="text-sm text-muted-foreground">Posts</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {profile.role === 'ADMIN' ? 'Admin' : profile.role === 'MOD' ? 'Moderador' : 'Membro'}
                </div>
                <div className="text-sm text-muted-foreground">Função</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{formatDate(profile.created_at)}</div>
                <div className="text-sm text-muted-foreground">Membro desde</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Minhas Postagens</CardTitle>
          </CardHeader>
          <CardContent>
            {posts && posts.length > 0 ? (
              <div className="space-y-4">
                {posts.map((post: any) => (
                  <div key={post.id} className="border-b pb-4 last:border-0">
                    <p className="whitespace-pre-wrap">{post.content}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {formatDate(post.created_at)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Você ainda não fez nenhuma postagem
              </p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
