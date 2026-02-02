'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from './button'
import { Card } from './card'
import { Image as ImageIcon, X } from 'lucide-react'
import Image from 'next/image'
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
  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length + images.length > 4) {
      alert('Máximo de 4 imagens por post')
      return
    }

    setImages([...images, ...files])
    
    // Create previews
    files.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
    setImagePreviews(imagePreviews.filter((_, i) => i !== index))
  }

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

      // Upload images if any
      const mediaUrls: { type: string; path: string }[] = []
      
      if (images.length > 0) {
        for (const image of images) {
          const fileExt = image.name.split('.').pop()
          const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
          
          const { error: uploadError } = await supabase.storage
            .from('post-media')
            .upload(fileName, image)

          if (uploadError) {
            console.error('Erro ao fazer upload:', uploadError)
            continue
          }

          // Salvar apenas o caminho, não a URL
          mediaUrls.push({ type: 'image', path: fileName })
        }
      }

      const { error } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          content: content.trim(),
          category: category,
          status: 'PUBLISHED',
          visibility: 'COMMUNITY_ONLY',
          media: mediaUrls.length > 0 ? mediaUrls : null,
        })

      if (error) {
        console.error('Erro ao criar post:', error)
        alert('Erro ao criar post: ' + error.message)
      } else {
        setContent('')
        setCategory('GERAL')
        setImages([])
        setImagePreviews([])
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

            {/* Image Previews */}
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mt-3">
                {imagePreviews.map((preview, idx) => (
                  <div key={idx} className="relative aspect-square rounded-lg overflow-hidden">
                    <Image src={preview} alt="Preview" fill className="object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {isExpanded && (
              <div className="flex items-center justify-between mt-3 pt-3 border-t">
                <div className="flex items-center gap-2">
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
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={images.length >= 4}
                  title="Adicionar imagens (máx. 4)"
                >
                  <ImageIcon className="h-5 w-5" />
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageSelect}
                  className="hidden"
                />
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
