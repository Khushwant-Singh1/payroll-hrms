"use client"

import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Github, Chrome } from "lucide-react"
import { useState } from "react"

interface SignInButtonProps {
  provider?: "google" | "github" | "credentials"
  callbackUrl?: string
  className?: string
  children?: React.ReactNode
}

export function SignInButton({ 
  provider = "google", 
  callbackUrl = "/dashboard",
  className,
  children 
}: SignInButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleSignIn = async () => {
    setIsLoading(true)
    try {
      await signIn(provider, { callbackUrl })
    } catch (error) {
      console.error("Sign in error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getIcon = () => {
    switch (provider) {
      case "google":
        return <Chrome className="mr-2 h-4 w-4" />
      case "github":
        return <Github className="mr-2 h-4 w-4" />
      default:
        return null
    }
  }

  const getDefaultText = () => {
    switch (provider) {
      case "google":
        return "Continue with Google"
      case "github":
        return "Continue with GitHub"
      case "credentials":
        return "Sign in with Email"
      default:
        return "Sign in"
    }
  }

  return (
    <Button
      onClick={handleSignIn}
      disabled={isLoading}
      className={className}
      variant="outline"
    >
      {getIcon()}
      {children || getDefaultText()}
    </Button>
  )
}
