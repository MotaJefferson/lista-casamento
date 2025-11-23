'use client'

import { Search, ArrowUpDown } from 'lucide-react'
import { Input } from '@/components/ui/input'

export type SortOption = 'price_asc' | 'price_desc' | 'name_asc'

interface GiftFiltersProps {
  search: string
  onSearchChange: (search: string) => void
  sort: SortOption
  onSortChange: (sort: SortOption) => void
}

export default function GiftFilters({
  search,
  onSearchChange,
  sort,
  onSortChange,
}: GiftFiltersProps) {
  return (
    <div className="mb-8 flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Buscar presentes..."
          className="pl-10 h-12"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      
      <div className="relative w-full sm:w-[240px]">
        <div className="absolute left-3 top-3.5 pointer-events-none">
            <ArrowUpDown className="w-5 h-5 text-muted-foreground" />
        </div>
        <select
          className="flex h-12 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-10 appearance-none cursor-pointer"
          value={sort}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
        >
          <option value="price_asc">Menor Preço</option>
          <option value="price_desc">Maior Preço</option>
          <option value="name_asc">Nome (A-Z)</option>
        </select>
        {/* Ícone de seta para baixo customizado para o select */}
        <div className="absolute right-3 top-4 pointer-events-none opacity-50">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
        </div>
      </div>
    </div>
  )
}