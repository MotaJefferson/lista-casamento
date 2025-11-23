'use client'

import { useState, useEffect } from 'react'
import { Clock, Shirt, Music, Wine } from 'lucide-react'
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
    <section id="details" className="py-20 bg-secondary/30">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className={`text-4xl md:text-6xl font-bold mb-20 text-center text-primary tracking-tight ${containerClass}`}>
          Detalhes do Evento
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* CARD 1: Recepção / Horários */}
          <Card className={`p-8 flex flex-col items-center text-center hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border-none bg-white/80 backdrop-blur shadow-lg ${containerClass} delay-0`}>
            <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6 shadow-inner">
                <Clock className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-2xl mb-4 text-foreground">Horários</h3>
            
            {/* Texto descritivo inserido aqui */}
            <p className="text-muted-foreground text-sm mb-6 px-2 leading-relaxed">
                {config?.schedule_description || 'Não se atrase para vivermos esse momento!'}
            </p>

            <div className="w-full space-y-6 mt-auto">
                <div className="relative p-4 bg-background rounded-xl border border-border/50">
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Convidados</span>
                    <span className="font-bold text-3xl text-primary">{config?.guests_arrival_time || '12:00'}</span>
                </div>
                <div className="relative p-4 bg-background rounded-xl border border-border/50">
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Noivos</span>
                    <span className="font-bold text-3xl text-primary">{config?.couple_arrival_time || '13:00'}</span>
                </div>
            </div>
          </Card>

          {/* CARD 2: Traje (Alterado título para Traje) */}
          <Card className={`p-8 flex flex-col items-center text-center hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border-none bg-white/80 backdrop-blur shadow-lg ${containerClass} delay-100`}>
            <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6 shadow-inner">
                <Shirt className="w-8 h-8" />
            </div>
            {/* Título alterado para Português */}
            <h3 className="font-bold text-2xl mb-2 text-foreground">Traje</h3>
            <p className="text-primary font-serif text-xl italic mb-6 mt-auto">
              "{config?.dress_code || 'Esporte Fino'}"
            </p>
            <div className="mt-auto text-sm text-muted-foreground leading-relaxed px-2 border-t pt-4 w-full">
                Sinta-se elegante e confortável para aproveitar cada momento.
            </div>
          </Card>

          {/* CARD 3: Bebidas (Estrutura igual ao Traje) */}
          <Card className={`p-8 flex flex-col items-center text-center hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border-none bg-white/80 backdrop-blur shadow-lg ${containerClass} delay-200`}>
            <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6 shadow-inner">
                <Wine className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-2xl mb-2 text-foreground">{config?.drinks_title || 'Bebidas'}</h3>
            
            {/* Texto Destaque (Itálico/Maior) */}
            <p className="text-primary font-serif text-lg italic mb-6 mt-auto leading-relaxed">
                "{config?.drinks_top_text || 'Open bar completo com drinks especiais.'}"
            </p>
            
            {/* Texto Inferior (Menor) */}
            <div className="mt-auto text-sm text-muted-foreground leading-relaxed px-2 border-t pt-4 w-full">
                {config?.drinks_bottom_text || 'Beba com moderação.'}
            </div>
          </Card>

          {/* CARD 4: Atrações (Expandido) */}
          <Card className={`p-8 flex flex-col items-center text-center hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border-none bg-white/80 backdrop-blur shadow-lg ${containerClass} delay-300`}>
            <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6 shadow-inner">
                <Music className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-2xl mb-6 text-foreground">Atrações</h3>
            
            {/* Aumentado espaçamento (gap-6) para preencher mais o card */}
            <div className="w-full space-y-6 mt-auto text-left py-2">
                {config?.attractions && config.attractions.length > 0 ? (
                    config.attractions.map((attr, idx) => (
                        <div key={idx} className="relative group pl-4 border-l-2 border-primary/20 hover:border-primary transition-colors py-2">
                            <div className="flex justify-between items-baseline mb-2">
                                <span className="font-bold text-lg text-foreground">{attr.title}</span>
                                <span className="text-xs font-bold text-primary bg-primary/5 px-2 py-1 rounded">{attr.time}</span>
                            </div>
                            {attr.description && <p className="text-sm text-muted-foreground leading-relaxed">{attr.description}</p>}
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-muted-foreground text-center py-10 italic">
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