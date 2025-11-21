'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import type { Gift } from '@/lib/types/database'

interface PurchaseModalProps {
  gift: Gift
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export default function PurchaseModal({
  gift,
  open,
  onOpenChange,
  onSuccess,
}: PurchaseModalProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !email) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos obrigatórios',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    try {
      console.log('[v0] Starting purchase for gift:', gift.id)
      const response = await fetch('/api/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          giftId: gift.id,
          guestEmail: email,
          guestName: name,
        }),
      })

      console.log('[v0] Purchase API response status:', response.status)
      const data = await response.json()
      console.log('[v0] Purchase API response:', data)

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao processar compra')
      }

      if (!data.purchaseId) {
        throw new Error(data.message || 'Falha ao criar compra')
      }

      // Redirect to checkout page
      window.location.href = `/checkout?purchaseId=${data.purchaseId}`
    } catch (error) {
      console.error('[v0] Purchase error:', error)
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao processar compra',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Presentear com este item</DialogTitle>
          <DialogDescription>
            Confirme os detalhes antes de prosseguir para o pagamento
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Gift Summary */}
          <div className="flex gap-4 p-3 bg-muted rounded-lg">
            <div className="relative w-20 h-20 flex-shrink-0">
              <Image
                src={gift.image_url || '/placeholder.svg'}
                alt={gift.name}
                fill
                className="object-cover rounded"
              />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-sm mb-1">{gift.name}</h3>
              <p className="text-2xl font-bold text-primary">
                {formatPrice(gift.price)}
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name" className="mb-2 block">
                Nome Completo <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Seu nome completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="email" className="mb-2 block">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <p className="text-sm text-muted-foreground">
              * Campos obrigatórios. Seus dados serão compartilhados com os noivos.
            </p>

            <Button
              type="submit"
              className="w-full"
              disabled={loading || !email || !name}
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Prosseguir para Pagamento
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
