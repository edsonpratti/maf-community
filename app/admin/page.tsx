import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/card'

export default async function AdminDashboard() {
  const supabase = await createClient()

  // Estatísticas gerais
  const [
    { count: totalUsers },
    { count: pendingUsers },
    { count: underReviewUsers },
    { count: activeUsers },
    { count: pendingCertificates },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('status_access', 'PENDING'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('status_access', 'UNDER_REVIEW'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('status_access', 'ACTIVE'),
    supabase.from('certificates').select('*', { count: 'exact', head: true }).eq('review_status', 'PENDING'),
  ])

  const stats = [
    {
      name: 'Total de Usuários',
      value: totalUsers || 0,
      icon: '👥',
      color: 'bg-blue-500',
    },
    {
      name: 'Aguardando Validação',
      value: pendingUsers || 0,
      icon: '⏳',
      color: 'bg-yellow-500',
    },
    {
      name: 'Em Análise',
      value: underReviewUsers || 0,
      icon: '🔍',
      color: 'bg-orange-500',
    },
    {
      name: 'Usuários Ativos',
      value: activeUsers || 0,
      icon: '✅',
      color: 'bg-green-500',
    },
    {
      name: 'Certificados Pendentes',
      value: pendingCertificates || 0,
      icon: '📄',
      color: 'bg-purple-500',
    },
  ]

  return (
    <div className="px-4 sm:px-0">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Dashboard Administrativo
      </h2>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.name} className="overflow-hidden">
            <div className="p-5">
              <div className="flex items-center">
                <div className={`flex-shrink-0 rounded-md p-3 ${stat.color}`}>
                  <span className="text-2xl">{stat.icon}</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="text-3xl font-semibold text-gray-900">
                      {stat.value}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Ações Rápidas
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <a
            href="/admin/users"
            className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
          >
            <div className="flex-shrink-0 text-3xl">👤</div>
            <div className="flex-1 min-w-0">
              <span className="absolute inset-0" aria-hidden="true" />
              <p className="text-sm font-medium text-gray-900">
                Gerenciar Usuários
              </p>
              <p className="text-sm text-gray-500 truncate">
                Aprovar ou rejeitar cadastros
              </p>
            </div>
          </a>

          <a
            href="/admin/certificates"
            className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
          >
            <div className="flex-shrink-0 text-3xl">📋</div>
            <div className="flex-1 min-w-0">
              <span className="absolute inset-0" aria-hidden="true" />
              <p className="text-sm font-medium text-gray-900">
                Validar Certificados
              </p>
              <p className="text-sm text-gray-500 truncate">
                Revisar documentos enviados
              </p>
            </div>
          </a>
        </div>
      </div>
    </div>
  )
}
