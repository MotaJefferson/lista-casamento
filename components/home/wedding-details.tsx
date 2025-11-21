'use client'

import { useState, useEffect } from 'react'
import { Clock, Shirt, Music } from 'lucide-react'
import { Card } from '@/components/ui/card'
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

  const containerClass = `transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`

  return (
    <section id="details" className="py-20 bg-secondary/20">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className={`text-3xl md:text-5xl font-bold mb-16 text-center text-primary ${containerClass}`}>
          Detalhes do Evento
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* CARD 1: Recepção (Horários Duplos) */}
          <Card className={`p-8 flex flex-col items-center text-center hover:shadow-xl transition-all duration-300 border-none bg-card/50 backdrop-blur ${containerClass} delay-0`}>
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <Clock className="w-7 h-7 text-primary" />
            </div>
            <h3 className="font-bold text-2xl mb-2">Horários</h3>
            <p className="text-muted-foreground mb-6 text-sm">Não se atrase para vivermos esse momento!</p>
            
            <div className="w-full space-y-4 mt-auto">
                <div className="flex justify-between items-center border-b border-border/50 pb-2">
                    <span className="text-sm text-muted-foreground">Chegada Convidados</span>
                    <span className="font-bold text-lg">{config?.guests_arrival_time || '12:00'}</span>
                </div>
                <div className="flex justify-between items-center border-b border-border/50 pb-2">
                    <span className="text-sm text-muted-foreground">Entrada Noivos</span>
                    <span className="font-bold text-lg">{config?.couple_arrival_time || '13:00'}</span>
                </div>
            </div>
          </Card>

          {/* CARD 2: Traje */}
          <Card className={`p-8 flex flex-col items-center text-center hover:shadow-xl transition-all duration-300 border-none bg-card/50 backdrop-blur ${containerClass} delay-100`}>
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <Shirt className="w-7 h-7 text-primary" />
            </div>
            <h3 className="font-bold text-2xl mb-2">Dress Code</h3>
            <p className="text-primary font-medium text-lg italic mb-4">
              "{config?.dress_code || 'Esporte Fino'}"
            </p>
            <div className="mt-auto text-sm text-muted-foreground leading-relaxed">
                <p>Sinta-se elegante e confortável.<br/>Queremos ver você bem nas fotos!</p>
            </div>
          </Card>

          {/* CARD 3: Atrações */}
          <Card className={`p-8 flex flex-col items-center text-center hover:shadow-xl transition-all duration-300 border-none bg-card/50 backdrop-blur ${containerClass} delay-200`}>
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <Music className="w-7 h-7 text-primary" />
            </div>
            <h3 className="font-bold text-2xl mb-6">Atrações</h3>
            
            <div className="w-full space-y-4 mt-auto text-left">
                {config?.attractions && config.attractions.length > 0 ? (
                    config.attractions.map((attr, idx) => (
                        <div key={idx} className="flex gap-3 items-center bg-background/50 p-3 rounded-lg">
                            <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded">
                                {attr.time}
                            </span>
                            <div className="flex-1">
                                <p className="font-semibold text-sm leading-none">{attr.title}</p>
                                {attr.description && <p className="text-[10px] text-muted-foreground mt-1">{attr.description}</p>}
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-muted-foreground text-center">
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