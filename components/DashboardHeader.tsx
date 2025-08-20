"use client"

import { SignOutButton } from "@/components/auth"

interface DashboardHeaderProps {
  formatCurrency: (amount: number) => string
  getTotalNetPay: () => number
}

export function DashboardHeader({ formatCurrency, getTotalNetPay }: DashboardHeaderProps) {
  const currentDate = new Date()
  const currentMonth = currentDate.toLocaleDateString('en-US', { month: 'long' })
  const currentYear = currentDate.getFullYear()

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payroll Management System</h1>
          <p className="text-gray-600 mt-2">
            Payroll processing for {currentMonth} {currentYear}
          </p>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(getTotalNetPay())}
            </div>
            <div className="text-sm text-gray-500">Total Net Pay</div>
          </div>
          <SignOutButton variant="outline" />
        </div>
      </div>
    </div>
  )
}
