'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { MapPin, Navigation } from 'lucide-react'
import type { SiteConfig } from '@/lib/types/database'

interface LocationSectionProps {
  config: SiteConfig | null
}

export default function LocationSection({ config }: LocationSectionProps) {
  // Removemos a lógica de animação complexa que estava escondendo o mapa
  // Se quiser animação, usaremos classes simples do Tailwind animate-in

  if (!config?.venue_latitude || !config?.venue_longitude) return null

  const openMap = (app: 'waze' | 'google') => {
    const lat = config.venue_latitude
    const lng = config.venue_longitude
    if (app === 'waze') {
      window.open(`https://waze.com/ul?ll=${lat},${lng}&navigate=yes`, '_blank')
    } else {
      window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank')
    }
  }

  // URL de Embed mais robusta para coordenadas
  const mapUrl = `https://maps.google.com/maps?q=${config.venue_latitude},${config.venue_longitude}&t=&z=15&ie=UTF8&iwloc=&output=embed`

  return (
    <section id="location" className="py-20 bg-background relative">
      <div className="max-w-7xl mx-auto px-4">
        
        <div className="bg-secondary/20 rounded-3xl overflow-hidden shadow-sm border border-border/50 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="grid grid-cols-1 lg:grid-cols-5 min-h-[500px]">
                
                {/* Coluna de Informações */}
                <div className="lg:col-span-2 p-8 lg:p-12 flex flex-col justify-center z-10 bg-card/50 backdrop-blur-sm">
                    <div className="inline-flex items-center gap-2 text-primary font-semibold mb-4 bg-primary/10 w-fit px-3 py-1 rounded-full text-sm">
                        <MapPin className="w-4 h-4" />
                        Localização
                    </div>
                    <h2 className="text-3xl font-bold mb-4 text-foreground">{config.venue_name}</h2>
                    <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                        {config.venue_address}
                    </p>

                    <div className="flex flex-col gap-3">
                        <Button size="lg" onClick={() => openMap('google')} className="gap-2 w-full justify-start pl-6">
                            <MapPin className="w-5 h-5" />
                            Abrir no Google Maps
                        </Button>
                        <Button size="lg" variant="outline" onClick={() => openMap('waze')} className="gap-2 w-full justify-start pl-6 bg-background hover:bg-accent">
                            <Navigation className="w-5 h-5" />
                            Ir com Waze
                        </Button>
                    </div>
                </div>

                {/* Coluna do Mapa */}
                <div className="lg:col-span-3 h-[400px] lg:h-auto relative w-full bg-muted">
                    <iframe
                        src={mapUrl}
                        width="100%"
                        height="100%"
                        style={{ border: 0, minHeight: '400px' }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        className="absolute inset-0 w-full h-full grayscale hover:grayscale-0 transition-all duration-500"
                        title="Mapa do Local"
                    />
                </div>
            </div>
        </div>

      </div>
    </section>
  )
}