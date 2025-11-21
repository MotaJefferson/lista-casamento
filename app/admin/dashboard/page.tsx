'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import GiftManagement from '@/components/admin/gift-management'
import PurchaseTracking from '@/components/admin/purchase-tracking'
import Analytics from '@/components/admin/analytics'
import Configuration from '@/components/admin/configuration'
import RSVPList from '@/components/admin/rsvp-list'

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Check admin session
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/admin/session')
        const data = await response.json()

        if (!response.ok) {
          router.push('/admin/login')
          return
        }

        setUser(data.user)
      } catch (error) {
        console.error('[v0] Session check error:', error)
        router.push('/admin/login')
      } finally {
        setLoading(false)
      }
    }

    checkSession()
  }, [router])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/admin/logout', { method: 'POST' })
      toast({
        title: 'Sucesso',
        description: 'Logout realizado com sucesso',
      })
      router.push('/admin/login')
    } catch (error) {
      console.error('[v0] Logout error:', error)
      toast({
        title: 'Erro',
        description: 'Erro ao fazer logout',
        variant: 'destructive',
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted">
      {/* Header */}
      <header className="bg-background border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">💕 Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">Bem-vindo, {user?.username}</p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="rsvp">Lista de Presença</TabsTrigger>
            <TabsTrigger value="gifts">Presentes</TabsTrigger>
            <TabsTrigger value="purchases">Compras</TabsTrigger>
            <TabsTrigger value="config">Configuração</TabsTrigger>
          </TabsList>

          <TabsContent value="analytics">
            <Analytics />
          </TabsContent>

          <TabsContent value="rsvp">
            <RSVPList />
          </TabsContent>

          <TabsContent value="gifts">
            <GiftManagement />
          </TabsContent>

          <TabsContent value="purchases">
            <PurchaseTracking />
          </TabsContent>

          <TabsContent value="config">
            <Configuration />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
