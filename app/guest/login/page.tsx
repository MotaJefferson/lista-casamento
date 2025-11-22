'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import Navigation from '@/components/navigation'
import { useToast } from '@/hooks/use-toast'

export default function GuestLoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/auth/guest/login-direct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) throw new Error('Erro ao entrar')

      router.push('/guest/purchases')
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao entrar. Tente novamente.',
        variant: 'destructive',
      })
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="flex items-center justify-center min-h-[calc(100vh-80px)] py-12">
        <Card className="w-full max-w-md p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-2">Meus Presentes</h1>
            <p className="text-muted-foreground">
              Digite seu email para ver seus presentes
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Acessar
            </Button>
          </form>
        </Card>
      </main>
    </div>
  )
}