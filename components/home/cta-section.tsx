'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Gift } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { SiteConfig } from '@/lib/types/database'

export default function CTASection({ config }: { config: SiteConfig | null }) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) setIsVisible(true)
    }, { threshold: 0.1 })
    const el = document.getElementById('cta-section')
    if (el) observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const title = config?.cta_title || 'Queremos compartilhar este momento com você'
  const text = config?.cta_text || 'Convidamos você a fazer parte do nosso dia especial.'

  return (
    <section id="cta-section" className="py-24 bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-primary/5 -skew-y-3 scale-110" />
      <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
        <h2 className={`text-3xl md:text-5xl font-bold mb-6 text-foreground transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {title}
        </h2>
        <p className={`text-lg text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {text}
        </p>
        <div className={`transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
          <Link href="/gifts">
            <Button size="lg" className="gap-2 text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105">
              <Gift className="w-5 h-5" />
              Ver Lista de Presentes
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}