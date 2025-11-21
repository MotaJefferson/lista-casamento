'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [siteName, setSiteName] = useState('Casamento')

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    
    const fetchName = async () => {
        const supabase = createClient()
        const { data } = await supabase.from('site_config').select('site_name').single()
        if (data?.site_name) setSiteName(data.site_name)
    }
    fetchName()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Lógica: Transparente no topo, Vidro Escuro/Claro ao rolar
  // Texto: Sempre branco no topo (sobre a foto), cor do tema ao rolar
  const navClasses = scrolled 
    ? 'bg-background/80 backdrop-blur-md border-b border-border/40 shadow-sm py-3' 
    : 'bg-transparent py-6'

  const textClasses = scrolled ? 'text-foreground' : 'text-white drop-shadow-md'

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ease-in-out ${navClasses}`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link href="/" className={`font-bold text-2xl tracking-tighter transition-colors ${textClasses}`}>
          {siteName}
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          {['Detalhes', 'Local'].map((item) => (
             <a key={item} href={`/#${item.toLowerCase() === 'detalhes' ? 'details' : 'location'}`} className={`text-sm font-medium uppercase tracking-widest transition-colors hover:opacity-70 ${textClasses}`}>
               {item}
             </a>
          ))}
          <Link href="/gifts" className={`text-sm font-medium uppercase tracking-widest transition-colors hover:opacity-70 ${textClasses}`}>
            Presentes
          </Link>
          <Link href="/guest/purchases">
            <Button 
                variant={scrolled ? "default" : "secondary"} 
                size="sm" 
                className={`rounded-full px-6 ${!scrolled ? "bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-md border" : ""}`}
            >
              Meus Presentes
            </Button>
          </Link>
        </div>

        <button className={`md:hidden ${textClasses}`} onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-background/95 backdrop-blur-xl border-b border-border animate-fade-in-up">
          <div className="px-6 py-8 space-y-6 flex flex-col items-center text-center">
            <a href="/#details" className="text-lg font-medium" onClick={() => setIsOpen(false)}>Detalhes</a>
            <a href="/#location" className="text-lg font-medium" onClick={() => setIsOpen(false)}>Local</a>
            <Link href="/gifts" className="text-lg font-medium" onClick={() => setIsOpen(false)}>Presentes</Link>
            <Link href="/guest/purchases" onClick={() => setIsOpen(false)} className="w-full">
              <Button className="w-full rounded-full">Meus Presentes</Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}