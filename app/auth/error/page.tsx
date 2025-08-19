"use client"

import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, ArrowLeft } from "lucide-react"
import Link from "next/link"

const errorMessages: Record<string, string> = {
  Configuration: "There is a problem with the server configuration.",
  AccessDenied: "Access denied. You do not have permission to sign in.",
  Verification: "The verification token has expired or has already been used.",
  Default: "An error occurred during authentication.",
  Signin: "Error in signing in.",
  OAuthSignin: "Error in signing in with OAuth provider.",
  OAuthCallback: "Error in OAuth callback handler.",
  OAuthCreateAccount: "Could not create OAuth account in the database.",
  EmailCreateAccount: "Could not create email account in the database.",
  Callback: "Error in callback handler.",
  OAuthAccountNotLinked: "This account is already linked to another user.",
  EmailSignin: "Sending the e-mail with the verification token failed.",
  CredentialsSignin: "Invalid credentials provided.",
  SessionRequired: "Please sign in to access this page.",
}

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")

  const errorMessage = error ? errorMessages[error] || errorMessages.Default : errorMessages.Default

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <CardTitle className="text-red-900">Authentication Error</CardTitle>
            <CardDescription>Something went wrong during sign in</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>

            {error && (
              <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded">
                <p><strong>Error code:</strong> {error}</p>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <Button asChild className="w-full">
                <Link href="/auth/signin">
                  Try signing in again
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="w-full">
                <Link href="/">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Go back to home
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
