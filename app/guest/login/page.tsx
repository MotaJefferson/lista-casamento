'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import Navigation from '@/components/navigation'
import { useToast } from '@/hooks/use-toast'

function GuestLoginContent() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // Limpa a sessão anterior ao entrar na tela (Força novo login)
  useEffect(() => {
    const logout = async () => {
      await fetch('/api/auth/guest/logout', { method: 'POST' })
    }
    logout()
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/auth/guest/login-direct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao entrar')
      }

      // Sucesso: Redireciona para a lista de presentes
      router.push('/guest/purchases')
      
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível acessar com este e-mail. Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex items-center justify-center min-h-[calc(100vh-80px)] py-12 px-4">
      <Card className="w-full max-w-md p-8 shadow-xl border-none bg-white/80 backdrop-blur-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold mb-2 text-primary">Meus Presentes</h1>
          <p className="text-muted-foreground">
            Digite seu e-mail para visualizar os presentes que você já comprou (aprovados ou pendentes).
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Seu E-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="exemplo@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-12 text-lg"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 text-lg font-bold rounded-full transition-transform active:scale-95" 
            disabled={loading || !email}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Acessar Meus Presentes'}
          </Button>
        </form>
      </Card>
    </main>
  )
}

export default function GuestLoginPage() {
  return (
    <div className="min-h-screen bg-background pt-20">
      <Navigation />
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }>
        <GuestLoginContent />
      </Suspense>
    </div>
  )
}