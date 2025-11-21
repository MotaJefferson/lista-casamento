'use client'

import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface GiftFiltersProps {
  search: string
  onSearchChange: (search: string) => void
}

export default function GiftFilters({
  search,
  onSearchChange,
}: GiftFiltersProps) {
  return (
    <div className="mb-8">
      <div className="relative">
        <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Buscar presentes..."
          className="pl-10"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    </div>
  )
}
