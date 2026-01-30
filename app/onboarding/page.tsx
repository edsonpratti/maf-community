'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload } from 'lucide-react'

export default function OnboardingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    fullName: '',
    bio: '',
    hotmartEmail: '',
    orderId: '',
  })
  const [certificateFile, setCertificateFile] = useState<File | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) throw new Error('Usuário não autenticado')

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: formData.fullName,
          bio: formData.bio || null,
          status_access: 'PENDING',
        })

      if (profileError) throw profileError

      // Upload certificate if provided
      if (certificateFile) {
        const fileExt = certificateFile.name.split('.').pop()
        const fileName = `${user.id}-${Date.now()}.${fileExt}`
        const filePath = `certificates/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('certificates')
          .upload(filePath, certificateFile)

        if (uploadError) throw uploadError

        // Create certificate record
        const { error: certError } = await supabase
          .from('certificates')
          .insert({
            user_id: user.id,
            file_path: filePath,
            file_hash: '', // TODO: Add hash calculation
            review_status: 'UPLOADED',
          })

        if (certError) throw certError
      }

      // Create hotmart customer record
      if (formData.hotmartEmail) {
        const { error: hotmartError } = await supabase
          .from('hotmart_customers')
          .insert({
            user_id: user.id,
            hotmart_email: formData.hotmartEmail,
          })

        if (hotmartError) throw hotmartError
      }

      router.push('/status')
      router.refresh()
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Complete seu Perfil</CardTitle>
          <CardDescription>
            Preencha seus dados e envie seu certificado para validação
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="fullName">Nome Completo *</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio (opcional)</Label>
              <Input
                id="bio"
                placeholder="Conte um pouco sobre você..."
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hotmartEmail">Email de Compra Hotmart *</Label>
              <Input
                id="hotmartEmail"
                type="email"
                placeholder="email@hotmart.com"
                value={formData.hotmartEmail}
                onChange={(e) => setFormData({ ...formData, hotmartEmail: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="orderId">ID do Pedido (opcional)</Label>
              <Input
                id="orderId"
                placeholder="HPM12345678"
                value={formData.orderId}
                onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="certificate">Certificado de Compra</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="certificate"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setCertificateFile(e.target.files?.[0] || null)}
                  className="flex-1"
                />
                <Upload className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground">
                Envie um comprovante de compra (PDF, JPG ou PNG)
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar para Validação'}
            </Button>
          </CardContent>
        </form>
      </Card>
    </div>
  )
}
