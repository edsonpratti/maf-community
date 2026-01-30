'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

type Certificate = {
  id: string
  user_id: string
  file_path: string
  review_status: string
  created_at: string
  reviewed_at: string | null
  profiles: {
    full_name: string | null
    email: string
  }
}

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
}

const statusLabels = {
  PENDING: 'Pendente',
  APPROVED: 'Aprovado',
  REJECTED: 'Rejeitado',
}

export default function AdminCertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('PENDING')
  const supabase = createClient()

  useEffect(() => {
    loadCertificates()
  }, [filter])

  async function loadCertificates() {
    setLoading(true)
    
    // Buscar certificados
    let certQuery = supabase
      .from('certificates')
      .select('*')
      .order('created_at', { ascending: false })

    if (filter !== 'ALL') {
      certQuery = certQuery.eq('review_status', filter)
    }

    const { data: certsData, error: certsError } = await certQuery

    if (certsError) {
      console.error('Erro ao carregar certificados:', certsError)
      setLoading(false)
      return
    }

    // Buscar perfis dos usuários
    if (certsData && certsData.length > 0) {
      const userIds = certsData.map(cert => cert.user_id)
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', userIds)

      // Combinar dados
      const certificatesWithProfiles = certsData.map(cert => ({
        ...cert,
        profiles: profilesData?.find(p => p.id === cert.user_id) || { full_name: null, email: '' }
      }))

      setCertificates(certificatesWithProfiles)
    } else {
      setCertificates([])
    }
    
    setLoading(false)
  }

  async function reviewCertificate(certId: string, userId: string, status: 'APPROVED' | 'REJECTED') {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      alert('Usuário não autenticado')
      return
    }

    // Atualizar certificado
    const { error: certError } = await supabase
      .from('certificates')
      .update({
        review_status: status,
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id,
      })
      .eq('id', certId)

    if (certError) {
      alert('Erro ao atualizar certificado: ' + certError.message)
      return
    }

    // Se aprovado, atualizar status do usuário para ACTIVE
    if (status === 'APPROVED') {
      const { error: userError } = await supabase
        .from('profiles')
        .update({ 
          status_access: 'ACTIVE',
          verified_badge: true 
        })
        .eq('id', userId)

      if (userError) {
        alert('Erro ao ativar usuário: ' + userError.message)
        return
      }
    }

    alert(status === 'APPROVED' ? 'Certificado aprovado e usuário ativado!' : 'Certificado rejeitado!')
    loadCertificates()
  }

  async function downloadCertificate(filePath: string) {
    const { data, error } = await supabase.storage
      .from('certificates')
      .download(filePath)

    if (error) {
      alert('Erro ao baixar certificado: ' + error.message)
      return
    }

    // Criar URL temporária para download
    const url = URL.createObjectURL(data)
    const a = document.createElement('a')
    a.href = url
    a.download = filePath.split('/').pop() || 'certificado.pdf'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="px-4 sm:px-0">
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Validação de Certificados
        </h2>
        <div className="mt-4 sm:mt-0">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="PENDING">Pendentes</option>
            <option value="APPROVED">Aprovados</option>
            <option value="REJECTED">Rejeitados</option>
            <option value="ALL">Todos</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Carregando certificados...</p>
        </div>
      ) : certificates.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-gray-500">Nenhum certificado encontrado.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {certificates.map((cert) => (
            <Card key={cert.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {cert.profiles?.full_name || 'Sem nome'}
                  </h3>
                  <p className="text-sm text-gray-500">{cert.profiles?.email}</p>
                  <div className="mt-2 flex gap-2 items-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        statusColors[cert.review_status as keyof typeof statusColors]
                      }`}
                    >
                      {statusLabels[cert.review_status as keyof typeof statusLabels]}
                    </span>
                    <span className="text-xs text-gray-500">
                      Enviado: {new Date(cert.created_at).toLocaleDateString('pt-BR')}
                    </span>
                    {cert.reviewed_at && (
                      <span className="text-xs text-gray-500">
                        Revisado: {new Date(cert.reviewed_at).toLocaleDateString('pt-BR')}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Arquivo: {cert.file_path.split('/').pop()}
                  </p>
                </div>

                <div className="ml-4 flex flex-col gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => downloadCertificate(cert.file_path)}
                  >
                    📥 Baixar
                  </Button>
                  
                  {cert.review_status === 'PENDING' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => reviewCertificate(cert.id, cert.user_id, 'APPROVED')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        ✓ Aprovar
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => reviewCertificate(cert.id, cert.user_id, 'REJECTED')}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        ✗ Rejeitar
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
