"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Menu, X, Users, Clock, Calculator, FileText, CreditCard, Globe, Edit3 } from "lucide-react"
import { useResponsive } from "@/hooks/use-responsive"

interface MobileNavigationProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  formatCurrency: (amount: number) => string
  getTotalNetPay: () => number
}

export function MobileNavigation({
  activeTab,
  setActiveTab,
  formatCurrency,
  getTotalNetPay,
}: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { isMobile } = useResponsive()

  const menuItems = [
    { id: "hr-data", label: "HR Master Data", icon: Users },
    { id: "attendance", label: "Attendance", icon: Clock },
    { id: "payroll", label: "Payroll Engine", icon: Calculator },
    { id: "statutory", label: "Statutory", icon: FileText },
    { id: "payments", label: "Payments", icon: CreditCard },
    { id: "portal", label: "Portal", icon: Globe },
  ]

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId)
    setIsOpen(false)
  }

  if (!isMobile) return null

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="fixed top-4 left-4 z-50 bg-white shadow-md lg:hidden"
        >
          <Menu className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0">
        <SheetHeader className="p-6 border-b">
          <SheetTitle className="text-left">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Indian Payroll</h1>
              <p className="text-xs text-gray-500">Dec 2024 run</p>
            </div>
          </SheetTitle>
        </SheetHeader>
        
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => handleTabClick(id)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium transition-colors
                ${activeTab === id
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-700 hover:bg-gray-100"}`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
          
          {/* Employee Drafts Link */}
          <button
            onClick={() => {
              // Handle navigation to employee drafts
              setIsOpen(false)
            }}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium transition-colors text-gray-700 hover:bg-gray-100 border-t pt-3 mt-3"
          >
            <Edit3 className="h-4 w-4" />
            Employee Drafts
          </button>
        </nav>

        <div className="p-4 border-t text-xs text-gray-500">
          Net Pay: {formatCurrency(getTotalNetPay())}
        </div>
      </SheetContent>
    </Sheet>
  )
}
