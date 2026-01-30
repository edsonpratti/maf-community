'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { CreatePostForm } from '@/components/ui/create-post-form'
import { formatRelativeTime } from '@/lib/utils'
import { Heart, MessageCircle, Share2 } from 'lucide-react'

type Post = {
  id: string
  content: string
  created_at: string
  user_id: string
  profiles?: {
    full_name: string | null
    avatar_url: string | null
    verified_badge: boolean
  }
}

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  async function loadPosts() {
    setLoading(true)

    // Buscar posts
    const { data: postsData, error: postsError } = await supabase
      .from('posts')
      .select('*')
      .eq('status', 'PUBLISHED')
      .order('created_at', { ascending: false })
      .limit(20)

    if (postsError) {
      console.error('Erro ao carregar posts:', postsError)
      setLoading(false)
      return
    }

    // Buscar perfis dos autores
    if (postsData && postsData.length > 0) {
      const userIds = [...new Set(postsData.map((post: any) => post.user_id))]
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, verified_badge')
        .in('id', userIds)

      // Criar mapa de perfis
      const profilesMap: Record<string, any> = {}
      profilesData?.forEach((profile: any) => {
        profilesMap[profile.id] = profile
      })

      // Combinar dados
      const postsWithProfiles = postsData.map((post: any) => ({
        ...post,
        profiles: profilesMap[post.user_id]
      }))
      setPosts(postsWithProfiles)
    } else {
      setPosts([])
    }

    setLoading(false)
  }

  useEffect(() => {
    loadPosts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <main className="container mx-auto max-w-2xl px-4 py-8">
      <CreatePostForm onPostCreated={loadPosts} />

      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Carregando posts...</p>
          </div>
        ) : posts?.map((post) => (
          <Card key={post.id}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={post.profiles?.avatar_url || undefined} />
                  <AvatarFallback>
                    {post.profiles?.full_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-1">
                    <p className="font-semibold">{post.profiles?.full_name}</p>
                    {post.profiles?.verified_badge && (
                      <span className="text-blue-500">✓</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatRelativeTime(post.created_at)}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{post.content}</p>
              <div className="mt-4 flex items-center gap-6 text-muted-foreground">
                <button className="flex items-center gap-2 hover:text-primary">
                  <Heart className="h-5 w-5" />
                  <span className="text-sm">0</span>
                </button>
                <button className="flex items-center gap-2 hover:text-primary">
                  <MessageCircle className="h-5 w-5" />
                  <span className="text-sm">0</span>
                </button>
                <button className="flex items-center gap-2 hover:text-primary">
                  <Share2 className="h-5 w-5" />
                </button>
              </div>
            </CardContent>
          </Card>
        ))}

        {(!loading && (!posts || posts.length === 0)) && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Nenhuma postagem ainda. Seja o primeiro a postar!
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
