'use client'

import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Gift } from '@/lib/types/database'

interface GiftGridProps {
  gifts: Gift[]
  onPurchaseClick: (gift: Gift) => void
}

export default function GiftGrid({ gifts, onPurchaseClick }: GiftGridProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {gifts.map((gift) => (
        <Card key={gift.id} className="overflow-hidden flex flex-col">
          <div className="relative h-48 bg-muted overflow-hidden">
            <Image
              src={gift.image_url || '/placeholder.svg'}
              alt={gift.name}
              fill
              className="object-cover"
            />
          </div>

          <div className="flex-1 p-4 flex flex-col">
            <h3 className="font-bold text-lg mb-1 line-clamp-2">{gift.name}</h3>
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {gift.description}
            </p>

            <div className="mt-auto space-y-3">
              <div className="text-2xl font-bold text-primary">
                {formatPrice(gift.price)}
              </div>

              <Button
                onClick={() => onPurchaseClick(gift)}
                className="w-full"
              >
                Presentear
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
