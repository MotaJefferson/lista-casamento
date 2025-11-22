'use client'

import { useState, useEffect } from 'react'
import { Mail, Phone } from 'lucide-react'
import type { SiteConfig } from '@/lib/types/database'

export default function Footer() {
  const [config, setConfig] = useState<SiteConfig | null>(null)

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch('/api/config')
        const data = await response.json()
        setConfig(data)
      } catch (error) {
        console.error('[v0] Error fetching config:', error)
      }
    }
    fetchConfig()
  }, [])

  const coupleName = config?.couple_name || 'Os Noivos'
  const footerText = config?.footer_text || 'Obrigado por fazer parte do nosso dia especial!'
  const footerEmail = config?.footer_email || 'contato@casamento.com'
  const footerPhone = config?.footer_phone || '(11) 99999-9999'

  return (
    <footer className="bg-card border-t border-border pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* About */}
          <div>
            <h3 className="font-bold text-xl mb-4 flex items-center gap-3">
              <div className="relative w-8 h-8 overflow-hidden rounded-full bg-muted">
                 <img src="/favicon.png" alt="Logo" className="w-full h-full object-cover" />
              </div>
              {coupleName}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {footerText}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold mb-4 text-foreground">Links Rápidos</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="/" className="text-muted-foreground hover:text-primary transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="/gifts" className="text-muted-foreground hover:text-primary transition-colors">
                  Lista de Presentes
                </a>
              </li>
              <li>
                <a href="/guest/purchases" className="text-muted-foreground hover:text-primary transition-colors">
                  Meus Presentes
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold mb-4 text-foreground">Contato</h4>
            <div className="space-y-3 text-sm">
              {footerEmail && (
                <a href={`mailto:${footerEmail}`} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                  <Mail className="w-4 h-4" />
                  {footerEmail}
                </a>
              )}
              {footerPhone && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  {footerPhone}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} {coupleName}. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  )
}