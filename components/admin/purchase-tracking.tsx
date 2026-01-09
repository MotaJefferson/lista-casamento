'use client'

import { useState, useEffect } from 'react'
import { Loader2, Trash2, CheckCircle, XCircle, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'
import type { Purchase, Gift } from '@/lib/types/database'

interface PurchaseWithGift extends Purchase {
  gift?: Gift
}

export default function PurchaseTracking() {
  const [purchases, setPurchases] = useState<PurchaseWithGift[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchPurchases()
  }, [])

  const fetchPurchases = async () => {
    try {
      const response = await fetch('/api/purchases')
      const data = await response.json()
      // Ordenar por data (mais recente primeiro)
      const sorted = Array.isArray(data) ? data.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ) : []
      setPurchases(sorted)
    } catch (error) {
      console.error('Error fetching purchases:', error)
      toast({
        title: 'Erro',
        description: 'Falha ao carregar compras',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleUpdateStatus = async (id: string, newStatus: 'approved' | 'rejected' | 'pending') => {
    const actionText = newStatus === 'approved' ? 'aprovar' : newStatus === 'rejected' ? 'rejeitar' : 'resetar'
    if (!confirm(`Tem certeza que deseja ${actionText} esta compra?`)) return

    try {
        const response = await fetch(`/api/purchases/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ payment_status: newStatus })
        })

        if (!response.ok) throw new Error('Failed to update')

        toast({
            title: 'Sucesso',
            description: `Status atualizado para ${newStatus}`,
        })

        // Atualiza a lista localmente
        setPurchases(purchases.map(p => 
            p.id === id ? { ...p, payment_status: newStatus } : p
        ))
    } catch (error) {
        toast({
            title: 'Erro',
            description: 'Falha ao atualizar status',
            variant: 'destructive',
        })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar esta compra?')) return

    try {
      const response = await fetch(`/api/purchases/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
          const data = await response.json()
          throw new Error(data.message || 'Failed to delete purchase')
      }

      toast({
        title: 'Sucesso',
        description: 'Compra deletada',
      })

      setPurchases(purchases.filter(p => p.id !== id))
    } catch (error) {
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao deletar compra',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Rastreamento de Compras</h2>
        <p className="text-muted-foreground">Total: {purchases.length} compras</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchases.map((purchase) => (
                <TableRow key={purchase.id}>
                  <TableCell className="font-medium">
                    {purchase.guest_name || 'Não informado'}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {purchase.guest_email}
                  </TableCell>
                  <TableCell>{formatPrice(purchase.amount)}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                        purchase.payment_status
                      )}`}
                    >
                      {purchase.payment_status === 'approved'
                        ? 'Aprovado'
                        : purchase.payment_status === 'pending'
                        ? 'Pendente'
                        : 'Rejeitado'}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(purchase.created_at)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                        {/* Ações para Pendente: Aprovar ou Rejeitar */}
                        {purchase.payment_status === 'pending' && (
                            <>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleUpdateStatus(purchase.id, 'approved')}
                                    title="Aprovar Pagamento Manualmente"
                                    className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                                >
                                    <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleUpdateStatus(purchase.id, 'rejected')}
                                    title="Rejeitar Pagamento"
                                    className="h-8 w-8 p-0 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                >
                                    <XCircle className="h-4 w-4" />
                                </Button>
                            </>
                        )}

                        {/* Ações para Rejeitado: Tentar Aprovar ou Resetar */}
                        {purchase.payment_status === 'rejected' && (
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleUpdateStatus(purchase.id, 'pending')}
                                title="Voltar para Pendente"
                                className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                                <RotateCcw className="h-4 w-4" />
                            </Button>
                        )}
                        
                        {/* Ação de Delete (Disponível se não for Aprovado) */}
                        {purchase.payment_status !== 'approved' && (
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDelete(purchase.id)}
                                title="Deletar Registro"
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        )}
                        
                        {/* Se estiver aprovado, não mostra botões de ação para evitar acidentes, 
                            mas se quiser adicionar "Estornar" seria aqui. */}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  )
}