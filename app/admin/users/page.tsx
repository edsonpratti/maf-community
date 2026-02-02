'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, CheckCircle2, XCircle, FileText, UserCheck, Ban, Trash2 } from 'lucide-react'
import { CertificateReviewDialog } from '@/components/admin/certificate-review-dialog'
import { deleteUser } from '@/app/actions/admin-users'
// We might need to import Server Actions for status updates if we want to bypass RLS or stick to client side if allowed. 
// For Profile Status updates (Active/Suspend), previous code used client side. Let's stick to it if RLS allows admins.
// For Certificate, we use the dialog which uses the Server Action.

type ProfileWithCert = {
  id: string
  full_name: string | null
  email: string
  status_access: string
  role: string
  created_at: string
  verified_badge: boolean
  certificates: {
    id: string
    file_path: string
    review_status: string // UPLOADED, APPROVED, REJECTED
    created_at: string
  }[]
  certificateUrl?: string | null // generated signed url
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  UNDER_REVIEW: 'bg-orange-100 text-orange-800 border-orange-200',
  ACTIVE: 'bg-green-100 text-green-800 border-green-200',
  SUSPENDED: 'bg-red-100 text-red-800 border-red-200',
  REVOKED: 'bg-gray-100 text-gray-800 border-gray-200',
}

