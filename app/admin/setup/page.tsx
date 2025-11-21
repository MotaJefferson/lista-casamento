'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Loader2, Copy, Check } from 'lucide-react'

export default function AdminSetupPage() {
  const [password, setPassword] = useState('')
  const [hash, setHash] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleGenerateHash = async () => {
    if (!password) return

    setLoading(true)
    try {
      const response = await fetch('/api/admin/generate-hash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate hash')
      }

      setHash(data.hash)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCopyHash = async () => {
    await navigator.clipboard.writeText(hash)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted p-4">
      <Card className="w-full max-w-md p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Gerar Hash de Acesso</h1>
          <p className="text-muted-foreground text-sm">
            Digite sua senha para gerar um hash. Use este hash para fazer login.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="password" className="mb-2 block">
              Senha
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Digite sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <Button 
            onClick={handleGenerateHash} 
            disabled={loading || !password}
            className="w-full"
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Gerar Hash
          </Button>

          {hash && (
            <div className="mt-6 p-4 bg-muted rounded-lg border">
              <p className="text-sm font-semibold mb-2">Seu Hash:</p>
              <textarea
                value={hash}
                readOnly
                className="w-full min-h-24 p-2 bg-background border rounded text-xs font-mono mb-2"
              />
              <Button
                onClick={handleCopyHash}
                variant="outline"
                className="w-full"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Copiado
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copiar Hash
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground mt-3">
                Cole este hash no campo de login em <a href="/admin/login" className="underline text-blue-600 hover:text-blue-700">/admin/login</a>
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
