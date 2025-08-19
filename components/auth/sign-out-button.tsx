"use client"

import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { useState } from "react"

interface SignOutButtonProps {
  callbackUrl?: string
  className?: string
  children?: React.ReactNode
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
}

export function SignOutButton({ 
  callbackUrl = "/", 
  className,
  children,
  variant = "ghost"
}: SignOutButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleSignOut = async () => {
    setIsLoading(true)
    try {
      await signOut({ callbackUrl })
    } catch (error) {
      console.error("Sign out error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleSignOut}
      disabled={isLoading}
      className={className}
      variant={variant}
    >
      <LogOut className="mr-2 h-4 w-4" />
      {children || "Sign out"}
    </Button>
  )
}
