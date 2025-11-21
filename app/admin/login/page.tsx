'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'

export default function AdminLoginPage() {
  const [hash, setHash] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/auth/admin/hash-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hash }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Login failed')
      }

      toast({
        title: 'Sucesso',
        description: 'Login realizado com sucesso',
      })

      setTimeout(() => {
        router.push('/admin/dashboard')
      }, 500)
    } catch (error) {
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao fazer login',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted">
      <Card className="w-full max-w-md p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Faça login com seu hash de acesso</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="hash" className="mb-2 block">
              Hash de Acesso
            </Label>
            <textarea
              id="hash"
              placeholder="Cole seu hash aqui"
              value={hash}
              onChange={(e) => setHash(e.target.value)}
              required
              disabled={loading}
              className="w-full min-h-32 p-3 border rounded-md font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Gere seu hash em <a href="/admin/setup" className="underline text-blue-600 hover:text-blue-700">/admin/setup</a>
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Entrar
          </Button>
        </form>
      </Card>
    </div>
  )
}
