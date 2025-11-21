'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Gift } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function CTASection() {
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

    const element = document.getElementById('cta-section')
    if (element) {
      observer.observe(element)
    }

    return () => {
      if (element) {
        observer.unobserve(element)
      }
    }
  }, [])

  return (
    <section id="cta-section" className="py-16 md:py-24 bg-card">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h2 className={`text-3xl md:text-4xl font-bold mb-6 text-balance transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          Queremos compartilhar este momento com você
        </h2>
        <p className={`text-lg text-muted-foreground mb-8 max-w-2xl mx-auto transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          Convidamos você a fazer parte do nosso dia especial escolhendo um presente que nos ajude a começar nossa nova vida juntos.
        </p>
        <div className={`transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <Link href="/gifts">
            <Button size="lg" className="gap-2">
              <Gift className="w-5 h-5" />
              Ver Nossa Lista de Presentes
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

