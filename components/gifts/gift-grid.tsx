'use client'

import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Gift as GiftIcon } from 'lucide-react'
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {gifts.map((gift, index) => (
        <Card 
            key={gift.id} 
            // Adicionado cursor-pointer, hover effects e animação escalonada
            className="overflow-hidden flex flex-col group cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-fade-in-up bg-card border-border/50"
            style={{ animationDelay: `${index * 100}ms` }}
            onClick={() => onPurchaseClick(gift)}
        >
          <div className="relative h-64 bg-muted overflow-hidden">
            <Image
              src={gift.image_url || '/placeholder.svg'}
              alt={gift.name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
            {/* Overlay ao passar o mouse */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
          </div>

          <div className="flex-1 p-6 flex flex-col">
            <div className="mb-4">
                <h3 className="font-bold text-xl mb-2 text-foreground group-hover:text-primary transition-colors">{gift.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                {gift.description}
                </p>
            </div>

            <div className="mt-auto pt-4 border-t border-border/50 flex items-center justify-between">
              <div className="text-2xl font-bold text-primary">
                {formatPrice(gift.price)}
              </div>

              <Button
                onClick={(e) => {
                    e.stopPropagation(); // Evita duplo clique se clicar exatamente no botão
                    onPurchaseClick(gift);
                }}
                size="sm"
                className="rounded-full px-6 shadow-sm group-hover:shadow-md transition-all"
              >
                <GiftIcon className="w-4 h-4 mr-2" />
                Presentear
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}