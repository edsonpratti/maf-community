'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatRelativeTime } from '@/lib/utils'
import { Heart, MessageCircle, Share2, Flag } from 'lucide-react'
import { ReportDialog } from './report-dialog'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

type Profile = {
    full_name: string | null
    avatar_url: string | null
    verified_badge: boolean
}

type Post = {
    id: string
    content: string
    created_at: string
    user_id: string
    profiles?: Profile
    likes_count?: number
    comments_count?: number
    user_has_liked?: boolean
}

interface PostCardProps {
    post: Post
    currentUserId?: string
}

export function PostCard({ post, currentUserId }: PostCardProps) {
    const [isLikeLoading, setIsLikeLoading] = useState(false)
    const [hasLiked, setHasLiked] = useState(post.user_has_liked || false)
    const [likesCount, setLikesCount] = useState(post.likes_count || 0)

    // Extract hashtags
    const renderContent = (content: string) => {
        const parts = content.split(/(\s+)/)
        return parts.map((part, index) => {
            if (part.startsWith('#') && part.length > 1) {
                return (
                    <span key={index} className="text-blue-500 font-medium">
                        {part}
                    </span>
                )
            }
            return part
        })
    }

    const handleLike = async () => {
        if (isLikeLoading) return
        setIsLikeLoading(true)

        const supabase = createClient()
        const newHasLiked = !hasLiked
        const newCount = newHasLiked ? likesCount + 1 : likesCount - 1

        // Optimistic update
        setHasLiked(newHasLiked)
        setLikesCount(newCount)

        try {
            if (newHasLiked) {
                await supabase.from('reactions').insert({
                    post_id: post.id,
                    user_id: currentUserId,
                    type: 'LIKE',
                })
            } else {
                await supabase
                    .from('reactions')
                    .delete()
                    .match({ post_id: post.id, user_id: currentUserId, type: 'LIKE' })
            }
        } catch (error) {
            // Revert if error
            setHasLiked(!newHasLiked)
            setLikesCount(likesCount)
            toast.error('Erro ao curtir post')
        } finally {
            setIsLikeLoading(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
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
                                    <span className="text-blue-500" title="Verificado">
                                        ✓
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {formatRelativeTime(post.created_at)}
                            </p>
                        </div>
                    </div>
                    <ReportDialog targetId={post.id} targetType="POST">
                        <Button variant="ghost" size="icon" className="text-muted-foreground">
                            <Flag className="h-4 w-4" />
                        </Button>
                    </ReportDialog>
                </div>
            </CardHeader>
            <CardContent>
                <p className="whitespace-pre-wrap">{renderContent(post.content)}</p>
                <div className="mt-4 flex items-center gap-6 text-muted-foreground">
                    <button
                        onClick={handleLike}
                        disabled={isLikeLoading}
                        className={cn(
                            "flex items-center gap-2 hover:text-red-500 transition-colors",
                            hasLiked && "text-red-500"
                        )}
                    >
                        <Heart className={cn("h-5 w-5", hasLiked && "fill-current")} />
                        <span className="text-sm">{likesCount}</span>
                    </button>
                    <button className="flex items-center gap-2 hover:text-primary">
                        <MessageCircle className="h-5 w-5" />
                        <span className="text-sm">{post.comments_count || 0}</span>
                    </button>
                    <button className="flex items-center gap-2 hover:text-primary">
                        <Share2 className="h-5 w-5" />
                    </button>
                </div>
            </CardContent>
        </Card>
    )
}
