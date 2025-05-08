import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ReduxProviders } from '@/redux/Provider'
import { Provider } from '@/components/session-provider'
import { Toaster } from '@/components/ui/sonner'
import NextTopLoader from 'nextjs-toploader';

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SPARK AI',
  description: 'SPARK AI is a platform that enables you to create, manage, and deploy machine learning models at scale.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className='dark'>
      <ReduxProviders>
        <Provider>
          <body className={inter.className}>
            <NextTopLoader showSpinner={false} shadow={false} />
            <Toaster position="top-right" />
            {children}
          </body>
        </Provider>
      </ReduxProviders>
    </html>
  )
}
