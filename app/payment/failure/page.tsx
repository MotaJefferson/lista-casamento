'use client'

import Link from 'next/link'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function PaymentFailurePage() {
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
          {/* Error Header */}
          <div className="text-center mb-8">
            <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-2">Pagamento Não Processado</h1>
            <p className="text-lg text-muted-foreground">
              Ocorreu um erro ao processar seu pagamento
            </p>
          </div>

          {/* Troubleshooting */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">O que fazer?</h2>

            <div className="space-y-3 text-sm">
              <div>
                <p className="font-semibold mb-1">1. Verifique seus dados de pagamento</p>
                <p className="text-muted-foreground">
                  Certifique-se de que suas informações de cartão ou banco estão corretas
                </p>
              </div>

              <div>
                <p className="font-semibold mb-1">2. Tente novamente</p>
                <p className="text-muted-foreground">
                  Às vezes, erros temporários podem ser resolvidos tentando novamente
                </p>
              </div>

              <div>
                <p className="font-semibold mb-1">3. Entre em contato</p>
                <p className="text-muted-foreground">
                  Se o problema persistir, entre em contato com seu banco ou com nosso suporte
                </p>
              </div>
            </div>
          </Card>

          {/* Actions */}
          <div className="flex gap-4 justify-center pt-4">
            <Link href="/gifts">
              <Button>
                Tentar Novamente
              </Button>
            </Link>

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
