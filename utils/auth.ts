import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { prisma } from "@/lib/db"

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" },
  
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  
  // Add trustHost for production
  trustHost: true,
  
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          const { email, password } = loginSchema.parse(credentials)
          
          // For demo purposes, allow demo@example.com with password "password"
          if (email === "demo@example.com" && password === "password") {
            return {
              id: "demo-user",
              email: "demo@example.com",
              name: "Demo User",
              role: "ADMIN"
            }
          }
          
          return null
        } catch {
          return null
        }
      },
    }),
  ],
  
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as any
      }
      return session
    },
    
  },
  
  events: {
    async signIn({ user, account, profile }) {
      // User signed in successfully
    },
    async signOut(message) {
      // User signed out successfully
    },
  },
})
