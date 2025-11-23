'use client'

import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import Navigation from '@/components/navigation'
import GiftGrid from '@/components/gifts/gift-grid'
import GiftFilters, { SortOption } from '@/components/gifts/gift-filters'
import PurchaseModal from '@/components/gifts/purchase-modal'
import type { Gift } from '@/lib/types/database'

export default function GiftsPage() {
  const [gifts, setGifts] = useState<Gift[]>([])
  const [filteredGifts, setFilteredGifts] = useState<Gift[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortOption>('price_asc') // Padrão: Menor Preço
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    const fetchGifts = async () => {
      try {
        const response = await fetch('/api/gifts')
        const data = await response.json()
        setGifts(data)
      } catch (error) {
        console.error('[v0] Error fetching gifts:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchGifts()
  }, [])

  useEffect(() => {
    // 1. Filtrar
    let result = gifts.filter(g =>
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.description?.toLowerCase().includes(search.toLowerCase())
    )

    // 2. Ordenar
    result.sort((a, b) => {
      switch (sort) {
        case 'price_asc':
          return a.price - b.price
        case 'price_desc':
          return b.price - a.price
        case 'name_asc':
          return a.name.localeCompare(b.name)
        default:
          return 0
      }
    })

    setFilteredGifts([...result])
  }, [gifts, search, sort])

  const handlePurchaseClick = (gift: Gift) => {
    setSelectedGift(gift)
    setShowModal(true)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="max-w-6xl mx-auto px-4 pt-32 pb-12">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-3 text-balance text-primary">Lista de Presentes</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Escolha um presente que nos ajude a começar nossa nova vida juntos
          </p>
        </div>

        <GiftFilters
          search={search}
          onSearchChange={setSearch}
          sort={sort}
          onSortChange={setSort}
        />

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <GiftGrid
            gifts={filteredGifts}
            onPurchaseClick={handlePurchaseClick}
          />
        )}

        {!loading && filteredGifts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">
              Nenhum presente encontrado
            </p>
          </div>
        )}
      </main>

      {selectedGift && (
        <PurchaseModal
          gift={selectedGift}
          open={showModal}
          onOpenChange={setShowModal}
          onSuccess={() => {
            setShowModal(false)
          }}
        />
      )}
    </div>
  )
}