import { Card } from '@/components/ui/card'

export default function PaymentSuccessLoading() {
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
        <div className="space-y-6 animate-pulse">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4" />
            <div className="h-8 bg-gray-200 rounded w-48 mx-auto mb-2" />
            <div className="h-6 bg-gray-200 rounded w-64 mx-auto" />
          </div>

          <Card className="p-6">
            <div className="h-6 bg-gray-200 rounded w-32 mb-4" />
            <div className="space-y-4">
              <div>
                <div className="h-4 bg-gray-200 rounded w-20 mb-2" />
                <div className="h-5 bg-gray-200 rounded w-40" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="h-4 bg-gray-200 rounded w-16 mb-2" />
                  <div className="h-5 bg-gray-200 rounded w-24" />
                </div>
                <div>
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
                  <div className="h-5 bg-gray-200 rounded w-32" />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}
