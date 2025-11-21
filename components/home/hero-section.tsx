'use client'

import { useState, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import type { SiteConfig } from '@/lib/types/database'

interface HeroSectionProps {
  config: SiteConfig | null
}

export default function HeroSection({ config }: HeroSectionProps) {
  const [daysUntil, setDaysUntil] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!config?.wedding_date) return
    
    const updateCountdown = () => {
      const weddingDate = new Date(config.wedding_date!)
      const today = new Date()
      const diff = Math.ceil((weddingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      setDaysUntil(Math.max(0, diff))
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000 * 60 * 60) // Update every hour

    return () => clearInterval(interval)
  }, [config?.wedding_date])

  const handleScrollDown = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth'
    })
  }

  const coupleName = config?.couple_name || 'Os Noivos'

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10" />
      
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-bold mb-8 text-balance animate-fade-in">
          {coupleName}
        </h1>
        
        {mounted && config?.wedding_date && (
          <div className="p-6 md:p-8 bg-card/90 backdrop-blur-md rounded-2xl shadow-xl inline-block transform transition-all hover:scale-105 animate-fade-in-up mb-16">
            <p className="text-sm md:text-base text-muted-foreground mb-2">Faltam</p>
            <p className="text-5xl md:text-7xl font-bold text-primary mb-2">{daysUntil}</p>
            <p className="text-sm md:text-base text-muted-foreground">dias para o grande dia</p>
          </div>
        )}

        {/* Scroll indicator with animation */}
        <button
          onClick={handleScrollDown}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce hover:scale-110 transition-transform cursor-pointer z-20"
          aria-label="Rolar para baixo"
        >
          <ChevronDown className="w-8 h-8 text-primary" />
        </button>
      </div>
    </section>
  )
}
