'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'
import Navigation from '@/components/navigation'
import type { Purchase, Gift } from '@/lib/types/database'

interface PurchaseWithGift extends Purchase {
  gift?: Gift
}

export default function GuestPurchasesPage() {
  const [purchases, setPurchases] = useState<PurchaseWithGift[]>([])
  const [loading, setLoading] = useState(true)
  const [showEmailModal, setShowEmailModal] = useState(true)
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setSubmitting(true)
    try {
      const response = await fetch('/api/auth/guest/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        throw new Error('Erro ao enviar código')
      }

      router.push(`/guest/login?email=${encodeURIComponent(email)}`)
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao processar email',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  useEffect(() => {
    // First show the page, then check authentication
    setLoading(false)
    
    const fetchPurchases = async () => {
      try {
        const response = await fetch('/api/guest/purchases')
        if (!response.ok) {
          if (response.status === 401) {
            setShowEmailModal(true)
            return
          }
          throw new Error('Failed to fetch purchases')
        }

        const data = await response.json()
        setPurchases(data)
        setShowEmailModal(false)
      } catch (error) {
        console.error('[v0] Error fetching purchases:', error)
        setShowEmailModal(true)
      }
    }

    // Small delay to ensure page renders first
    setTimeout(() => {
      fetchPurchases()
    }, 100)
  }, [])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/guest/logout', { method: 'POST' })
      router.push('/guest/login')
    } catch (error) {
      console.error('[v0] Logout error:', error)
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
        return <Badge className="bg-green-600">Aprovado</Badge>
      case 'pending':
        return <Badge variant="secondary">Pendente</Badge>
      case 'rejected':
        return <Badge variant="destructive">Rejeitado</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Email Modal */}
      <Dialog open={showEmailModal} onOpenChange={setShowEmailModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ver Meus Presentes</DialogTitle>
            <DialogDescription>
              Digite seu email para ver os presentes que você comprou
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Continuar
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Meus Presentes</h1>
            <p className="text-sm text-muted-foreground">Histórico de presentes que você deu</p>
          </div>
          {purchases.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </Button>
          )}
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : purchases.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-lg text-muted-foreground mb-4">
              Você ainda não deu nenhum presente
            </p>
            <Button onClick={() => router.push('/gifts')}>
              Ver Lista de Presentes
            </Button>
          </Card>
        ) : (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">
                Total de presentes: {purchases.length}
              </h2>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Presente</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>ID da Transação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchases.map((purchase) => (
                    <TableRow key={purchase.id}>
                      <TableCell className="font-medium">
                        {purchase.gift?.name || 'Presente removido'}
                      </TableCell>
                      <TableCell>{formatPrice(purchase.amount)}</TableCell>
                      <TableCell>
                        {getStatusBadge(purchase.payment_status)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(purchase.created_at)}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {purchase.payment_id || 'Processando...'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>

            {/* Summary */}
            <Card className="p-6 bg-accent/5">
              <h3 className="font-bold mb-4">Resumo</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Investido</p>
                  <p className="text-2xl font-bold">
                    {formatPrice(
                      purchases.reduce((sum, p) => sum + p.amount, 0)
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Presentes Aprovados</p>
                  <p className="text-2xl font-bold">
                    {purchases.filter((p) => p.payment_status === 'approved')
                      .length}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
