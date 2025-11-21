'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronDown, MapPin, Gift, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Navigation from '@/components/navigation'
import HeroSection from '@/components/home/hero-section'
import CTASection from '@/components/home/cta-section'
import WeddingDetails from '@/components/home/wedding-details'
import LocationSection from '@/components/home/location-section'
import PhotoGallery from '@/components/home/photo-gallery'
import Footer from '@/components/footer'
import type { SiteConfig } from '@/lib/types/database'

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false)
  const [config, setConfig] = useState<SiteConfig | null>(null)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <main>
        {/* Hero Section */}
        <HeroSection config={config} />

        {/* CTA Section - Moved before Wedding Details */}
        <CTASection />

        {/* Wedding Details Section */}
        <WeddingDetails config={config} />

        {/* Location Section */}
        <LocationSection config={config} />

        {/* Photo Gallery Section */}
        {config?.main_page_photos && config.main_page_photos.length > 0 && (
          <PhotoGallery photos={config.main_page_photos} />
        )}
      </main>

      <Footer />
    </div>
  )
}
