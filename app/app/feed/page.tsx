'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CreatePostForm } from '@/components/ui/create-post-form'
import { PostCard } from '@/components/feed/post-card'
import { Loader2 } from 'lucide-react'

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
  user_has_liked?: boolean
  likes_count?: number
  comments_count?: number
}

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string>('')
  const supabase = createClient()

  async function loadPosts() {
    setLoading(true)

    // Get current user first
    const { data: { user } } = await supabase.auth.getUser()
    if (user) setCurrentUserId(user.id)

    // Buscar posts
    const { data: postsData, error: postsError } = await supabase
      .from('posts')
      .select(`
        *,
        profiles:user_id (
          full_name,
          avatar_url,
          verified_badge
        ),
        reactions (
          user_id,
          type
        ),
        comments (count)
      `)
      .eq('status', 'PUBLISHED')
      .order('created_at', { ascending: false })
      .limit(20)

    if (postsError) {
      console.error('Erro ao carregar posts:', postsError)
      setLoading(false)
      return
    }

    // Process data to include counts and user specific state
    const processedPosts = postsData?.map((post: any) => ({
      ...post,
      likes_count: post.reactions?.filter((r: any) => r.type === 'LIKE').length || 0,
      user_has_liked: user ? post.reactions?.some((r: any) => r.user_id === user.id && r.type === 'LIKE') : false,
      comments_count: post.comments?.[0]?.count || 0,
      // Fix profile structure if it's an array or object
      profiles: Array.isArray(post.profiles) ? post.profiles[0] : post.profiles
    }))

    setPosts(processedPosts || [])
    setLoading(false)
  }

  useEffect(() => {
    loadPosts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <main className="container mx-auto max-w-2xl px-4 py-8">
      <CreatePostForm onPostCreated={loadPosts} />

      <div className="space-y-6 mt-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : posts?.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            currentUserId={currentUserId}
          />
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
