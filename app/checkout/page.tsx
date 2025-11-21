'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import Navigation from '@/components/navigation'
import type { Purchase, Gift } from '@/lib/types/database'

// Componente interno que usa o useSearchParams
function CheckoutContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const purchaseId = searchParams.get('purchaseId')
  
  const [purchase, setPurchase] = useState<Purchase | null>(null)
  const [gift, setGift] = useState<Gift | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!purchaseId) {
      router.push('/gifts')
      return
    }

    const fetchPurchase = async () => {
      try {
        const response = await fetch(`/api/purchases/${purchaseId}`)
        if (!response.ok) throw new Error('Purchase not found')
        const data = await response.json()
        setPurchase(data.purchase)
        setGift(data.gift)
      } catch (error) {
        console.error('Error fetching purchase:', error)
        router.push('/gifts')
      } finally {
        setLoading(false)
      }
    }

    fetchPurchase()
  }, [purchaseId, router])

  useEffect(() => {
    if (!purchase || !gift) return

    const createPreference = async () => {
      try {
        const response = await fetch('/api/payments/create-preference', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            purchaseId: purchase.id,
            giftId: gift.id,
            email: purchase.guest_email,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.message || 'Failed to create preference')
        }
        const data = await response.json()
        
        if (data.init_point) {
          window.location.href = data.init_point
        } else {
          throw new Error('No checkout URL received')
        }
      } catch (error) {
        console.error('Error creating preference:', error)
        alert('Erro ao iniciar pagamento. Por favor, tente novamente.')
        router.push('/gifts')
      }
    }

    createPreference()
  }, [purchase, gift, router])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!purchase || !gift) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p>Compra não encontrada</p>
      </div>
    )
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Finalizar Pagamento</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card className="p-6">
            <h2 className="font-bold text-lg mb-4">Resumo do Pedido</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Presente</p>
                <p className="font-medium">{gift.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Valor</p>
                <p className="text-2xl font-bold text-primary">
                  {formatPrice(gift.price)}
                </p>
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="p-6">
            <h2 className="font-bold text-lg mb-6">Redirecionando para pagamento...</h2>
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          </Card>
        </div>
      </div>
    </main>
  )
}

// Componente Principal exportado envolvido em Suspense
export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }>
        <CheckoutContent />
      </Suspense>
    </div>
  )
}