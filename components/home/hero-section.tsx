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

  useEffect(() => {
    if (!config?.hero_images || config.hero_images.length <= 1) return
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % config.hero_images!.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [config?.hero_images])

  const handleScrollDown = () => {
    const detailsSection = document.getElementById('cta-section')
    detailsSection?.scrollIntoView({ behavior: 'smooth' })
  }

  const coupleName = config?.couple_name || 'Os Noivos'
  const backgroundImages = config?.hero_images?.length ? config.hero_images : ['/placeholder.jpg']

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden bg-black">
      {backgroundImages.map((img, index) => (
        <div key={index} className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentImageIndex ? 'opacity-60' : 'opacity-0'}`}>
          <img src={img} alt="Background" className="w-full h-full object-cover scale-105 animate-pulse-slow" style={{ animationDuration: '15s' }} />
        </div>
      ))}
      
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-background" />
      
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto flex flex-col items-center justify-center h-full pt-20">
        <h1 className="text-5xl md:text-8xl font-bold mb-12 text-white tracking-tighter animate-fade-in drop-shadow-2xl">
          {coupleName}
        </h1>
        
        {mounted && config?.wedding_date && (
          <div className="p-6 md:p-10 backdrop-blur-md border border-white/10 bg-white/5 rounded-3xl shadow-2xl transform transition-all hover:scale-105 animate-fade-in-up">
            <p className="text-xs md:text-sm text-white/80 mb-2 uppercase tracking-[0.3em]">Faltam</p>
            <p className="text-7xl md:text-9xl font-bold text-white mb-2 leading-none tracking-tighter">{daysUntil}</p>
            <p className="text-xs md:text-sm text-white/80 uppercase tracking-[0.3em]">dias</p>
          </div>
        )}
      </div>

      <div className="absolute bottom-8 left-0 right-0 flex justify-center z-20">
        <button onClick={handleScrollDown} className="animate-bounce p-3 rounded-full bg-white/5 hover:bg-white/10 backdrop-blur border border-white/10 text-white transition-colors">
          <ChevronDown className="w-6 h-6" />
        </button>
      </div>
    </section>
  )
}