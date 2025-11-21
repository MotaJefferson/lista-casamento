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
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

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
    const interval = setInterval(updateCountdown, 1000 * 60 * 60)

    return () => clearInterval(interval)
  }, [config?.wedding_date])

  // Carrossel Automático
  useEffect(() => {
    if (!config?.hero_images || config.hero_images.length <= 1) return
    
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % config.hero_images!.length)
    }, 5000) 

    return () => clearInterval(interval)
  }, [config?.hero_images])

  const handleScrollDown = () => {
    const detailsSection = document.getElementById('details')
    detailsSection?.scrollIntoView({ behavior: 'smooth' })
  }

  const coupleName = config?.couple_name || 'Os Noivos'
  const backgroundImages = config?.hero_images?.length 
    ? config.hero_images 
    : ['/placeholder.jpg'] 

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden bg-black">
      {/* Background Carousel */}
      {backgroundImages.map((img, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentImageIndex ? 'opacity-50' : 'opacity-0'
          }`}
        >
          <img 
            src={img} 
            alt="Background" 
            className="w-full h-full object-cover scale-105 animate-pulse-slow"
            style={{ animationDuration: '10s' }}
          />
        </div>
      ))}
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />
      
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-bold mb-8 text-white tracking-tight animate-fade-in drop-shadow-lg">
          {coupleName}
        </h1>
        
        {mounted && config?.wedding_date && (
          <div className="p-8 backdrop-blur-sm border border-white/20 bg-white/10 rounded-2xl shadow-2xl inline-block transform transition-all hover:scale-105 animate-fade-in-up mb-16">
            <p className="text-sm md:text-base text-white/90 mb-2 uppercase tracking-widest">Faltam</p>
            <p className="text-6xl md:text-8xl font-bold text-white mb-2 tabular-nums">{daysUntil}</p>
            <p className="text-sm md:text-base text-white/90 uppercase tracking-widest">dias para o grande dia</p>
          </div>
        )}

        <div className="absolute bottom-10 left-0 right-0 flex justify-center">
            <button
            onClick={handleScrollDown}
            className="animate-bounce p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur transition-colors border border-white/20 text-white cursor-pointer"
            >
            <ChevronDown className="w-6 h-6" />
            </button>
        </div>
      </div>
    </section>
  )
}