import { auth } from "@/utils/auth"
import PayrollDashboard from "../payroll-dashboard"
import { redirect } from "next/navigation"

export default async function Home() {
  const session = await auth()
  
  // If user is not authenticated, redirect to signin page
  if (!session) {
    redirect("/auth/signin")
  }
  
  // If user is authenticated, show the dashboard
  return <PayrollDashboard />
}
