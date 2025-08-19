"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export function useAuth() {
  const { data: session, status } = useSession()
  
  return {
    user: session?.user,
    session,
    isLoading: status === "loading",
    isAuthenticated: !!session?.user,
    isUnauthenticated: status === "unauthenticated",
  }
}

export function useRequireAuth(redirectUrl = "/auth/signin") {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(redirectUrl)
    }
  }, [isAuthenticated, isLoading, router, redirectUrl])

  return { isAuthenticated, isLoading }
}

export function useRedirectIfAuthenticated(redirectUrl = "/dashboard") {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push(redirectUrl)
    }
  }, [isAuthenticated, isLoading, router, redirectUrl])

  return { isAuthenticated, isLoading }
}
