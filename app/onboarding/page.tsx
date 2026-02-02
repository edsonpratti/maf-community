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
    console.log('Submitting form...', formData)
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      console.log('User:', user)

      if (!user) throw new Error('Usuário não autenticado')

      // Create profile logic updated
      const status = certificateFile ? 'UNDER_REVIEW' : 'PENDING'
      console.log('Status to set:', status)

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: formData.fullName,
          bio: formData.bio || null,
          status_access: status,
        })

      if (profileError) {
        console.error('Profile Error:', profileError)
        throw profileError
      }

      // Upload certificate if provided
      if (certificateFile) {
        console.log('Uploading certificate...')
        const fileExt = certificateFile.name.split('.').pop()
        const fileName = `${user.id}-${Date.now()}.${fileExt}`
        const filePath = `${user.id}/${fileName}` // Use user ID as folder

        const { error: uploadError } = await supabase.storage
          .from('certificates')
          .upload(filePath, certificateFile)

        if (uploadError) {
          console.error('Upload Error:', uploadError)
          throw uploadError
        }

        // Create certificate record
        const { error: certError } = await supabase
          .from('certificates')
          .insert({
            user_id: user.id,
            file_path: filePath,
            file_hash: '', // TODO: Add hash calculation
            review_status: 'UPLOADED',
          })

        if (certError) {
          console.error('Cert Record Error:', certError)
          throw certError
        }
      }

      // Create hotmart customer record
      if (formData.hotmartEmail) {
        const { error: hotmartError } = await supabase
          .from('hotmart_customers')
          .insert({
            user_id: user.id,
            hotmart_email: formData.hotmartEmail,
          })

        if (hotmartError) {
          console.error('Hotmart Error:', hotmartError)
          throw hotmartError
        }
      }

      console.log('Success! Redirecting...')
      router.push('/status')
      router.refresh()
    } catch (error: any) {
      console.error('Catch Error:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-primary">Bem-vinda à Comunidade MAF</CardTitle>
          <CardDescription>
            Para garantir a exclusividade e segurança do nosso ambiente, precisamos validar sua habilitação profissional.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive flex items-center gap-2">
                ⚠️ {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Nome Completo *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                  className="bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio Profissional</Label>
                <Input
                  id="bio"
                  placeholder="Ex: Especialista em..."
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="bg-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hotmartEmail">Email de Compra Hotmart *</Label>
                  <Input
                    id="hotmartEmail"
                    type="email"
                    placeholder="email@exemplo.com"
                    value={formData.hotmartEmail}
                    onChange={(e) => setFormData({ ...formData, hotmartEmail: e.target.value })}
                    required
                    className="bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="orderId">ID do Pedido (Opcional)</Label>
                  <Input
                    id="orderId"
                    placeholder="Ex: HPM..."
                    value={formData.orderId}
                    onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
                    className="bg-white"
                  />
                </div>
              </div>

              <div className="pt-4 border-t">
                <Label className="text-base font-semibold mb-2 block">Envio do Certificado/Comprovante *</Label>
                <div className="bg-blue-50/50 border-2 border-dashed border-blue-200 rounded-lg p-6 text-center hover:bg-blue-50 transition-colors">
                  <div className="flex flex-col items-center gap-2">
                    <div className="p-3 bg-white rounded-full shadow-sm">
                      <Upload className="h-6 w-6 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="certificate" className="cursor-pointer text-primary font-medium hover:underline">
                        Clique para selecionar o arquivo
                      </Label>
                      <p className="text-xs text-muted-foreground">PDF, JPG ou PNG (Max 5MB)</p>
                    </div>
                    <Input
                      id="certificate"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => setCertificateFile(e.target.files?.[0] || null)}
                      className="hidden"
                      required
                    />
                    {certificateFile && (
                      <div className="mt-2 text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">
                        Arquivo selecionado: {certificateFile.name}
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2 px-1">
                  * O envio do certificado é obrigatório para a liberação do acesso. Seus dados serão analisados por nossa equipe.
                </p>
              </div>
            </div>

            <Button type="submit" className="w-full text-lg h-12" disabled={loading}>
              {loading ? 'Enviando dados...' : 'Enviar para Análise'}
            </Button>
          </CardContent>
        </form>
      </Card>
    </div>
  )
}
