'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={`sticky top-0 z-50 transition-all ${scrolled ? 'bg-background/95 backdrop-blur border-b border-border' : 'bg-transparent'}`}>
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl">
          💕 Casamento
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <a href="/#details" className="hover:text-primary transition">
            Detalhes
          </a>
          <a href="/#location" className="hover:text-primary transition">
            Local
          </a>
          <Link href="/gifts" className="hover:text-primary transition">
            Presentes
          </Link>
          <Link href="/guest/purchases">
            <Button variant="outline" size="sm">
              Meus Presentes
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="px-4 py-4 space-y-4">
            <a href="/#details" className="block hover:text-primary transition">
              Detalhes
            </a>
            <a href="/#location" className="block hover:text-primary transition">
              Local
            </a>
            <Link href="/gifts" className="block hover:text-primary transition">
              Presentes
            </Link>
            <Link href="/guest/purchases">
              <Button variant="outline" size="sm" className="w-full">
                Meus Presentes
              </Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
