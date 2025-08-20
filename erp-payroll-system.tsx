"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Calculator,
  Users,
  FileText,
  Settings,
  TrendingUp,
  Download,
  Play,
  Loader2,
  CheckCircle,
  AlertTriangle,
} from "lucide-react"
import { useERPPayroll } from "./hooks/useERPPayroll"
import { EmployeeList } from "./components/EmployeeList"
import { DetailedPayrollCalculator } from "./components/detailed-payroll-calculator"
import { PayrollProcessingEngine } from "./components/payroll-processing-engine"
import { ComplianceDashboard } from "./components/compliance-dashboard"
import { MasterDataPanel } from "./components/master-data-panel"

export default function ERPPayrollSystem() {
  const {
    employees,
    processingState,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    processPayroll,
    generateBankFile,
    generateStatutoryReturns,
  } = useERPPayroll()

  const [selectedMonth, setSelectedMonth] = useState("December")
  const [selectedYear, setSelectedYear] = useState(2024)
  const [activeTab, setActiveTab] = useState("dashboard")

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const totalSalaryBudget = employees.reduce((sum, emp) => sum + emp.salary, 0)
  const avgSalary = employees.length > 0 ? totalSalaryBudget / employees.length : 0

  const handlePayrollComplete = (results: any[]) => {
    console.log("Payroll processing completed:", results)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Calculator className="h-8 w-8 text-blue-600" />
                  ERP Payroll Management System
                </CardTitle>
                <CardDescription className="text-lg">
                  Complete payroll processing with Indian statutory compliance
                </CardDescription>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="text-lg px-4 py-2">
                  {selectedMonth} {selectedYear}
                </Badge>
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  {employees.length} Employees
                </Badge>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Processing Status */}
        {processingState.isProcessing && (
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                  <div>
                    <div className="font-semibold">Processing Payroll...</div>
                    <div className="text-sm text-gray-600">Currently processing: {processingState.currentEmployee}</div>
                  </div>
                </div>
                <Progress value={processingState.progress} className="w-full" />
                <div className="text-sm text-gray-600 text-center">
                  {Math.round(processingState.progress)}% Complete
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{employees.length}</div>
                  <div className="text-sm text-gray-600">Total Employees</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{formatCurrency(totalSalaryBudget)}</div>
                  <div className="text-sm text-gray-600">Total Salary Budget</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Calculator className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{formatCurrency(avgSalary)}</div>
                  <div className="text-sm text-gray-600">Average Salary</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <FileText className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{processingState.results.length}</div>
                  <div className="text-sm text-gray-600">Processed Records</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="employees">Employees</TabsTrigger>
            <TabsTrigger value="calculator">Calculator</TabsTrigger>
            <TabsTrigger value="processing">Processing</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest payroll processing activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {processingState.results.length > 0 ? (
                      processingState.results.slice(0, 5).map((result, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <div>
                              <div className="font-medium">{result.employeeName}</div>
                              <div className="text-sm text-gray-600">
                                Processed for {result.month} {result.year}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">{formatCurrency(result.netPay)}</div>
                            <div className="text-sm text-gray-600">Net Pay</div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No payroll records yet</p>
                        <p className="text-sm">Process payroll to see activity</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common payroll operations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Button onClick={() => setActiveTab("processing")} className="w-full justify-start" size="lg">
                      <Play className="h-4 w-4 mr-2" />
                      Process Payroll
                    </Button>
                    <Button
                      onClick={() => setActiveTab("employees")}
                      variant="outline"
                      className="w-full justify-start"
                      size="lg"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Manage Employees
                    </Button>
                    <Button
                      onClick={() => generateBankFile(processingState.results)}
                      variant="outline"
                      className="w-full justify-start"
                      size="lg"
                      disabled={processingState.results.length === 0}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Generate Bank File
                    </Button>
                    <Button
                      onClick={() => setActiveTab("compliance")}
                      variant="outline"
                      className="w-full justify-start"
                      size="lg"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Compliance Reports
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Errors and Warnings */}
            {processingState.errors.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    Processing Errors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {processingState.errors.map((error, index) => (
                      <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800">
                        {error}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Employees Tab */}
          <TabsContent value="employees">
            <EmployeeList
              employees={employees}
              onAddEmployee={addEmployee}
              onUpdateEmployee={updateEmployee}
              onDeleteEmployee={deleteEmployee}
            />
          </TabsContent>

          {/* Calculator Tab */}
          <TabsContent value="calculator">
            <DetailedPayrollCalculator
              employees={employees}
              month={selectedMonth}
              year={selectedYear}
              onPayrollComplete={handlePayrollComplete}
            />
          </TabsContent>

          {/* Processing Tab */}
          <TabsContent value="processing">
            <PayrollProcessingEngine
              employees={employees}
              attendanceData={[]}
              deductionData={[]}
              month={selectedMonth}
              year={selectedYear}
            />
          </TabsContent>

          {/* Compliance Tab */}
          <TabsContent value="compliance">
            <ComplianceDashboard />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <MasterDataPanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
