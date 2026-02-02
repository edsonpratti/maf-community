'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { reviewCertificate } from '@/app/actions/admin-certificate'
import { Loader2 } from 'lucide-react'

interface CertificateReviewDialogProps {
    isOpen: boolean
    onClose: () => void
    userName: string
    certId?: string | null
    userId: string
    certificateUrl: string | null
    onSuccess: () => void
}

export function CertificateReviewDialog({
    isOpen,
    onClose,
    userName,
    certId,
    userId,
    certificateUrl,
    onSuccess
}: CertificateReviewDialogProps) {
    const [loading, setLoading] = useState(false)

    const handleAction = async (action: 'APPROVED' | 'REJECTED') => {
        setLoading(true)
        try {
            const result = await reviewCertificate(certId, userId, action)
            if (result.success) {
                onSuccess()
                onClose()
            } else {
                alert(result.message)
            }
        } catch (error) {
            console.error('Error reviewing certificate:', error)
            alert('Erro ao processar a ação.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Validar Certificado - {userName}</DialogTitle>
                    <DialogDescription>
                        Analise o documento enviado abaixo. Aprovando, o usuário receberá acesso imediato.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-auto bg-slate-100 p-4 rounded-md flex flex-col items-center justify-center min-h-[400px]">
                    {certificateUrl ? (
                        <>
                            <div className="relative w-full h-full min-h-[400px]">
                                {/* Use standard img tag for simplicity with signed URLs or allow Next/Image with generic domain config */}
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={certificateUrl}
                                    alt={`Certificado de ${userName}`}
                                    className="max-w-full max-h-[60vh] object-contain mx-auto shadow-lg"
                                />
                            </div>
                            <a
                                href={certificateUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-4 text-sm text-blue-600 hover:underline flex items-center gap-1"
                            >
                                Abrir original / Baixar
                            </a>
                        </>
                    ) : (
                        <div className="text-gray-500">Nenhum certificado para visualizar</div>
                    )}
                </div>

                <DialogFooter className="mt-4 gap-2 sm:gap-0">
                    <Button variant="secondary" onClick={onClose} disabled={loading}>
                        Cancelar
                    </Button>
                    <div className="flex gap-2">
                        <Button
                            variant="destructive"
                            onClick={() => handleAction('REJECTED')}
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Rejeitar'}
                        </Button>
                        <Button
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => handleAction('APPROVED')}
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Aprovar'}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
