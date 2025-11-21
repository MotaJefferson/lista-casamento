import type { Metadata } from 'next'
import { Geist, Geist_Mono, Roboto } from 'next/font/google' // Adicione Roboto aqui se estiver usando
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

// Configuração otimizada das fontes
const geist = Geist({ 
  subsets: ["latin"],
  display: 'swap', // Garante que o texto apareça rápido
  variable: '--font-sans',
});

const geistMono = Geist_Mono({ 
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-mono',
});

// Se você estiver usando Roboto em algum lugar específico (como mapas), configure assim:
const roboto = Roboto({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto',
});

export const metadata: Metadata = {
  title: 'Nosso Casamento',
  description: 'Confirme sua presença e veja nossa lista de presentes',
  // ... (resto dos metadados mantidos)
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${geist.variable} ${geistMono.variable} ${roboto.variable} font-sans antialiased`} suppressHydrationWarning>
        {children}
        <Analytics />
      </body>
    </html>
  )
}