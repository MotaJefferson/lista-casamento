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
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    
    const fetchName = async () => {
        const supabase = createClient()
        const { data } = await supabase.from('site_config').select('site_name').single()
        if (data?.site_name) setSiteName(data.site_name)
    }
    fetchName()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Efeito de vidro e transição suave
  const navClasses = scrolled 
    ? 'bg-background/70 backdrop-blur-md border-b border-border/40 shadow-sm' 
    : 'bg-transparent'

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${navClasses}`}>
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className={`font-bold text-xl tracking-tight transition-colors ${scrolled ? 'text-foreground' : 'text-foreground md:text-white md:drop-shadow-md'}`}>
          {siteName}
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          {['Detalhes', 'Local'].map((item) => (
             <a key={item} href={`/#${item.toLowerCase() === 'detalhes' ? 'details' : 'location'}`} className={`text-sm font-medium transition-colors hover:text-primary ${scrolled ? 'text-foreground' : 'text-white/90 hover:text-white'}`}>
               {item}
             </a>
          ))}
          <Link href="/gifts" className={`text-sm font-medium transition-colors hover:text-primary ${scrolled ? 'text-foreground' : 'text-white/90 hover:text-white'}`}>
            Presentes
          </Link>
          <Link href="/guest/purchases">
            <Button variant={scrolled ? "outline" : "secondary"} size="sm" className={!scrolled ? "bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm" : ""}>
              Meus Presentes
            </Button>
          </Link>
        </div>

        <button className={`md:hidden ${scrolled ? 'text-foreground' : 'text-foreground md:text-white'}`} onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-xl absolute w-full">
          <div className="px-4 py-6 space-y-4 flex flex-col">
            <a href="/#details" className="text-sm font-medium" onClick={() => setIsOpen(false)}>Detalhes</a>
            <a href="/#location" className="text-sm font-medium" onClick={() => setIsOpen(false)}>Local</a>
            <Link href="/gifts" className="text-sm font-medium" onClick={() => setIsOpen(false)}>Presentes</Link>
            <Link href="/guest/purchases" onClick={() => setIsOpen(false)}>
              <Button size="sm" className="w-full">Meus Presentes</Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}