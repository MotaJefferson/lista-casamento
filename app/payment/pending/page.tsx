'use client'

import Link from 'next/link'
import { Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function PaymentPendingPage() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-card border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <a href="/" className="font-bold text-xl hover:text-primary transition">
            💕 Casamento
          </a>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 py-12">
        <div className="space-y-6">
          {/* Pending Header */}
          <div className="text-center mb-8">
            <Clock className="w-16 h-16 text-yellow-500 mx-auto mb-4 animate-spin" />
            <h1 className="text-3xl font-bold mb-2">Pagamento Pendente</h1>
            <p className="text-lg text-muted-foreground">
              Estamos processando seu pagamento
            </p>
          </div>

          {/* Info */}
          <Card className="p-6 bg-yellow-50 dark:bg-yellow-950">
            <h2 className="text-lg font-bold mb-3">Informações Importantes</h2>

            <div className="space-y-2 text-sm">
              <p>
                Seu pagamento está sendo processado. Isso pode levar alguns minutos.
              </p>

              <p>
                Você receberá uma confirmação por email assim que o pagamento for completado.
              </p>

              <p>
                Não feche esta aba até receber a confirmação.
              </p>
            </div>
          </Card>

          {/* Actions */}
          <div className="flex gap-4 justify-center pt-4">
            <Link href="/">
              <Button variant="outline">
                Voltar para Home
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
