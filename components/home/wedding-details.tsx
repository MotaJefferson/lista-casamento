'use client'

import { useState, useEffect } from 'react'
import { Clock, MapPin, Shirt, Music } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { SiteConfig } from '@/lib/types/database'

interface WeddingDetailsProps {
  config: SiteConfig | null
}

export default function WeddingDetails({ config }: WeddingDetailsProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) setIsVisible(true)
    }, { threshold: 0.1 })
    const element = document.getElementById('details')
    if (element) observer.observe(element)
    return () => observer.disconnect()
  }, [])

  const openMap = (app: 'waze' | 'google') => {
    if (!config?.venue_latitude || !config?.venue_longitude) return
    
    const lat = config.venue_latitude
    const lng = config.venue_longitude
    
    if (app === 'waze') {
      window.open(`https://waze.com/ul?ll=${lat},${lng}&navigate=yes`, '_blank')
    } else {
      window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank')
    }
  }

  // URL corrigida e segura (HTTPS)
  const mapUrl = config?.venue_latitude 
    ? `https://maps.google.com/maps?q=${config.venue_latitude},${config.venue_longitude}&hl=pt&z=14&output=embed`
    : ''

  const containerClass = `transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`

  return (
    <section id="details" className="py-20 bg-secondary/20">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className={`text-3xl md:text-5xl font-bold mb-16 text-center text-primary ${containerClass}`}>
          Detalhes do Evento
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* CARD 1: Recepção */}
          <Card className={`p-6 flex flex-col items-center text-center hover:shadow-xl transition-shadow duration-300 ${containerClass} delay-0`}>
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-bold text-xl mb-2">Horários</h3>
            <div className="w-full space-y-4 mt-auto pt-4 border-t">
                <div className="flex justify-between items-center border-b border-border/50 pb-2">
                    <span className="text-xs text-muted-foreground">Convidados</span>
                    <span className="font-bold text-sm">{config?.guests_arrival_time || '12:00'}</span>
                </div>
                <div className="flex justify-between items-center border-b border-border/50 pb-2">
                    <span className="text-xs text-muted-foreground">Noivos</span>
                    <span className="font-bold text-sm">{config?.couple_arrival_time || '13:00'}</span>
                </div>
            </div>
          </Card>

          {/* CARD 2: Traje Sugerido */}
          <Card className={`p-6 flex flex-col items-center text-center hover:shadow-xl transition-shadow duration-300 ${containerClass} delay-100`}>
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Shirt className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-bold text-xl mb-2">Traje Sugerido</h3>
            <p className="text-muted-foreground italic mb-4">
              "{config?.dress_code || 'Esporte Fino'}"
            </p>
            <div className="mt-auto pt-4 border-t w-full text-sm text-muted-foreground">
                <p>Sinta-se confortável e elegante para aproveitar a festa.</p>
            </div>
          </Card>

          {/* CARD 3: Local (Com Mapa) */}
          <Card className={`p-6 flex flex-col items-center text-center hover:shadow-xl transition-shadow duration-300 md:col-span-2 lg:col-span-1 ${containerClass} delay-200`}>
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-bold text-xl mb-2">Local</h3>
            <p className="text-sm text-muted-foreground mb-4 px-2 line-clamp-2">
                {config?.venue_name}
            </p>
            
            {/* Mini Mapa */}
            <div className="w-full h-32 bg-muted rounded-md mb-4 overflow-hidden relative">
                {mapUrl && (
                    <iframe 
                        src={mapUrl} 
                        width="100%" 
                        height="100%" 
                        style={{border:0}} 
                        loading="lazy" 
                        className="absolute inset-0 grayscale hover:grayscale-0 transition-all"
                    />
                )}
            </div>

            <div className="mt-auto flex gap-2 w-full">
                <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => openMap('google')}>
                    Maps
                </Button>
                <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => openMap('waze')}>
                    Waze
                </Button>
            </div>
          </Card>

          {/* CARD 4: Atrações */}
          <Card className={`p-6 flex flex-col items-center text-center hover:shadow-xl transition-shadow duration-300 md:col-span-2 lg:col-span-1 ${containerClass} delay-300`}>
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Music className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-bold text-xl mb-4">Atrações</h3>
            
            <div className="w-full space-y-3 mt-auto text-left">
                {config?.attractions && config.attractions.length > 0 ? (
                    config.attractions.map((attr, idx) => (
                        <div key={idx} className="flex gap-3 items-start pb-2 border-b last:border-0 last:pb-0 border-border/50">
                            <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded h-fit whitespace-nowrap">
                                {attr.time}
                            </span>
                            <div>
                                <p className="font-semibold text-sm leading-none mb-1">{attr.title}</p>
                                <p className="text-xs text-muted-foreground line-clamp-1">{attr.description}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                        Cronograma em breve...
                    </p>
                )}
            </div>
          </Card>

        </div>
      </div>
    </section>
  )
}