'use client'

import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface ReportDialogProps {
    children: React.ReactNode
    targetId: string
    targetType: 'POST' | 'COMMENT' | 'USER'
}

export function ReportDialog({ children, targetId, targetType }: ReportDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [reason, setReason] = useState('')
    const [details, setDetails] = useState('')

    const handleSubmit = async () => {
        if (!reason) {
            toast.error('Selecione um motivo')
            return
        }

        setLoading(true)
        const supabase = createClient()

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Unauthorized')

            const { error } = await supabase.from('reports').insert({
                reporter_id: user.id,
                target_id: targetId,
                target_type: targetType,
                reason: `${reason}: ${details}`,
                status: 'OPEN'
            })

            if (error) throw error

            toast.success('Denúncia enviada com sucesso')
            setOpen(false)
            setReason('')
            setDetails('')
        } catch (error) {
            console.error(error)
            toast.error('Erro ao enviar denúncia')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Denunciar Conteúdo</DialogTitle>
                    <DialogDescription>
                        Ajude-nos a manter a comunidade segura. Sua denúncia é anônima.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Motivo</Label>
                        <Select onValueChange={setReason} value={reason}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione um motivo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="SPAM">Spam ou Propaganda</SelectItem>
                                <SelectItem value="HARASSMENT">Assédio ou Discurso de Ódio</SelectItem>
                                <SelectItem value="INAPPROPRIATE">Conteúdo Impróprio</SelectItem>
                                <SelectItem value="FAKE">Informação Falsa</SelectItem>
                                <SelectItem value="OTHER">Outro</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Detalhes (Opcional)</Label>
                        <Textarea
                            placeholder="Descreva o problema..."
                            value={details}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDetails(e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading ? 'Enviando...' : 'Enviar Denúncia'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
