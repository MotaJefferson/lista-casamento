'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Gift } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import RSVPModal from './home/rsvp-modal'

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [siteName, setSiteName] = useState('Casamento') // Fallback inicial
  const pathname = usePathname()
  
  const isHomePage = pathname === '/'

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    
    const fetchName = async () => {
        const supabase = createClient()
        // Alterado para buscar o NOME DO CASAL (couple_name)
        const { data } = await supabase.from('site_config').select('couple_name').single()
        if (data?.couple_name) setSiteName(data.couple_name)
    }
    fetchName()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const forceSolid = !isHomePage
  const showSolidBackground = forceSolid || scrolled

  const navClasses = showSolidBackground
    ? 'bg-background/90 backdrop-blur-md border-b border-border/40 shadow-sm py-3' 
    : 'bg-transparent py-6'

  const textClasses = showSolidBackground ? 'text-foreground' : 'text-white drop-shadow-md'
  const linkHoverClasses = showSolidBackground ? 'hover:text-primary' : 'hover:text-white/80'

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ease-in-out ${navClasses}`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        
        <Link href="/" className="flex items-center gap-2 group">
            {/* Ícone limpo, sem borda ou fundo */}
            <div className="relative w-10 h-10 group-hover:scale-110 transition-transform">
                <img 
                    src="/favicon.png" 
                    alt="Logo" 
                    className="w-full h-full object-contain" 
                />
            </div>
            <span className={`font-bold text-2xl tracking-tighter transition-colors ${textClasses}`}>
                {siteName}
            </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center gap-8">
          <a href="/#details" className={`text-xs font-bold uppercase tracking-widest transition-colors ${textClasses} ${linkHoverClasses}`}>
            Detalhes
          </a>
          <a href="/#location" className={`text-xs font-bold uppercase tracking-widest transition-colors ${textClasses} ${linkHoverClasses}`}>
            Local
          </a>
          <Link href="/guest/purchases" className={`text-xs font-bold uppercase tracking-widest transition-colors ${textClasses} ${linkHoverClasses}`}>
            Meus Presentes
          </Link>
          
          <div className="flex gap-3 ml-4">
            <Link href="/gifts">
                <Button 
                    variant={showSolidBackground ? "default" : "secondary"} 
                    size="sm" 
                    className={`h-10 px-6 text-xs font-bold gap-2 rounded-full transition-all ${!showSolidBackground ? "bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-md border" : ""}`}
                >
                    <Gift className="w-4 h-4" />
                    Lista de Presentes
                </Button>
            </Link>
            
            <div className={!showSolidBackground ? "[&>button]:bg-white/20 [&>button]:hover:bg-white/30 [&>button]:text-white [&>button]:border-white/30 [&>button]:backdrop-blur-md [&>button]:border" : ""}>
               <RSVPModal 
                 size="sm" 
                 className="h-10 px-6 text-xs font-bold rounded-full"
               />
            </div>
          </div>
        </div>

        <button className={`lg:hidden ${textClasses}`} onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-background/95 backdrop-blur-xl border-b border-border animate-fade-in-up shadow-2xl">
          <div className="px-6 py-8 space-y-6 flex flex-col items-center text-center">
            <a href="/#details" className="text-sm font-bold uppercase tracking-widest" onClick={() => setIsOpen(false)}>Detalhes</a>
            <a href="/#location" className="text-sm font-bold uppercase tracking-widest" onClick={() => setIsOpen(false)}>Local</a>
            <Link href="/guest/purchases" className="text-sm font-bold uppercase tracking-widest" onClick={() => setIsOpen(false)}>Meus Presentes</Link>
            
            <div className="w-full h-px bg-border my-2" />
            
            <Link href="/gifts" onClick={() => setIsOpen(false)} className="w-full">
              <Button className="w-full rounded-full gap-2">
                <Gift className="w-4 h-4" /> Lista de Presentes
              </Button>
            </Link>
            <div className="w-full flex justify-center">
                <RSVPModal className="w-full rounded-full" />
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}