'use client'

import { useState, useEffect } from 'react'
import { Heart, Mail, Phone } from 'lucide-react'
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
    <footer className="bg-card border-t border-border py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* About */}
          <div>
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Heart className="w-4 h-4" />
              {coupleName}
            </h3>
            <p className="text-sm text-muted-foreground">
              {footerText}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold mb-4">Links Rápidos</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/" className="text-muted-foreground hover:text-primary transition">
                  Home
                </a>
              </li>
              <li>
                <a href="/gifts" className="text-muted-foreground hover:text-primary transition">
                  Presentes
                </a>
              </li>
              <li>
                <a href="/guest/purchases" className="text-muted-foreground hover:text-primary transition">
                  Meus Presentes
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold mb-4">Contato</h4>
            <div className="space-y-2 text-sm">
              {footerEmail && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  {footerEmail}
                </div>
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
          <p>© {new Date().getFullYear()} Wedding Registry. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
