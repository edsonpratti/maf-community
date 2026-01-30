'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

type Profile = {
  id: string
  full_name: string | null
  email: string
  status_access: string
  role: string
  created_at: string
  verified_badge: boolean
}

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  UNDER_REVIEW: 'bg-orange-100 text-orange-800',
  ACTIVE: 'bg-green-100 text-green-800',
  SUSPENDED: 'bg-red-100 text-red-800',
  REVOKED: 'bg-gray-100 text-gray-800',
}

const statusLabels = {
  PENDING: 'Pendente',
  UNDER_REVIEW: 'Em Análise',
  ACTIVE: 'Ativo',
  SUSPENDED: 'Suspenso',
  REVOKED: 'Revogado',
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('ALL')
  const supabase = createClient()

  useEffect(() => {
    loadUsers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter])

  async function loadUsers() {
    setLoading(true)
    let query = supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (filter !== 'ALL') {
      query = query.eq('status_access', filter)
    }

    const { data, error } = await query

    if (error) {
      console.error('Erro ao carregar usuários:', error)
    } else {
      setUsers(data || [])
    }
    setLoading(false)
  }

  async function updateUserStatus(userId: string, newStatus: string) {
    const { error } = await supabase
      .from('profiles')
      .update({ status_access: newStatus })
      .eq('id', userId)

    if (error) {
      alert('Erro ao atualizar status: ' + error.message)
    } else {
      alert('Status atualizado com sucesso!')
      loadUsers()
    }
  }

  async function toggleVerifiedBadge(userId: string, currentValue: boolean) {
    const { error } = await supabase
      .from('profiles')
      .update({ verified_badge: !currentValue })
      .eq('id', userId)

    if (error) {
      alert('Erro ao atualizar badge: ' + error.message)
    } else {
      loadUsers()
    }
  }

  return (
    <div className="px-4 sm:px-0">
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Gerenciamento de Usuários
        </h2>
        <div className="mt-4 sm:mt-0">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="ALL">Todos os Status</option>
            <option value="PENDING">Pendentes</option>
            <option value="UNDER_REVIEW">Em Análise</option>
            <option value="ACTIVE">Ativos</option>
            <option value="SUSPENDED">Suspensos</option>
            <option value="REVOKED">Revogados</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Carregando usuários...</p>
        </div>
      ) : users.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-gray-500">Nenhum usuário encontrado.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {users.map((user) => (
            <Card key={user.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {user.full_name || 'Sem nome'}
                    </h3>
                    {user.verified_badge && (
                      <span className="text-blue-500" title="Verificado">
                        ✓
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{user.email}</p>
                  <div className="mt-2 flex gap-2 items-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        statusColors[user.status_access as keyof typeof statusColors]
                      }`}
                    >
                      {statusLabels[user.status_access as keyof typeof statusLabels]}
                    </span>
                    <span className="text-xs text-gray-500">
                      Role: {user.role}
                    </span>
                    <span className="text-xs text-gray-500">
                      Cadastro: {new Date(user.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>

                <div className="ml-4 flex flex-col gap-2">
                  {user.status_access === 'PENDING' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => updateUserStatus(user.id, 'UNDER_REVIEW')}
                      >
                        Colocar em Análise
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => updateUserStatus(user.id, 'ACTIVE')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Aprovar
                      </Button>
                    </>
                  )}
                  {user.status_access === 'UNDER_REVIEW' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => updateUserStatus(user.id, 'ACTIVE')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Aprovar
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => updateUserStatus(user.id, 'PENDING')}
                        variant="outline"
                      >
                        Voltar para Pendente
                      </Button>
                    </>
                  )}
                  {user.status_access === 'ACTIVE' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => updateUserStatus(user.id, 'SUSPENDED')}
                        variant="outline"
                      >
                        Suspender
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => toggleVerifiedBadge(user.id, user.verified_badge)}
                        variant="outline"
                      >
                        {user.verified_badge ? 'Remover' : 'Adicionar'} Badge
                      </Button>
                    </>
                  )}
                  {user.status_access === 'SUSPENDED' && (
                    <Button
                      size="sm"
                      onClick={() => updateUserStatus(user.id, 'ACTIVE')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Reativar
                    </Button>
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
