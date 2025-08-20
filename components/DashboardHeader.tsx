"use client"

import { SignOutButton } from "@/components/auth"

interface DashboardHeaderProps {
  formatCurrency: (amount: number) => string
  getTotalNetPay: () => number
}

export function DashboardHeader({ formatCurrency, getTotalNetPay }: DashboardHeaderProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Indian Payroll System</h1>
          <p className="text-gray-600 mt-2">Complete payroll processing for December 2024</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(getTotalNetPay())}
            </div>
            <div className="text-sm text-gray-500">Total Net Pay</div>
          </div>
          <SignOutButton variant="outline" className="cursor-pointer" />
        </div>
      </div>
    </div>
  )
}
