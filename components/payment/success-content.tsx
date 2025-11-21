'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { Purchase, Gift } from '@/lib/types/database'

export function SuccessContent() {
  const searchParams = useSearchParams()
  const purchaseId = searchParams.get('purchase_id')
  const [purchase, setPurchase] = useState<Purchase | null>(null)
  const [gift, setGift] = useState<Gift | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDetails = async () => {
      if (!purchaseId) return

      try {
        const response = await fetch(`/api/purchases/${purchaseId}`)
        const data = await response.json()
        setPurchase(data.purchase)
        setGift(data.gift)
      } catch (error) {
        console.error('[v0] Error fetching purchase:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDetails()
  }, [purchaseId])

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

  if (loading) {
    return <div className="text-center">Carregando...</div>
  }

  if (!purchase || !gift) {
    return (
      <div className="text-center">
        <p className="text-muted-foreground mb-4">Compra não encontrada</p>
        <Link href="/gifts">
          <Button>Voltar para Presentes</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Success Header */}
      <div className="text-center mb-8">
        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-2">Obrigado pelo Presente!</h1>
        <p className="text-lg text-muted-foreground">
          Seu pagamento foi processado com sucesso
        </p>
      </div>

      {/* Purchase Summary */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Resumo da Compra</h2>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Produto</p>
            <p className="font-semibold">{gift.name}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Valor</p>
              <p className="font-semibold">{formatPrice(purchase.amount)}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">ID da Transação</p>
              <p className="font-semibold font-mono text-sm">
                {purchase.payment_id || 'Processando...'}
              </p>
            </div>
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-1">Data e Hora</p>
            <p className="font-semibold">{formatDate(purchase.created_at)}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-1">Email Confirmado</p>
            <p className="font-semibold">{purchase.guest_email}</p>
          </div>
        </div>
      </Card>

      {/* Next Steps */}
      <Card className="p-6 bg-accent/5">
        <h3 className="font-bold mb-3">Próximos Passos</h3>
        <ul className="space-y-2 text-sm">
          <li className="flex gap-2">
            <span>✓</span>
            <span>Um email de confirmação foi enviado para {purchase.guest_email}</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>Os noivos foram notificados sobre seu presente</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>Você pode acompanhar seu presente com o ID da transação acima</span>
          </li>
        </ul>
      </Card>

      {/* Actions */}
      <div className="flex gap-4 justify-center pt-4">
        <Link href="/">
          <Button variant="outline">
            Voltar para Home
          </Button>
        </Link>

        <Link href="/gifts">
          <Button>
            Ver Mais Presentes
          </Button>
        </Link>
      </div>
    </div>
  )
}
