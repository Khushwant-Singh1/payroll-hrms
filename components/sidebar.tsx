"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Menu, X, Users, Clock, Calculator, FileText, CreditCard, Globe, Edit3 } from "lucide-react"
import { useResponsive } from "@/hooks/use-responsive"

interface SidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  isSidebarCollapsed: boolean
  setIsSidebarCollapsed: (collapsed: boolean) => void
  formatCurrency: (amount: number) => string
  getTotalNetPay: () => number
}

export function Sidebar({
  activeTab,
  setActiveTab,
  isSidebarCollapsed,
  setIsSidebarCollapsed,
  formatCurrency,
  getTotalNetPay,
}: SidebarProps) {
  const router = useRouter()
  const { isMobile } = useResponsive()
  
  const menuItems = [
    { id: "hr-data", label: "HR Master Data", icon: Users },
    { id: "attendance", label: "Attendance", icon: Clock },
    { id: "payroll", label: "Payroll Engine", icon: Calculator },
    { id: "statutory", label: "Statutory", icon: FileText },
    { id: "payments", label: "Payments", icon: CreditCard },
    { id: "portal", label: "Portal", icon: Globe },
  ]

  const handleDraftsClick = () => {
    router.push('/employee-drafts')
  }

  // Hide sidebar on mobile
  if (isMobile) return null

  return (
    <aside className={`bg-white shadow-md flex flex-col shrink-0 transition-all duration-300 ${
      isSidebarCollapsed ? 'w-16' : 'w-64'
    }`}>
      <div className="p-3 sm:p-4 border-b">
        <div className="flex items-center justify-between">
          {!isSidebarCollapsed && (
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">Indian Payroll</h1>
              <p className="text-xs text-gray-500">Dec&nbsp;2024&nbsp;run</p>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-2 cursor-pointer"
          >
            {isSidebarCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <nav className="flex-1 p-3 sm:p-4 space-y-1.5">
        {menuItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-2 sm:gap-3'} px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors
              ${activeTab === id
                ? "bg-blue-100 text-blue-700 cursor-pointer"
                : "text-gray-700 hover:bg-gray-100 cursor-pointer"}`}
            title={isSidebarCollapsed ? label : undefined}
          >
            <Icon className="h-4 w-4" />
            {!isSidebarCollapsed && label}
          </button>
        ))}
        
        {/* Employee Drafts Link */}
        <button
          onClick={handleDraftsClick}
          className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-2 sm:gap-3'} px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors text-gray-700 hover:bg-gray-100 border-t pt-3 mt-3`}
          title={isSidebarCollapsed ? "Employee Drafts" : undefined}
        >
          <Edit3 className="h-4 w-4" />
          {!isSidebarCollapsed && "Employee Drafts"}
        </button>
      </nav>

      <div className="p-3 sm:p-4 border-t text-xs text-gray-500">
        {!isSidebarCollapsed && `Net Pay: ${formatCurrency(getTotalNetPay())}`}
        {isSidebarCollapsed && (
          <div className="flex justify-center">
            <span title={`Net Pay: ${formatCurrency(getTotalNetPay())}`}>₹</span>
          </div>
        )}
      </div>
    </aside>
  )
}
