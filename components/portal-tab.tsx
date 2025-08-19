"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Globe, CheckCircle } from "lucide-react"
import type { Employee, PayrollCalculation } from "../types/payroll"

interface PortalTabProps {
  employees: Employee[]
  payrollCalculations: PayrollCalculation[]
}

export function PortalTab({ employees, payrollCalculations }: PortalTabProps) {
  const services = [
    "View Payslips",
    "Download Form 16", 
    "Leave Applications", 
    "Tax Declarations"
  ]

  const portalStats = [
    {
      label: "Active Users",
      value: `${Math.floor(employees.length * 0.92)} / ${employees.length}`,
    },
    {
      label: "Payslips Downloaded",
      value: Math.floor(payrollCalculations.length * 0.85).toString(),
    },
    {
      label: "Mobile App Users",
      value: Math.floor(employees.length * 0.58).toString(),
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Employee Self-Service Portal
        </CardTitle>
        <CardDescription>Web and mobile access for employees</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-semibold">Available Services</h3>
            <div className="space-y-2">
              {services.map((service) => (
                <div key={service} className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>{service}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="font-semibold">Portal Statistics</h3>
            <div className="space-y-3">
              {portalStats.map((stat, index) => (
                <div key={index} className="flex justify-between">
                  <span>{stat.label}</span>
                  <span className="font-semibold">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-6 flex gap-4">
          <Button>Launch Portal</Button>
          <Button variant="outline">Send Notifications</Button>
        </div>
      </CardContent>
    </Card>
  )
}
