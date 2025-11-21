'use client'

import { useState, useEffect } from 'react'
import Navigation from '@/components/navigation'
import HeroSection from '@/components/home/hero-section'
import CTASection from '@/components/home/cta-section'
import WeddingDetails from '@/components/home/wedding-details'
import LocationSection from '@/components/home/location-section'
import PhotoGallery from '@/components/home/photo-gallery'
import Footer from '@/components/footer'
import type { SiteConfig } from '@/lib/types/database'

export default function HomePage() {
  const [config, setConfig] = useState<SiteConfig | null>(null)

  useEffect(() => {
    fetch('/api/config').then(res => res.json()).then(data => setConfig(data))
  }, [])

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-primary/20">
      <Navigation />
      <main>
        <HeroSection config={config} />
        {/* Espaçamento removido entre seções para fluxo contínuo */}
        <CTASection config={config} /> 
        <WeddingDetails config={config} />
        <LocationSection config={config} />
        {config?.main_page_photos && config.main_page_photos.length > 0 && (
          <PhotoGallery photos={config.main_page_photos} />
        )}
      </main>
      <Footer />
    </div>
  )
}