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
    <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
            Payroll Management System
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
            Payroll processing for {currentMonth} {currentYear}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6">
          <div className="text-left sm:text-right">
            <div className="text-lg sm:text-xl md:text-2xl font-bold text-green-600">
              {formatCurrency(getTotalNetPay())}
            </div>
            <div className="text-xs sm:text-sm text-gray-500">Total Net Pay</div>
          </div>
          <div className="w-full sm:w-auto">
            <SignOutButton variant="outline" className="w-full sm:w-auto" />
          </div>
        </div>
      </div>
    </div>
  )
}
