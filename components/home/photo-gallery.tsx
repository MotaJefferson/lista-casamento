'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

interface PhotoGalleryProps {
  photos: string[]
}

export default function PhotoGallery({ photos }: PhotoGalleryProps) {
  const [visiblePhotos, setVisiblePhotos] = useState<boolean[]>([])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-photo-index') || '0')
            setVisiblePhotos(prev => {
              const newArr = [...prev]
              newArr[index] = true
              return newArr
            })
          }
        })
      },
      { threshold: 0.1 }
    )

    // Small delay to ensure DOM is ready
    setTimeout(() => {
      const elements = document.querySelectorAll('[data-photo-index]')
      elements.forEach(el => observer.observe(el))
    }, 100)

    return () => {
      const elements = document.querySelectorAll('[data-photo-index]')
      elements.forEach(el => observer.unobserve(el))
    }
  }, [photos])

  return (
    <section className="py-16 md:py-24 bg-muted/50">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">
          Nossos Momentos
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo, index) => (
            <div
              key={index}
              data-photo-index={index}
              className={`relative aspect-square overflow-hidden rounded-lg transition-all duration-700 ${
                visiblePhotos[index] 
                  ? 'opacity-100 scale-100' 
                  : 'opacity-0 scale-95'
              }`}
            >
              <Image
                src={photo}
                alt={`Foto ${index + 1}`}
                fill
                className="object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

