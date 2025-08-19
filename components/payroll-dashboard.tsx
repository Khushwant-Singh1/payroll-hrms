"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  BarChart3, 
  Calendar, 
  Users, 
  IndianRupee, 
  TrendingDown, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Ban,
  RefreshCw,
  Settings
} from "lucide-react"

interface PayrollStats {
  totalEmployees: number
  processedEmployees: number
  pendingEmployees: number
  totalGrossSalary: number
  totalDeductions: number
  totalNetSalary: number
  totalPayout: number
}

interface PayrollStatus {
  status: "pending" | "processing" | "processed" | "approved" | "paid" | "locked"
  month: string
  year: number
  lastUpdated: string
}

interface PayrollAlert {
  id: string
  type: "attendance" | "tax" | "approval" | "compliance"
  severity: "low" | "medium" | "high" | "critical"
  title: string
  description: string
  count?: number
}

export function PayrollDashboard() {
  const [currentPeriod, setCurrentPeriod] = useState({
    month: "August",
    year: 2025
  })
  
  const [payrollStats, setPayrollStats] = useState<PayrollStats>({
    totalEmployees: 0,
    processedEmployees: 0,
    pendingEmployees: 0,
    totalGrossSalary: 0,
    totalDeductions: 0,
    totalNetSalary: 0,
    totalPayout: 0
  })

  const [payrollStatus, setPayrollStatus] = useState<PayrollStatus>({
    status: "pending",
    month: "August",
    year: 2025,
    lastUpdated: new Date().toISOString()
  })

  const [alerts, setAlerts] = useState<PayrollAlert[]>([])

  // Mock data - replace with actual API calls
  useEffect(() => {
    // Simulate loading payroll data
    setPayrollStats({
      totalEmployees: 150,
      processedEmployees: 120,
      pendingEmployees: 30,
      totalGrossSalary: 8500000,
      totalDeductions: 1200000,
      totalNetSalary: 7300000,
      totalPayout: 7300000
    })

    setAlerts([
      {
        id: "1",
        type: "attendance",
        severity: "high",
        title: "Missing Attendance",
        description: "15 employees have missing attendance data",
        count: 15
      },
      {
        id: "2",
        type: "tax",
        severity: "medium",
        title: "Tax Declarations Pending",
        description: "8 employees haven't submitted tax declarations",
        count: 8
      },
      {
        id: "3",
        type: "approval",
        severity: "critical",
        title: "Payroll Approval Pending",
        description: "Payroll for July 2025 requires manager approval"
      }
    ])
  }, [currentPeriod])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getStatusIcon = (status: PayrollStatus["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "processing":
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
      case "processed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "paid":
        return <CheckCircle className="h-4 w-4 text-emerald-600" />
      case "locked":
        return <Ban className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: PayrollStatus["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "processing":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "processed":
        return "bg-green-100 text-green-800 border-green-200"
      case "approved":
        return "bg-green-100 text-green-800 border-green-200"
      case "paid":
        return "bg-emerald-100 text-emerald-800 border-emerald-200"
      case "locked":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getAlertIcon = (type: PayrollAlert["type"]) => {
    switch (type) {
      case "attendance":
        return <Users className="h-4 w-4" />
      case "tax":
        return <IndianRupee className="h-4 w-4" />
      case "approval":
        return <CheckCircle className="h-4 w-4" />
      case "compliance":
        return <Settings className="h-4 w-4" />
      default:
        return <AlertTriangle className="h-4 w-4" />
    }
  }

  const getAlertSeverityColor = (severity: PayrollAlert["severity"]) => {
    switch (severity) {
      case "low":
        return "border-blue-200 bg-blue-50 text-blue-800"
      case "medium":
        return "border-yellow-200 bg-yellow-50 text-yellow-800"
      case "high":
        return "border-orange-200 bg-orange-50 text-orange-800"
      case "critical":
        return "border-red-200 bg-red-50 text-red-800"
      default:
        return "border-gray-200 bg-gray-50 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payroll Dashboard</h1>
          <p className="text-gray-600">
            Overview and management of payroll processing for {currentPeriod.month} {currentPeriod.year}
          </p>
        </div>
        
        {/* Period Selector */}
        <div className="flex items-center gap-2">
          <Select value={currentPeriod.month} onValueChange={(month) => setCurrentPeriod(prev => ({ ...prev, month }))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"].map((month) => (
                <SelectItem key={month} value={month}>{month}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={currentPeriod.year.toString()} onValueChange={(year) => setCurrentPeriod(prev => ({ ...prev, year: parseInt(year) }))}>
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[2023, 2024, 2025, 2026].map((year) => (
                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Payroll Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Payroll Status
              </CardTitle>
              <CardDescription>
                Current payroll processing status for {payrollStatus.month} {payrollStatus.year}
              </CardDescription>
            </div>
            <Badge className={`${getStatusColor(payrollStatus.status)} flex items-center gap-1`}>
              {getStatusIcon(payrollStatus.status)}
              {payrollStatus.status.charAt(0).toUpperCase() + payrollStatus.status.slice(1)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Last updated: {new Date(payrollStatus.lastUpdated).toLocaleString()}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                View Details
              </Button>
              <Button size="sm">
                {payrollStatus.status === "pending" ? "Start Processing" : "Continue Processing"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{payrollStats.totalEmployees}</div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Processed: {payrollStats.processedEmployees}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span>Pending: {payrollStats.pendingEmployees}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gross Salary</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(payrollStats.totalGrossSalary)}</div>
            <p className="text-xs text-muted-foreground">
              Before deductions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deductions</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(payrollStats.totalDeductions)}</div>
            <p className="text-xs text-muted-foreground">
              PF, ESI, Tax & Others
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Payout</CardTitle>
            <IndianRupee className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(payrollStats.totalNetSalary)}</div>
            <p className="text-xs text-muted-foreground">
              Amount to be disbursed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Alerts & Notifications
            </CardTitle>
            <CardDescription>
              Items requiring attention before payroll processing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <Alert key={alert.id} className={getAlertSeverityColor(alert.severity)}>
                  <div className="flex items-center gap-2">
                    {getAlertIcon(alert.type)}
                    <AlertDescription className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium">{alert.title}</span>
                          {alert.count && (
                            <Badge variant="secondary" className="ml-2">
                              {alert.count}
                            </Badge>
                          )}
                          <p className="text-sm mt-1">{alert.description}</p>
                        </div>
                        <Button variant="outline" size="sm">
                          Resolve
                        </Button>
                      </div>
                    </AlertDescription>
                  </div>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Quick Actions
          </CardTitle>
          <CardDescription>
            Common payroll management tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto flex-col gap-2 p-4">
              <Users className="h-6 w-6" />
              <span>Manage Attendance</span>
              <span className="text-xs text-muted-foreground">Review and update attendance records</span>
            </Button>
            
            <Button variant="outline" className="h-auto flex-col gap-2 p-4">
              <Settings className="h-6 w-6" />
              <span>Payroll Configuration</span>
              <span className="text-xs text-muted-foreground">Set up payroll parameters</span>
            </Button>
            
            <Button variant="outline" className="h-auto flex-col gap-2 p-4">
              <BarChart3 className="h-6 w-6" />
              <span>Generate Reports</span>
              <span className="text-xs text-muted-foreground">Download payroll reports</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
