import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'
import { Provider } from '@/components/Provider'
import { auth } from '@/utils/auth'

export const metadata: Metadata = {
  title: 'Payroll Dashboard',
  description: 'Payroll management dashboard with AuthJS authentication',
  generator: 'v0.dev',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await auth()
  
  return (
    <html lang="en">  
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body>
        <Provider session={session}>{children}</Provider>
      </body>
    </html>
  )
}