const statusLabels: Record<string, string> = {
  PENDING: 'Pendente',
  UNDER_REVIEW: 'Em Análise',
  ACTIVE: 'Ativo',
  SUSPENDED: 'Suspenso',
  REVOKED: 'Revogado',
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<ProfileWithCert[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('ALL')
  const [selectedUser, setSelectedUser] = useState<ProfileWithCert | null>(null)
  const [isReviewOpen, setIsReviewOpen] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    loadUsers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter])

  async function loadUsers() {
    setLoading(true)

    // Fetch profiles first
    let query = supabase
      .from('profiles')
      .select('*, certificates:certificates!certificates_user_id_fkey(id, file_path, review_status, created_at)')
      .order('created_at', { ascending: false })

    if (filter !== 'ALL') {
      // If filtering by certificate status (e.g. users with pending certificates), 
      // simple filtering on joined table with supabase js is tricky.
      // We filter by Profile Status for now as done previously.
      // If we want to filter by "Certificate Pending", we might need logic.
      if (filter === 'HAS_CERTIFICATE') {
        // Handle in memory or separate logic
      } else {
        query = query.eq('status_access', filter)
      }
    }

    const { data, error } = await query

    if (error) {
      console.error('Erro ao carregar usuários:', error)
      alert('Erro ao carregar usuários: ' + error.message)
      setLoading(false)
      return
    }

    // Process data and generate URLs for certificates
    // We assume the latest certificate is the relevant one
    const usersWithSignedUrls = await Promise.all((data as any[]).map(async (user) => {
      // Sort certificates by date desc
      const sortedCerts = (user.certificates || []).sort((a: any, b: any) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      const latestCert = sortedCerts[0]
      let url = null

      if (latestCert) {
        const { data: urlData } = await supabase.storage
          .from('certificates')
          .createSignedUrl(latestCert.file_path, 3600)
        url = urlData?.signedUrl
      }

      return {
        ...user,
        certificates: sortedCerts,
        certificateUrl: url
      }
    }))

    setUsers(usersWithSignedUrls)
    setLoading(false)
  }

  async function updateUserStatus(userId: string, newStatus: string) {
    if (!confirm(`Tem certeza que deseja alterar o status para ${newStatus}?`)) return

    const { error } = await supabase
      .from('profiles')
      .update({ status_access: newStatus })
      .eq('id', userId)

    if (error) {
      alert('Erro ao atualizar status: ' + error.message)
    } else {
      loadUsers()
    }
  }

  async function handleDeleteUser(userId: string) {
    if (!confirm('ATENÇÃO: Isso excluirá PERMANENTEMENTE o usuário e todos os seus dados. Tem certeza?')) return

    const result = await deleteUser(userId)
    if (result.success) {
      alert('Usuário excluído com sucesso.')
      loadUsers()
    } else {
      alert(result.message)
    }
  }

  const openReview = (user: ProfileWithCert) => {
    setSelectedUser(user)
    setIsReviewOpen(true)
  }

  return (
    <div className="px-4 sm:px-0 container mx-auto py-8">
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Gerenciamento de Usuários</h2>
          <p className="text-gray-500 mt-2">Administre acessos, cadastros e valide certificados em um só lugar.</p>
        </div>
        <div className="mt-4 sm:mt-0 w-full sm:w-auto">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
          >
            <option value="ALL">Todos os Status</option>
            <option value="PENDING">Pendentes</option>
            <option value="UNDER_REVIEW">Em Análise (Com Certificado)</option>
            <option value="ACTIVE">Ativos</option>
            <option value="SUSPENDED">Suspensos</option>
            <option value="REVOKED">Revogados</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-2 text-gray-500">Carregando dados...</span>
        </div>
      ) : users.length === 0 ? (
        <Card className="p-12 text-center bg-gray-50 border-dashed">
          <div className="flex flex-col items-center">
            <UserCheck className="w-12 h-12 text-gray-300 mb-4" />
            <p className="text-lg font-medium text-gray-900">Nenhum usuário encontrado</p>
            <p className="text-sm text-gray-500">Tente alterar os filtros de busca.</p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4">
          {users.map((user) => {
            const hasCertificate = user.certificates && user.certificates.length > 0
            const latestCert = user.certificates[0]

            return (
              <Card key={user.id} className="p-6 hover:shadow-md transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-gray-900 truncate">
                        {user.full_name || 'Sem nome'}
                      </h3>
                      {user.verified_badge && (
                        <CheckCircle2 className="w-5 h-5 text-blue-500 fill-blue-50" />
                      )}
                    </div>
                    <p className="text-sm text-gray-500 truncate">{user.email}</p>

                    <div className="mt-3 flex flex-wrap gap-2 items-center">
                      <Badge variant="outline" className={`${statusColors[user.status_access] || 'bg-gray-100'} font-normal`}>
                        {statusLabels[user.status_access] || user.status_access}
                      </Badge>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">
                        Cadastrado em {new Date(user.created_at).toLocaleDateString('pt-BR')}
                      </span>

                      {/* Certificate Status Badge */}
                      {hasCertificate && (
                        <>
                          <span className="text-xs text-gray-400">•</span>
                          <Badge variant="secondary" className="flex items-center gap-1 font-normal">
                            <FileText className="w-3 h-3" />
                            Certificado {latestCert.review_status === 'APPROVED' ? 'Aceito' :
                              latestCert.review_status === 'REJECTED' ? 'Recusado' :
                                'Enviado'}
                          </Badge>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions Toolbar */}
                  <div className="flex flex-wrap items-center gap-3 justify-start lg:justify-end border-t lg:border-t-0 pt-4 lg:pt-0">

                    {/* Action: Review Certificate */}
                    {(hasCertificate || user.status_access === 'UNDER_REVIEW') && (
                      <Button
                        variant={user.status_access === 'UNDER_REVIEW' ? 'default' : 'outline'}
                        onClick={() => openReview(user)}
                        className={user.status_access === 'UNDER_REVIEW'
                          ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                          : "text-blue-600 border-blue-200 hover:bg-blue-50"}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Ver Certificado
                      </Button>
                    )}

                    {/* Action: Manual Approve (Bypasses Cert) */}
                    {(user.status_access === 'PENDING' || user.status_access === 'UNDER_REVIEW' || user.status_access === 'SUSPENDED') && (
                      <Button variant="outline" onClick={() => updateUserStatus(user.id, 'ACTIVE')}
                        className="text-green-700 border-green-200 hover:bg-green-50 hover:text-green-800">
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Confirmar Acesso
                      </Button>
                    )}

                    {/* Action: Suspend/Block */}
                    {user.status_access === 'ACTIVE' && (
                      <Button variant="outline" onClick={() => updateUserStatus(user.id, 'SUSPENDED')}
                        className="text-red-700 border-red-200 hover:bg-red-50 hover:text-red-800">
                        <Ban className="w-4 h-4 mr-2" />
                        Bloquear
                      </Button>
                    )}

                    {/* Action: Reactivate Revoked */}
                    {user.status_access === 'REVOKED' && (
                      <Button variant="outline" onClick={() => updateUserStatus(user.id, 'PENDING')}
                        className="text-gray-700">
                        Reconsiderar
                      </Button>
                    )}

                    {/* Action: Delete User */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteUser(user.id)}
                      className="text-gray-400 hover:text-red-600 hover:bg-red-50 ml-auto lg:ml-2"
                      title="Excluir Usuário Permanentemente"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>

                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {selectedUser && (
        <CertificateReviewDialog
          isOpen={isReviewOpen}
          onClose={() => setIsReviewOpen(false)}
          userName={selectedUser.full_name || 'Usuária'}
          userId={selectedUser.id}
          certId={selectedUser.certificates?.[0]?.id}
          certificateUrl={selectedUser.certificateUrl || null}
          onSuccess={() => {
            loadUsers()
          }}
        />
      )}
    </div>
  )
}

