"use client"

import { useAuth } from "@/hooks/use-auth"
import { SignInButton, SignOutButton, UserAvatar } from "@/components/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"

export default function AuthDemoPage() {
  const { user, session, isLoading, isAuthenticated, isUnauthenticated } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading authentication status...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            AuthJS Demo Page
          </h1>
          <p className="text-gray-600">
            Test your authentication setup and see all components in action
          </p>
        </div>

        {/* Authentication Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Authentication Status
              {isAuthenticated ? (
                <Badge variant="default" className="bg-green-500">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Authenticated
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <XCircle className="w-3 h-3 mr-1" />
                  Not Authenticated
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Current authentication state and session information
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isAuthenticated ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <UserAvatar className="h-16 w-16" />
                  <div>
                    <h3 className="font-semibold">{user?.name || "Unknown User"}</h3>
                    <p className="text-sm text-gray-600">{user?.email}</p>
                    <p className="text-xs text-gray-500">User ID: {user?.id}</p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Provider:</strong>{" "}
                    {session?.user?.image ? "OAuth" : "Credentials"}
                  </div>
                  <div>
                    <strong>Has Avatar:</strong>{" "}
                    {session?.user?.image ? "Yes" : "No"}
                  </div>
                </div>

                <div className="pt-4">
                  <SignOutButton className="w-full" />
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-6">
                  You are not signed in. Try one of the authentication methods below.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sign-in Options */}
        {!isAuthenticated && (
          <Card>
            <CardHeader>
              <CardTitle>Sign In Options</CardTitle>
              <CardDescription>
                Choose your preferred authentication method
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <SignInButton provider="google" className="w-full" />
                <SignInButton provider="github" className="w-full" />
              </div>
              
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-4">Or use the dedicated sign-in page:</p>
                <SignInButton provider="credentials" className="w-full">
                  Go to Sign In Page
                </SignInButton>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Component Examples */}
        <Card>
          <CardHeader>
            <CardTitle>Available Components</CardTitle>
            <CardDescription>
              Preview of all AuthJS components in your project
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold mb-3">Sign-in Buttons</h4>
              <div className="grid gap-2 md:grid-cols-3">
                <SignInButton provider="google" />
                <SignInButton provider="github" />
                <SignInButton provider="credentials" />
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold mb-3">User Avatar (when signed in)</h4>
              {isAuthenticated ? (
                <div className="flex items-center gap-4">
                  <UserAvatar />
                  <span className="text-sm text-gray-600">
                    Click the avatar to see the dropdown menu
                  </span>
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">
                  Sign in to see the user avatar component
                </p>
              )}
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold mb-3">Sign-out Button</h4>
              {isAuthenticated ? (
                <SignOutButton />
              ) : (
                <p className="text-sm text-gray-500 italic">
                  Sign in to see the sign-out button
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Navigation Links */}
        <Card>
          <CardHeader>
            <CardTitle>Test Protected Routes</CardTitle>
            <CardDescription>
              These routes are protected by middleware and will redirect to sign-in if not authenticated
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 md:grid-cols-2">
              <a
                href="/dashboard"
                className="block p-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="font-medium">/dashboard</div>
                <div className="text-sm text-gray-600">Protected dashboard route</div>
              </a>
              <a
                href="/profile"
                className="block p-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="font-medium">/profile</div>
                <div className="text-sm text-gray-600">Protected profile route</div>
              </a>
              <a
                href="/settings"
                className="block p-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="font-medium">/settings</div>
                <div className="text-sm text-gray-600">Protected settings route</div>
              </a>
              <a
                href="/auth/signin"
                className="block p-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="font-medium">/auth/signin</div>
                <div className="text-sm text-gray-600">Dedicated sign-in page</div>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
