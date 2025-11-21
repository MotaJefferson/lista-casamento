'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, MapPin } from 'lucide-react'
import { Card } from '@/components/ui/card'
import type { SiteConfig } from '@/lib/types/database'

interface WeddingDetailsProps {
  config: SiteConfig | null
}

export default function WeddingDetails({ config }: WeddingDetailsProps) {
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

    const element = document.getElementById('details')
    if (element) {
      observer.observe(element)
    }

    return () => {
      if (element) {
        observer.unobserve(element)
      }
    }
  }, [])

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Data a definir'
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  return (
    <section id="details" className="py-16 md:py-24 bg-muted/30">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className={`text-3xl md:text-4xl font-bold mb-12 text-center text-balance transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          Detalhes da Cerimônia
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Ceremony */}
          <Card className={`p-6 hover:shadow-lg transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Cerimônia</h3>
                <p className="text-muted-foreground mb-1">
                  {formatDate(config?.wedding_date)}
                </p>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{config?.ceremony_time || 'Horário a confirmar'}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Reception */}
          <Card className={`p-6 hover:shadow-lg transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Recepção</h3>
                <p className="text-muted-foreground mb-1">
                  {config?.venue_name || 'Local a definir'}
                </p>
                {config?.venue_address && (
                  <p className="text-sm text-muted-foreground">
                    {config.venue_address}
                  </p>
                )}
                {config?.reception_time && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                    <Clock className="w-4 h-4" />
                    <span>{config.reception_time}</span>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Dress Code */}
          {config?.dress_code && (
            <Card className={`p-6 md:col-span-2 hover:shadow-lg transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Traje Sugerido</h3>
                  <p className="text-muted-foreground">
                    {config.dress_code}
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </section>
  )
}
