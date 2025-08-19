"use client"

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react"
import { Session } from "next-auth"

interface ProvidersProps {
  children: React.ReactNode
  session?: Session | null
}

export default function Providers({ children, session }: ProvidersProps) {
  return (
    <NextAuthSessionProvider session={session}>
      {children}
    </NextAuthSessionProvider>
  )
}

// Named export for convenience
export { Providers as Provider }
