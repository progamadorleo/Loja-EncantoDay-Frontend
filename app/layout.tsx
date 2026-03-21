import type { Metadata } from 'next'
import { Cormorant_Garamond, Outfit } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { CustomerProvider } from '@/contexts/customer-context'
import { CartProvider } from '@/contexts/cart-context'
import { CartSidebar } from '@/components/cart-sidebar'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as SonnerToaster } from 'sonner'
import './globals.css'

const cormorant = Cormorant_Garamond({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-serif"
});

const outfit = Outfit({ 
  subsets: ["latin"],
  variable: "--font-sans"
});

export const metadata: Metadata = {
  title: 'Encanto Day | Maquiagem que Encanta',
  description: 'Descubra a beleza que existe em você. Maquiagens de alta qualidade para realçar sua beleza natural.',
  icons: {
    icon: [
      {
        url: '/logo.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/logo.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/logo.png',
        type: 'image/svg+xml',
      },
    ],
    apple: '/logo.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${outfit.variable} ${cormorant.variable} font-sans antialiased`}>
        <CustomerProvider>
          <CartProvider>
            {children}
            <CartSidebar />
            <Toaster />
            <SonnerToaster position="top-center" richColors />
          </CartProvider>
        </CustomerProvider>
        <Analytics />
      </body>
    </html>
  )
}
