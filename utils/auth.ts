import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { prisma } from "@/lib/db"

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export const { handlers, signIn, signOut, auth } = NextAuth({
  // adapter: PrismaAdapter(db), // Commented out for now to use JWT with credentials
  
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
          
          // TODO: Implement real user authentication with database lookup
          // const user = await db.user.findUnique({
          //   where: { email },
          // })
          // 
          // if (!user || !await bcrypt.compare(password, user.hashedPassword)) {
          //   return null
          // }
          // 
          // return {
          //   id: user.id,
          //   email: user.email,
          //   name: user.name,
          //   role: user.role
          // }
          
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
    
    async redirect({ url, baseUrl }) {
      // Handle production and development URLs properly
      const isDev = process.env.NODE_ENV === 'development'
      
      // In production, prioritize NEXTAUTH_URL, then VERCEL_URL, then baseUrl
      let correctBaseUrl = baseUrl
      if (!isDev) {
        const nextAuthUrl = process.env.NEXTAUTH_URL
        const vercelUrl = process.env.VERCEL_URL
        
        if (nextAuthUrl) {
          correctBaseUrl = nextAuthUrl
        } else if (vercelUrl) {
          correctBaseUrl = vercelUrl.startsWith('http') ? vercelUrl : `https://${vercelUrl}`
        }
      }
      
      console.log('Redirect callback:', { url, baseUrl, correctBaseUrl, isDev })
      
      // Redirect to dashboard after sign in
      if (url.startsWith("/")) return `${correctBaseUrl}${url}`
      else if (new URL(url).origin === correctBaseUrl) return url
      return `${correctBaseUrl}/`
    },
  },
  
  events: {
    async signIn({ user, account, profile }) {
      console.log("User signed in:", user.email)
    },
    async signOut(message) {
      console.log("User signed out")
    },
  },
})
