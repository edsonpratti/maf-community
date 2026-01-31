'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Activity, FileText, AlertTriangle, ShieldCheck } from 'lucide-react'
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts'

export default function DashboardPage() {
    const [metrics, setMetrics] = useState({
        activeUsers: 0,
        totalPosts: 0,
        openReports: 0,
        totalMaterials: 0,
        activeValidations: 0
    })
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        async function loadMetrics() {
            setLoading(true)

            // Active Users (This Month) - Simplified to Total Active for MVP
            const { count: activeUsers } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true })
                .eq('status_access', 'ACTIVE')

            // Total Posts for Engagement proxy
            const { count: totalPosts } = await supabase
                .from('posts')
                .select('*', { count: 'exact', head: true })

            // Open Reports (Moderation Incidents)
            const { count: openReports } = await supabase
                .from('reports')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'OPEN')

            // Most Accessed Content (Proxy: Total Materials)
            const { count: totalMaterials } = await supabase
                .from('materials')
                .select('*', { count: 'exact', head: true })

            // Auto Revalidation Rate (Proxy: Total Hotmart Customers)
            const { count: activeValidations } = await supabase
                .from('hotmart_customers')
                .select('*', { count: 'exact', head: true })

            setMetrics({
                activeUsers: activeUsers || 0,
                totalPosts: totalPosts || 0,
                openReports: openReports || 0,
                totalMaterials: totalMaterials || 0,
                activeValidations: activeValidations || 0
            })
            setLoading(false)
        }

        loadMetrics()
    }, [])

    const data = [
        { name: 'Jan', users: metrics.activeUsers },
        { name: 'Fev', users: metrics.activeUsers + 5 }, // Fake data for chart visual
        { name: 'Mar', users: metrics.activeUsers + 12 },
    ]

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Dashboard & KPIs</h2>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Usuárias Ativas</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics.activeUsers}</div>
                        <p className="text-xs text-muted-foreground">Habilitadas com acesso liberado</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Engajamento (Posts)</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics.totalPosts}</div>
                        <p className="text-xs text-muted-foreground">Total de contribuições na comunidade</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Incidentes de Moderação</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${metrics.openReports > 0 ? 'text-destructive' : 'text-green-600'}`}>
                            {metrics.openReports}
                        </div>
                        <p className="text-xs text-muted-foreground">Denúncias abertas pendentes</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Validações Automáticas</CardTitle>
                        <ShieldCheck className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics.activeValidations}</div>
                        <p className="text-xs text-muted-foreground">Integradas via Hotmart</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Crescimento da Comunidade</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[200px] w-full">
                            {/* Chart placeholder for simple MVP if Recharts fails or needs setup */}
                            <div className="flex items-end justify-between h-full px-4 pb-4 gap-2">
                                <div className="w-full bg-primary/20 h-[40%] rounded-t-lg relative group">
                                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs">Jan</span>
                                </div>
                                <div className="w-full bg-primary/40 h-[60%] rounded-t-lg relative">
                                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs">Fev</span>
                                </div>
                                <div className="w-full bg-primary/60 h-[50%] rounded-t-lg relative">
                                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs">Mar</span>
                                </div>
                                <div className="w-full bg-primary h-[80%] rounded-t-lg relative">
                                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs">Abr</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Materiais Populares</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            <div className="flex items-center">
                                <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium leading-none">Manual do Método (v2)</p>
                                    <p className="text-xs text-muted-foreground">PDF • Acessado 142 vezes</p>
                                </div>
                                <div className="ml-auto font-medium">Top 1</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
