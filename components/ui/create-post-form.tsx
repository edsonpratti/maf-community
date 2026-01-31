'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from './button'
import { Card } from './card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select'

type CreatePostFormProps = {
  onPostCreated?: () => void
}

export function CreatePostForm({ onPostCreated }: CreatePostFormProps) {
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('GERAL')
  const [loading, setLoading] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!content.trim()) {
      alert('Escreva algo para publicar!')
      return
    }

    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        alert('Você precisa estar logado')
        return
      }

      const { error } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          content: content.trim(),
          category: category,
          status: 'PUBLISHED',
          visibility: 'COMMUNITY_ONLY',
        })

      if (error) {
        console.error('Erro ao criar post:', error)
        alert('Erro ao criar post: ' + error.message)
      } else {
        setContent('')
        setCategory('GERAL')
        setIsExpanded(false)
        alert('Post criado com sucesso!')
        onPostCreated?.()
      }
    } catch (err) {
      console.error('Erro inesperado:', err)
      alert('Erro ao criar post')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="p-4 mb-6">
      <form onSubmit={handleSubmit}>
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
              U
            </div>
          </div>
          <div className="flex-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onFocus={() => setIsExpanded(true)}
              placeholder="No que você está pensando?"
              className="w-full border-0 focus:ring-0 resize-none text-gray-900 placeholder-gray-400 bg-transparent"
              rows={isExpanded ? 4 : 1}
            />

            {isExpanded && (
              <div className="flex items-center justify-between mt-3 pt-3 border-t">
                <div className="w-40">
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GERAL">Geral</SelectItem>
                      <SelectItem value="RESULTADOS">Resultados</SelectItem>
                      <SelectItem value="DUVIDAS">Dúvidas</SelectItem>
                      <SelectItem value="IDEIAS">Ideias</SelectItem>
                      <SelectItem value="MATERIAIS">Materiais</SelectItem>
                      <SelectItem value="AVISOS_OFICIAIS">Avisos Oficiais</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsExpanded(false)
                      setContent('')
                    }}
                    disabled={loading}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={loading || !content.trim()}
                  >
                    {loading ? 'Publicando...' : 'Publicar'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </form>
    </Card>
  )
}
