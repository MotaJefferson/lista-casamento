'use client'

import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import type { Gift, Purchase } from '@/lib/types/database'

export default function Analytics() {
  const [gifts, setGifts] = useState<Gift[]>([])
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [giftsRes, purchasesRes] = await Promise.all([
          fetch('/api/gifts'),
          fetch('/api/purchases'),
        ])

        const giftsData = await giftsRes.json()
        const purchasesData = await purchasesRes.json()

        setGifts(giftsData)
        setPurchases(purchasesData)
      } catch (error) {
        console.error('[v0] Error fetching analytics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const totalRevenue = purchases
    .filter((p) => p.payment_status === 'approved')
    .reduce((sum, p) => sum + p.amount, 0)
  const approvedPurchases = purchases.filter(
    (p) => p.payment_status === 'approved'
  ).length

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Analytics</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-1">Presentes</p>
          <p className="text-3xl font-bold">{gifts.length}</p>
          <p className="text-xs text-muted-foreground mt-2">
            Total de presentes
          </p>
        </Card>

        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-1">Compras Aprovadas</p>
          <p className="text-3xl font-bold">{approvedPurchases}</p>
          <p className="text-xs text-green-600 mt-2">
            {purchases.length} total
          </p>
        </Card>

        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-1">Receita Total</p>
          <p className="text-3xl font-bold">{formatPrice(totalRevenue)}</p>
          <p className="text-xs text-green-600 mt-2">Confirmado</p>
        </Card>
      </div>
    </div>
  )
}
