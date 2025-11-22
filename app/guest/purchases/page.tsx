'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, LogOut, Gift } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import Navigation from '@/components/navigation'
import type { Purchase, Gift as GiftType } from '@/lib/types/database'

interface PurchaseWithGift extends Purchase {
  gift?: GiftType
}

export default function GuestPurchasesPage() {
  const [purchases, setPurchases] = useState<PurchaseWithGift[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        const response = await fetch('/api/guest/purchases')
        
        // Se não estiver autorizado (401), manda pro login
        if (response.status === 401) {
          router.push('/guest/login')
          return
        }

        if (!response.ok) {
          throw new Error('Failed to fetch purchases')
        }

        const data = await response.json()
        setPurchases(data)
      } catch (error) {
        console.error('[v0] Error fetching purchases:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPurchases()
  }, [router])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/guest/logout', { method: 'POST' })
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-600 hover:bg-green-700">Confirmado</Badge>
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Pendente</Badge>
      case 'rejected':
        return <Badge variant="destructive">Cancelado</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-20">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pt-28 pb-12"> {/* Espaçamento do topo ajustado */}
      <Navigation />
      
      <main className="max-w-6xl mx-auto px-4">
        <div className="mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-primary">Meus Presentes</h1>
            <p className="text-muted-foreground">Histórico de presentes que você escolheu</p>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sair / Trocar E-mail
          </Button>
        </div>

        {purchases.length === 0 ? (
          <Card className="p-12 text-center flex flex-col items-center justify-center min-h-[300px] bg-card/50 border-dashed">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Gift className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Nenhum presente encontrado</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              Não encontramos registros de presentes para este e-mail. Verifique se digitou o e-mail correto ou escolha um presente agora.
            </p>
            <div className="flex gap-4">
                <Button variant="outline" onClick={handleLogout}>
                    Tentar outro e-mail
                </Button>
                <Button onClick={() => router.push('/gifts')}>
                    Ver Lista de Presentes
                </Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-6 bg-primary/5 border-primary/10">
                  <p className="text-sm text-muted-foreground mb-1">Total Investido</p>
                  <p className="text-3xl font-bold text-primary">
                    {formatPrice(purchases.reduce((sum, p) => sum + p.amount, 0))}
                  </p>
                </Card>
                <Card className="p-6">
                  <p className="text-sm text-muted-foreground mb-1">Presentes Confirmados</p>
                  <p className="text-3xl font-bold text-green-600">
                    {purchases.filter((p) => p.payment_status === 'approved').length}
                  </p>
                </Card>
                <Card className="p-6">
                  <p className="text-sm text-muted-foreground mb-1">Pagamentos Pendentes</p>
                  <p className="text-3xl font-bold text-yellow-600">
                    {purchases.filter((p) => p.payment_status === 'pending').length}
                  </p>
                </Card>
            </div>

            <Card className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Presente</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>ID Transação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchases.map((purchase) => (
                    <TableRow key={purchase.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                            {/* Miniatura da imagem se disponível (opcional) */}
                            {purchase.gift?.name || 'Presente removido'}
                        </div>
                      </TableCell>
                      <TableCell>{formatPrice(purchase.amount)}</TableCell>
                      <TableCell>
                        {getStatusBadge(purchase.payment_status)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(purchase.created_at)}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {purchase.payment_id || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}