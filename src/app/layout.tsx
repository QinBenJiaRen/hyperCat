import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { I18nextProviderClient } from '@/components/I18nextProvider'
import EmailCheck from '@/components/EmailCheck'
import { AuthProvider } from '@/contexts/AuthContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'HypeCat - Content Creation Platform',
  description: 'AI-powered content creation and scheduling platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <I18nextProviderClient>
            <EmailCheck>
              {children}
            </EmailCheck>
          </I18nextProviderClient>
        </AuthProvider>
      </body>
    </html>
  )
}