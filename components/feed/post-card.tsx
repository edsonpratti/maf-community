'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatRelativeTime } from '@/lib/utils'
import { Heart, MessageCircle, Share2, Flag, Send, MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { ReportDialog } from './report-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import Image from 'next/image'

type Profile = {
    full_name: string | null
    avatar_url: string | null
    verified_badge: boolean
}

type Comment = {
    id: string
    content: string
    created_at: string
    user_id: string
    profiles?: Profile
}

type Post = {
    id: string
    content: string
    created_at: string
    user_id: string
    media?: { type: string; path: string; url?: string }[] | null
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
    const [showComments, setShowComments] = useState(false)
    const [comments, setComments] = useState<Comment[]>([])
    const [newComment, setNewComment] = useState('')
    const [isCommentLoading, setIsCommentLoading] = useState(false)
    const [commentsCount, setCommentsCount] = useState(post.comments_count || 0)
    const [mediaUrls, setMediaUrls] = useState<string[]>([])
    const [isEditing, setIsEditing] = useState(false)
    const [editContent, setEditContent] = useState(post.content)
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
    const [editCommentContent, setEditCommentContent] = useState('')
    const supabase = createClient()

    // Carregar signed URLs para as imagens
    useEffect(() => {
        const loadMediaUrls = async () => {
            if (!post.media || post.media.length === 0) return
            
            const urls = await Promise.all(
                post.media.map(async (item) => {
                    if (item.path) {
                        const { data } = await supabase.storage
                            .from('post-media')
                            .createSignedUrl(item.path, 3600)
                        return data?.signedUrl || ''
                    }
                    return item.url || ''
                })
            )
            setMediaUrls(urls.filter(url => url))
        }
        loadMediaUrls()
    }, [post.media])

    const handleDeletePost = async () => {
        if (!confirm('Tem certeza que deseja excluir este post?')) return

        try {
            const { error } = await supabase
                .from('posts')
                .delete()
                .eq('id', post.id)

            if (error) throw error
            toast.success('Post excluído com sucesso')
            window.location.reload()
        } catch (error) {
            toast.error('Erro ao excluir post')
        }
    }

    const handleEditPost = async () => {
        if (!editContent.trim()) return

        try {
            const { error } = await supabase
                .from('posts')
                .update({ content: editContent.trim() })
                .eq('id', post.id)

            if (error) throw error
            toast.success('Post atualizado!')
            setIsEditing(false)
            window.location.reload()
        } catch (error) {
            toast.error('Erro ao atualizar post')
        }
    }

    const handleDeleteComment = async (commentId: string) => {
        if (!confirm('Tem certeza que deseja excluir este comentário?')) return

        try {
            const { error } = await supabase
                .from('comments')
                .delete()
                .eq('id', commentId)

            if (error) throw error
            setComments(comments.filter(c => c.id !== commentId))
            setCommentsCount(commentsCount - 1)
            toast.success('Comentário excluído')
        } catch (error) {
            toast.error('Erro ao excluir comentário')
        }
    }

    const handleEditComment = async (commentId: string) => {
        if (!editCommentContent.trim()) return

        try {
            const { error } = await supabase
                .from('comments')
                .update({ content: editCommentContent.trim() })
                .eq('id', commentId)

            if (error) throw error
            
            setComments(comments.map(c => 
                c.id === commentId ? { ...c, content: editCommentContent.trim() } : c
            ))
            setEditingCommentId(null)
            setEditCommentContent('')
            toast.success('Comentário atualizado')
        } catch (error) {
            toast.error('Erro ao atualizar comentário')
        }
    }

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

    const loadComments = async () => {
        try {
            const response = await fetch(`/api/posts/${post.id}/comments`)
            if (response.ok) {
                const data = await response.json()
                setComments(data)
            }
        } catch (error) {
            console.error('Erro ao carregar comentários:', error)
        }
    }

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newComment.trim() || isCommentLoading) return

        setIsCommentLoading(true)
        try {
            const response = await fetch(`/api/posts/${post.id}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: newComment.trim() }),
            })

            if (response.ok) {
                const comment = await response.json()
                setComments([...comments, comment])
                setCommentsCount(commentsCount + 1)
                setNewComment('')
                toast.success('Comentário publicado!')
            } else {
                toast.error('Erro ao publicar comentário')
            }
        } catch (error) {
            toast.error('Erro ao publicar comentário')
        } finally {
            setIsCommentLoading(false)
        }
    }

    const toggleComments = () => {
        const newShowComments = !showComments
        setShowComments(newShowComments)
        if (newShowComments && comments.length === 0) {
            loadComments()
        }
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
                    <div className="flex gap-1">
                        {post.user_id === currentUserId && (
                            <div className="flex gap-1">
                                <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => setIsEditing(!isEditing)}
                                    className="text-muted-foreground h-8 w-8"
                                >
                                    <Pencil className="h-4 w-4" />
                                </Button>
                                <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={handleDeletePost}
                                    className="text-muted-foreground hover:text-red-500 h-8 w-8"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                        <ReportDialog targetId={post.id} targetType="POST">
                            <Button variant="ghost" size="icon" className="text-muted-foreground h-8 w-8">
                                <Flag className="h-4 w-4" />
                            </Button>
                        </ReportDialog>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {isEditing ? (
                    <div className="space-y-2">
                        <Textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="min-h-[100px]"
                        />
                        <div className="flex gap-2 justify-end">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setIsEditing(false)
                                    setEditContent(post.content)
                                }}
                            >
                                Cancelar
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleEditPost}
                                disabled={!editContent.trim()}
                            >
                                Salvar
                            </Button>
                        </div>
                    </div>
                ) : (
                    <p className="whitespace-pre-wrap">{renderContent(post.content)}</p>
                )}
                
                {/* Media Gallery */}
                {mediaUrls.length > 0 && (
                    <div className="mt-3 grid gap-2" style={{
                        gridTemplateColumns: mediaUrls.length === 1 ? '1fr' : 'repeat(2, 1fr)'
                    }}>
                        {mediaUrls.map((url, idx) => (
                            <div key={idx} className="relative aspect-square rounded-lg overflow-hidden">
                                <Image
                                    src={url}
                                    alt="Post media"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        ))}
                    </div>
                )}

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
                    <button 
                        onClick={toggleComments}
                        className="flex items-center gap-2 hover:text-primary"
                    >
                        <MessageCircle className="h-5 w-5" />
                        <span className="text-sm">{commentsCount}</span>
                    </button>
                    <button className="flex items-center gap-2 hover:text-primary">
                        <Share2 className="h-5 w-5" />
                    </button>
                </div>

                {/* Comments Section */}
                {showComments && (
                    <div className="mt-4 pt-4 border-t space-y-4">
                        {comments.map((comment) => (
                            <div key={comment.id} className="flex gap-3">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={comment.profiles?.avatar_url || undefined} />
                                    <AvatarFallback>
                                        {comment.profiles?.full_name?.charAt(0) || 'U'}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    {editingCommentId === comment.id ? (
                                        <div className="space-y-2">
                                            <Input
                                                value={editCommentContent}
                                                onChange={(e) => setEditCommentContent(e.target.value)}
                                                className="text-sm"
                                            />
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => {
                                                        setEditingCommentId(null)
                                                        setEditCommentContent('')
                                                    }}
                                                >
                                                    Cancelar
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleEditComment(comment.id)}
                                                    disabled={!editCommentContent.trim()}
                                                >
                                                    Salvar
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="bg-gray-100 rounded-lg px-3 py-2">
                                                <div className="flex items-start justify-between">
                                                    <p className="text-sm font-semibold">
                                                        {comment.profiles?.full_name}
                                                    </p>
                                                    {comment.user_id === currentUserId && (
                                                        <div className="flex gap-1 ml-2">
                                                            <button
                                                                onClick={() => {
                                                                    setEditingCommentId(comment.id)
                                                                    setEditCommentContent(comment.content)
                                                                }}
                                                                className="text-gray-500 hover:text-gray-700 p-1"
                                                            >
                                                                <Pencil className="h-3 w-3" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteComment(comment.id)}
                                                                className="text-gray-500 hover:text-red-500 p-1"
                                                            >
                                                                <Trash2 className="h-3 w-3" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                                <p className="text-sm">{comment.content}</p>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1 ml-3">
                                                {formatRelativeTime(comment.created_at)}
                                            </p>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                        
                        {/* Comment Input */}
                        <form onSubmit={handleCommentSubmit} className="flex gap-2">
                            <Input
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Escreva um comentário..."
                                disabled={isCommentLoading}
                            />
                            <Button 
                                type="submit" 
                                size="icon"
                                disabled={!newComment.trim() || isCommentLoading}
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                        </form>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
