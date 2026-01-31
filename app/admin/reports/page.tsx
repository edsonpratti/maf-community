'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

type Report = {
    id: string
    target_type: string
    target_id: string
    reason: string
    status: string
    created_at: string
    reporter?: {
        full_name: string | null
        email: string
    }
}

export default function ReportsPage() {
    const [reports, setReports] = useState<Report[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    const loadReports = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('reports')
            .select(`
        *,
        reporter:reporter_id (
          full_name,
          email
        )
      `)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error loading reports:', error)
            toast.error('Erro ao carregar denúncias')
        } else {
            // @ts-ignore - Supabase type inference might be tricky with joins
            setReports(data || [])
        }
        setLoading(false)
    }

    const handleAction = async (reportId: string, action: 'CLOSE' | 'DELETE_CONTENT') => {
        try {
            if (action === 'DELETE_CONTENT') {
                // Logic to delete the content would go here
                // For now we just close the report
                toast.info('Funcionalidade de deletar conteúdo em desenvolvimento')
                return
            }

            const { error } = await supabase
                .from('reports')
                .update({ status: 'CLOSED', handled_at: new Date().toISOString() })
                .eq('id', reportId)

            if (error) throw error

            toast.success('Denúncia fechada com sucesso')
            loadReports()
        } catch (error) {
            toast.error('Erro ao processar ação')
        }
    }

    useEffect(() => {
        loadReports()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Denúncias e Moderação</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : reports.length === 0 ? (
                        <p className="text-center text-muted-foreground p-8">Nenhuma denúncia encontrada.</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Data</TableHead>
                                    <TableHead>Tipo</TableHead>
                                    <TableHead>Motivo</TableHead>
                                    <TableHead>Denunciante</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {reports.map((report) => (
                                    <TableRow key={report.id}>
                                        <TableCell>{new Date(report.created_at).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{report.target_type}</Badge>
                                        </TableCell>
                                        <TableCell className="max-w-[200px] truncate" title={report.reason}>
                                            {report.reason}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{report.reporter?.full_name}</span>
                                                <span className="text-xs text-muted-foreground">{report.reporter?.email}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={report.status === 'OPEN' ? 'destructive' : 'secondary'}>
                                                {report.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {report.status === 'OPEN' && (
                                                <div className="flex gap-2">
                                                    <Button size="sm" variant="outline" onClick={() => handleAction(report.id, 'CLOSE')}>
                                                        Fechar
                                                    </Button>
                                                    <Button size="sm" variant="destructive" onClick={() => handleAction(report.id, 'DELETE_CONTENT')}>
                                                        Remover Conteúdo
                                                    </Button>
                                                </div>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
