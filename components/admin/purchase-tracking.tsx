'use client'

import { useState, useEffect } from 'react'
import { Loader2, Trash2 } from 'lucide-react'
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
      setPurchases(data)
    } catch (error) {
      console.error('[v0] Error fetching purchases:', error)
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

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar esta compra?')) return

    try {
      const response = await fetch(`/api/purchases/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete purchase')

      toast({
        title: 'Sucesso',
        description: 'Compra deletada',
      })

      // Remove from local state immediately
      setPurchases(purchases.filter(p => p.id !== id))
      fetchPurchases()
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao deletar compra',
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
                    {purchase.payment_status === 'pending' && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(purchase.id)}
                        className="gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        Deletar
                      </Button>
                    )}
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
