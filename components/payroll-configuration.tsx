"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { 
  Calendar, 
  Settings, 
  Lock, 
  Unlock, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle,
  Users,
  FileText,
  Download
} from "lucide-react"
import { getMonthDetails, CustomHoliday } from "@/lib/calendar"

interface PayrollPeriod {
  month: string
  year: number
  status: "unlocked" | "locked" | "processing" | "completed"
  workingDays: number
  weekends: number
  holidays: number
}

interface AttendanceSync {
  totalEmployees: number
  syncedEmployees: number
  pendingEmployees: number
  lastSyncTime: string
  status: "synced" | "partial" | "failed" | "pending"
}

export function PayrollConfiguration() {
  const [selectedPeriod, setSelectedPeriod] = useState({
    month: "August",
    year: 2025
  })
  
  const [periodDetails, setPeriodDetails] = useState<PayrollPeriod | null>(null)
  const [attendanceSync, setAttendanceSync] = useState<AttendanceSync>({
    totalEmployees: 150,
    syncedEmployees: 135,
    pendingEmployees: 15,
    lastSyncTime: new Date().toISOString(),
    status: "partial"
  })
  
  const [isLocked, setIsLocked] = useState(false)
  const [customHolidays, setCustomHolidays] = useState<CustomHoliday[]>([])

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]
  
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i)

  // Calculate period details when month/year changes
  useEffect(() => {
    const monthIndex = monthNames.indexOf(selectedPeriod.month)
    const monthDetails = getMonthDetails(selectedPeriod.year, monthIndex, customHolidays)
    
    setPeriodDetails({
      month: selectedPeriod.month,
      year: selectedPeriod.year,
      status: "unlocked", // This would come from API
      workingDays: monthDetails.workingDays,
      weekends: monthDetails.weekendDays,
      holidays: monthDetails.holidays.length
    })
  }, [selectedPeriod, customHolidays])

  const handleLockToggle = () => {
    setIsLocked(!isLocked)
    // API call to lock/unlock payroll period
  }

  const handleAttendanceSync = () => {
    // API call to sync attendance
    setAttendanceSync(prev => ({ ...prev, status: "pending" }))
    
    // Simulate sync process
    setTimeout(() => {
      setAttendanceSync(prev => ({
        ...prev,
        status: "synced",
        syncedEmployees: prev.totalEmployees,
        pendingEmployees: 0,
        lastSyncTime: new Date().toISOString()
      }))
    }, 2000)
  }

  const getSyncStatusColor = (status: AttendanceSync["status"]) => {
    switch (status) {
      case "synced":
        return "bg-green-100 text-green-800 border-green-200"
      case "partial":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "failed":
        return "bg-red-100 text-red-800 border-red-200"
      case "pending":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getSyncStatusIcon = (status: AttendanceSync["status"]) => {
    switch (status) {
      case "synced":
        return <CheckCircle className="h-4 w-4" />
      case "partial":
        return <AlertTriangle className="h-4 w-4" />
      case "failed":
        return <AlertTriangle className="h-4 w-4" />
      case "pending":
        return <RefreshCw className="h-4 w-4 animate-spin" />
      default:
        return <RefreshCw className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payroll Configuration</h1>
          <p className="text-gray-600">
            Configure payroll settings and run payroll processing
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            View Reports
          </Button>
          <Button size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Period Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Payroll Period Selection
          </CardTitle>
          <CardDescription>
            Select the month and year for payroll processing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Month & Year Selectors */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Month</label>
                  <Select 
                    value={selectedPeriod.month} 
                    onValueChange={(month) => setSelectedPeriod(prev => ({ ...prev, month }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {monthNames.map((month) => (
                        <SelectItem key={month} value={month}>{month}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Year</label>
                  <Select 
                    value={selectedPeriod.year.toString()} 
                    onValueChange={(year) => setSelectedPeriod(prev => ({ ...prev, year: parseInt(year) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Lock/Unlock Controls */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {isLocked ? (
                    <Lock className="h-5 w-5 text-red-500" />
                  ) : (
                    <Unlock className="h-5 w-5 text-green-500" />
                  )}
                  <div>
                    <div className="font-medium">
                      Payroll Status: {isLocked ? "Locked" : "Unlocked"}
                    </div>
                    <div className="text-sm text-gray-600">
                      {isLocked 
                        ? "Payroll is locked for editing" 
                        : "Payroll can be modified"
                      }
                    </div>
                  </div>
                </div>
                <Button 
                  variant={isLocked ? "destructive" : "default"}
                  onClick={handleLockToggle}
                  size="sm"
                >
                  {isLocked ? (
                    <>
                      <Unlock className="h-4 w-4 mr-2" />
                      Unlock
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      Lock
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Calendar Details */}
            {periodDetails && (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <h4 className="font-medium text-blue-900 mb-3">
                    Calendar Details for {periodDetails.month} {periodDetails.year}
                  </h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-700">
                        {periodDetails.workingDays}
                      </div>
                      <div className="text-blue-600">Working Days</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-700">
                        {periodDetails.weekends}
                      </div>
                      <div className="text-gray-600">Weekends</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-700">
                        {periodDetails.holidays}
                      </div>
                      <div className="text-orange-600">Holidays</div>
                    </div>
                  </div>
                </div>

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Weekends (Sundays) and national holidays are automatically calculated. 
                    Custom holidays can be added in the Attendance module.
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Attendance Sync */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Attendance Synchronization
          </CardTitle>
          <CardDescription>
            Pull attendance data from the Attendance module
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Sync Status */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Badge className={`${getSyncStatusColor(attendanceSync.status)} flex items-center gap-1`}>
                  {getSyncStatusIcon(attendanceSync.status)}
                  {attendanceSync.status.charAt(0).toUpperCase() + attendanceSync.status.slice(1)}
                </Badge>
                <div>
                  <div className="font-medium">
                    {attendanceSync.syncedEmployees} of {attendanceSync.totalEmployees} employees synced
                  </div>
                  <div className="text-sm text-gray-600">
                    Last sync: {new Date(attendanceSync.lastSyncTime).toLocaleString()}
                  </div>
                </div>
              </div>
              <Button 
                onClick={handleAttendanceSync}
                disabled={attendanceSync.status === "pending"}
                size="sm"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${attendanceSync.status === "pending" ? "animate-spin" : ""}`} />
                Sync Attendance
              </Button>
            </div>

            {/* Sync Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {attendanceSync.syncedEmployees}
                </div>
                <div className="text-sm text-gray-600">Synced Successfully</div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {attendanceSync.pendingEmployees}
                </div>
                <div className="text-sm text-gray-600">Pending Sync</div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {((attendanceSync.syncedEmployees / attendanceSync.totalEmployees) * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Completion Rate</div>
              </div>
            </div>

            {attendanceSync.pendingEmployees > 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {attendanceSync.pendingEmployees} employees have missing or incomplete attendance data. 
                  Please update their attendance records before proceeding with payroll processing.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payroll Processing Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Payroll Processing
          </CardTitle>
          <CardDescription>
            Configure and start payroll calculation process
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Processing Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Processing Mode</h4>
                <Select defaultValue="full">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full">Full Payroll Processing</SelectItem>
                    <SelectItem value="partial">Partial Processing (Selected Employees)</SelectItem>
                    <SelectItem value="reprocess">Reprocess Existing Payroll</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Include Components</h4>
                <div className="space-y-2 text-sm">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" defaultChecked />
                    Basic Salary & Allowances
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" defaultChecked />
                    Overtime & Night Shift
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" defaultChecked />
                    Statutory Deductions (PF, ESI, Tax)
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    Bonus & Incentives
                  </label>
                </div>
              </div>
            </div>

            <Separator />

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Ready to process payroll for {attendanceSync.syncedEmployees} employees
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  Preview Calculations
                </Button>
                <Button 
                  size="sm"
                  disabled={attendanceSync.pendingEmployees > 0 || isLocked}
                >
                  Start Payroll Processing
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
