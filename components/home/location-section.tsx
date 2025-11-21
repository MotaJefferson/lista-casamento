'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { MapPin, Navigation } from 'lucide-react'
import { Card } from '@/components/ui/card'
import type { SiteConfig } from '@/lib/types/database'

interface LocationSectionProps {
  config: SiteConfig | null
}

export default function LocationSection({ config }: LocationSectionProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) setIsVisible(true)
    }, { threshold: 0.1 })
    const element = document.getElementById('location')
    if (element) observer.observe(element)
    return () => observer.disconnect()
  }, [])

  if (!config?.venue_latitude || !config?.venue_longitude) return null

  const openMap = (app: 'waze' | 'google') => {
    const lat = config.venue_latitude
    const lng = config.venue_longitude
    if (app === 'waze') {
      window.open(`https://waze.com/ul?ll=${lat},${lng}&navigate=yes`, '_blank')
    } else {
      window.open(`http://googleusercontent.com/maps.google.com/?q=${lat},${lng}`, '_blank')
    }
  }

  const mapUrl = `https://maps.google.com/maps?q=${config.venue_latitude},${config.venue_longitude}&hl=pt&z=15&output=embed`

  return (
    <section id="location" className="py-24 bg-background relative">
      <div className="max-w-7xl mx-auto px-4">
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          
          {/* Informações */}
          <div className="order-2 lg:order-1 space-y-8">
            <div>
                <h2 className="text-3xl md:text-5xl font-bold mb-6 text-primary">O Local</h2>
                <p className="text-xl font-medium mb-2">{config.venue_name}</p>
                <p className="text-muted-foreground text-lg leading-relaxed">
                    {config.venue_address}
                </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" onClick={() => openMap('google')} className="gap-2 w-full sm:w-auto">
                    <MapPin className="w-5 h-5" />
                    Abrir no Google Maps
                </Button>
                <Button size="lg" variant="outline" onClick={() => openMap('waze')} className="gap-2 w-full sm:w-auto">
                    <Navigation className="w-5 h-5" />
                    Ir com Waze
                </Button>
            </div>
          </div>

          {/* Mapa Grande */}
          <div className="order-1 lg:order-2 h-[400px] lg:h-[500px] w-full rounded-3xl overflow-hidden shadow-2xl border-4 border-card">
            <iframe
              src={mapUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              className="grayscale hover:grayscale-0 transition-all duration-500"
            />
          </div>

        </div>
      </div>
    </section>
  )
}