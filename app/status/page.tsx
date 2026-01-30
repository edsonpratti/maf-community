import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, CheckCircle2, Clock, XCircle } from 'lucide-react'

export default async function StatusPage() {
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

  const statusConfig = {
    PENDING: {
      icon: Clock,
      title: 'Aguardando Validação',
      description: 'Seu cadastro foi recebido e está aguardando validação da equipe.',
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
    },
    UNDER_REVIEW: {
      icon: AlertCircle,
      title: 'Em Análise',
      description: 'Estamos analisando seu certificado. Isso pode levar até 24 horas.',
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    ACTIVE: {
      icon: CheckCircle2,
      title: 'Acesso Liberado!',
      description: 'Parabéns! Seu acesso à plataforma foi aprovado.',
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    SUSPENDED: {
      icon: XCircle,
      title: 'Acesso Suspenso',
      description: 'Sua conta foi suspensa. Entre em contato com o suporte.',
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
    REVOKED: {
      icon: XCircle,
      title: 'Acesso Revogado',
      description: 'Seu acesso foi revogado. Entre em contato com o suporte.',
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
  }

  const status = statusConfig[profile.status_access as keyof typeof statusConfig]
  const Icon = status.icon

  if (profile.status_access === 'ACTIVE') {
    redirect('/app/feed')
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className={`mb-4 inline-flex rounded-full p-3 ${status.bg}`}>
            <Icon className={`h-8 w-8 ${status.color}`} />
          </div>
          <CardTitle>{status.title}</CardTitle>
          <CardDescription>{status.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="rounded-lg border p-4">
              <h3 className="font-medium mb-2">Informações da Conta</h3>
              <dl className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Nome:</dt>
                  <dd>{profile.full_name}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Email:</dt>
                  <dd>{user.email}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Status:</dt>
                  <dd className={status.color}>{profile.status_access}</dd>
                </div>
              </dl>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
