"use client"
import { useState, useEffect } from "react"
import "@/app/globals.css"
import { useRouter, useSearchParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Menu } from "lucide-react"

import { usePayrollData } from "./hooks/usePayrollData"
import { Sidebar } from "./components/sidebar"
import { DashboardHeader } from "./components/DashboardHeader"
import { EmployeeManagement } from "./components/EmployeeManagement"
import { AttendanceTab } from "./components/AttendanceTab"
import { PayrollTab } from "./components/payroll-tab"
import { StatutoryTab } from "./components/statutory-tab"
import { PaymentsTab } from "./components/payments-tab"
import { PortalTab } from "./components/portal-tab"
import { PayrollResultsModal } from "./components/modals/payroll-results-modal"
import { PayrollEngine } from "./components/payroll-engine"

/* -------------------------------------------------------------------------- */
/*  Main Page Component                                                       */
/* -------------------------------------------------------------------------- */
export default function PayrollDashboardPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const {
    employees,
    attendance,
    payrollCalculations,
    statutoryReturns,
    isProcessing,
    calculatePayroll,
    generateStatutoryReturn,
    addAttendanceRecord,
    updateAttendanceRecord,
    getTotalNetPay,
    getTotalGrossPay,
  } = usePayrollData()

  const [activeTab, setActiveTab] = useState("hr-data")
  const [searchTerm, setSearchTerm] = useState("")
  const [isPayrollResultsOpen, setIsPayrollResultsOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [companyFilter, setCompanyFilter] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab) {
      setActiveTab(tab)
    }
  }, [searchParams])

  /* helpers */
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)

  const handleProcessPayroll = async () => {
    await calculatePayroll()
    setIsPayrollResultsOpen(true)
  }

  /* ---------- layout ---------- */
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isSidebarCollapsed={isSidebarCollapsed}
        setIsSidebarCollapsed={setIsSidebarCollapsed}
        formatCurrency={formatCurrency}
        getTotalNetPay={getTotalNetPay}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        {/* Mobile sidebar toggle button - shows when sidebar is collapsed */}
        {isSidebarCollapsed && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsSidebarCollapsed(false)}
            className="fixed top-4 left-4 z-40 bg-white shadow-md cursor-pointer"
          >
            <Menu className="h-4 w-4" />
          </Button>
        )}
        
        <div className="p-6 max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <DashboardHeader 
            formatCurrency={formatCurrency}
            getTotalNetPay={getTotalNetPay}
          />

          {/* Render the active tab body */}
          <Tabs value={activeTab} onValueChange={setActiveTab} orientation="vertical">
            <TabsContent value="hr-data" className="mt-0">
              <div className="space-y-6">
                <EmployeeManagement 
                  employees={employees}
                  formatCurrency={formatCurrency}
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  companyFilter={companyFilter}
                  setCompanyFilter={setCompanyFilter}
                  statusFilter={statusFilter}
                  setStatusFilter={setStatusFilter}
                  isFilterOpen={isFilterOpen}
                  setIsFilterOpen={setIsFilterOpen}
                />
              </div>
            </TabsContent>

            {/* ATTENDANCE */}
            <TabsContent value="attendance" className="mt-0">
              <AttendanceTab 
                attendance={attendance}
                employees={employees}
                formatCurrency={formatCurrency}
                addAttendanceRecord={addAttendanceRecord}
                updateAttendanceRecord={updateAttendanceRecord}
              />
            </TabsContent>

            {/* PAYROLL */}
            <TabsContent value="payroll" className="mt-0">
              <PayrollEngine />
            </TabsContent>

            {/* STATUTORY */}
            <TabsContent value="statutory" className="mt-0">
              <StatutoryTab 
                statutoryReturns={statutoryReturns}
                formatCurrency={formatCurrency}
                generateStatutoryReturn={generateStatutoryReturn}
              />
            </TabsContent>

            {/* PAYMENTS */}
            <TabsContent value="payments" className="mt-0">
              <PaymentsTab 
                payrollCalculations={payrollCalculations}
                formatCurrency={formatCurrency}
                getTotalNetPay={getTotalNetPay}
              />
            </TabsContent>

            {/* EMPLOYEE PORTAL */}
            <TabsContent value="portal" className="mt-0">
              <PortalTab 
                employees={employees}
                payrollCalculations={payrollCalculations}
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>

     {/* Modals */}
      <PayrollResultsModal
        isOpen={isPayrollResultsOpen}
        onClose={() => setIsPayrollResultsOpen(false)}
        calculations={payrollCalculations}
        employees={employees}
      />
    </div>
  )
}