'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { MapPin } from 'lucide-react'
import type { SiteConfig } from '@/lib/types/database'

interface LocationSectionProps {
  config: SiteConfig | null
}

export default function LocationSection({ config }: LocationSectionProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
          }
        })
      },
      { threshold: 0.1 }
    )

    const element = document.getElementById('location')
    if (element) {
      observer.observe(element)
    }

    return () => {
      if (element) {
        observer.unobserve(element)
      }
    }
  }, [])

  if (!config?.venue_latitude || !config?.venue_longitude) {
    return null
  }

  const openGoogleMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${config.venue_latitude},${config.venue_longitude}`
    window.open(url, '_blank')
  }

  const openWaze = () => {
    const url = `https://waze.com/ul?ll=${config.venue_latitude},${config.venue_longitude}&navigate=yes`
    window.open(url, '_blank')
  }

  const mapUrl = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3657.2023!2d${config.venue_longitude}!3d${config.venue_latitude}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0!2s0x0!5e0!3m2!1spt-BR!2sbr!4v1234567890`

  return (
    <section id="location" className="py-16 md:py-24 bg-background">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className={`text-3xl md:text-4xl font-bold mb-12 text-center text-balance transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          Local do Evento
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Map */}
          <div className={`lg:col-span-2 transition-all duration-700 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
            <iframe
              src={mapUrl}
              width="100%"
              height="400"
              style={{ border: 0, borderRadius: '8px' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          {/* Details */}
          <div className={`flex flex-col justify-center gap-6 transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
            <div>
              <div className="flex items-start gap-3 mb-4">
                <MapPin className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-lg mb-1">
                    {config.venue_name || 'Local do Evento'}
                  </h3>
                  {config.venue_address && (
                    <p className="text-muted-foreground text-sm">
                      {config.venue_address}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Button 
                className="w-full gap-2"
                onClick={openGoogleMaps}
              >
                <MapPin className="w-4 h-4" />
                Abrir no Google Maps
              </Button>
              <Button 
                variant="outline"
                className="w-full gap-2"
                onClick={openWaze}
              >
                <MapPin className="w-4 h-4" />
                Abrir no Waze
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
