"use client"
import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus } from "lucide-react"
import { AttendanceInputModal } from "./AttendanceInputModal"
import { useAuth } from "@/hooks/use-auth"
import { ExcelGenerator } from "@/utils/excel-generator"
import type { Employee } from "../types/payroll"
import type { AttendanceInput } from "../types/erp-payroll"
import type { Attendance } from "@prisma/client"
import {
  AttendanceStats,
  AttendanceFilters,
  AttendanceTable,
  AttendanceViewModal,
  type AttendanceWithEmployee,
  generateFilterOptions,
  filterAttendanceRecords,
  hasActiveFilters,
  generateExcelExportData,
  generateExportFilename
} from "./attendance"

interface AttendanceTabProps {
  attendance: AttendanceWithEmployee[]
  employees: Employee[]
  formatCurrency: (amount: number) => string
  addAttendanceRecord: (attendanceData: Omit<Attendance, "id" | "createdAt" | "updatedAt">) => Promise<Attendance>
  updateAttendanceRecord: (id: string, updates: Partial<Attendance>) => Promise<Attendance>
}

export function AttendanceTab({
  attendance,
  employees,
  formatCurrency,
  addAttendanceRecord,
  updateAttendanceRecord,
}: AttendanceTabProps) {
  const { user } = useAuth()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [editingAttendance, setEditingAttendance] = useState<AttendanceWithEmployee | null>(null)
  const [showEmployeeSelect, setShowEmployeeSelect] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  
  // Filter states
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all")
  const [selectedMonth, setSelectedMonth] = useState<string>("all")
  const [selectedYear, setSelectedYear] = useState<string>("all")
  const [attendanceRange, setAttendanceRange] = useState<string>("all")
  const [showFilters, setShowFilters] = useState(false)
  
  // View modal states
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [viewingAttendance, setViewingAttendance] = useState<AttendanceWithEmployee | null>(null)

  /* ---------- derived data ---------- */
  const filterOptions = useMemo(() => generateFilterOptions(employees, attendance), [employees, attendance])
  
  const filteredAttendance = useMemo(() => 
    filterAttendanceRecords(
      attendance,
      employees,
      searchTerm,
      selectedDepartment,
      selectedMonth,
      selectedYear,
      attendanceRange
    ), [attendance, employees, searchTerm, selectedDepartment, selectedMonth, selectedYear, attendanceRange]
  )

  const hasActiveFiltersState = hasActiveFilters(
    selectedDepartment,
    selectedMonth,
    selectedYear,
    attendanceRange,
    searchTerm
  )

  /* ---------- handlers ---------- */
  const handleAddAttendance = (employee: Employee) => {
    setSelectedEmployee(employee)
    setEditingAttendance(null)
    setIsModalOpen(true)
    setShowEmployeeSelect(false)
  }

  const handleEditAttendance = (employee: Employee, record: AttendanceWithEmployee) => {
    setSelectedEmployee(employee)
    setEditingAttendance(record)
    setIsModalOpen(true)
  }

  const handleViewAttendance = (record: AttendanceWithEmployee) => {
    setViewingAttendance(record)
    setViewModalOpen(true)
  }

  const handleSaveAttendance = async (attendanceData: AttendanceInput) => {
    if (!selectedEmployee) return

    const record: Omit<Attendance, "id" | "createdAt" | "updatedAt"> = {
      employeeId: selectedEmployee.id,
      month: attendanceData.month,
      year: attendanceData.year,
      presentDays: attendanceData.presentDays,
      totalDays: attendanceData.workingDays,
      overtimeHours: attendanceData.overtimeHours as any,
      leavesTaken: attendanceData.absentDays,
      shiftAllowance: attendanceData.hazardPay as any,
    }

    try {
      if (editingAttendance) {
        await updateAttendanceRecord(editingAttendance.id, record)
      } else {
        await addAttendanceRecord(record)
      }
      setIsModalOpen(false)
      setSelectedEmployee(null)
      setEditingAttendance(null)
    } catch (error) {
      console.error('Error saving attendance:', error)
    }
  }

  const clearFilters = () => {
    setSelectedDepartment("all")
    setSelectedMonth("all")
    setSelectedYear("all")
    setAttendanceRange("all")
    setSearchTerm("")
  }

  const downloadAttendanceExcel = () => {
    if (filteredAttendance.length === 0) {
      alert("No attendance records to export")
      return
    }

    const excelData = generateExcelExportData(
      filteredAttendance,
      employees,
      selectedDepartment,
      selectedMonth,
      selectedYear,
      attendanceRange,
      searchTerm
    )

    const filename = generateExportFilename(
      selectedDepartment,
      selectedMonth,
      selectedYear,
      attendanceRange,
      searchTerm
    )

    ExcelGenerator.generateCSVWithBOM(excelData, filename)
    alert(`Successfully exported ${filteredAttendance.length} attendance records to ${filename}.csv`)
  }

  return (
    <div className="space-y-6">
      {/* stats cards */}
      <AttendanceStats
        attendance={attendance}
        formatCurrency={formatCurrency}
        onExportData={downloadAttendanceExcel}
        filteredAttendanceCount={filteredAttendance.length}
      />

      {/* attendance management */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <div className="flex-1">
              <CardTitle className="text-lg sm:text-xl">Attendance Management</CardTitle>
              <CardDescription className="text-sm">Manage employee attendance records</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              {showEmployeeSelect && (
                <Select onValueChange={(id) => {
                  const employee = employees.find((e) => e.id === id)
                  if (employee) handleAddAttendance(employee)
                }}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((e) => (
                      <SelectItem key={e.id} value={e.id}>
                        {e.name} ({e.employeeId})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <Button 
                onClick={() => setShowEmployeeSelect(!showEmployeeSelect)}
                className="w-full sm:w-auto cursor-pointer"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Attendance
              </Button>
            </div>
          </div>
          
          {/* search and filters */}
          <AttendanceFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedDepartment={selectedDepartment}
            onDepartmentChange={setSelectedDepartment}
            selectedMonth={selectedMonth}
            onMonthChange={setSelectedMonth}
            selectedYear={selectedYear}
            onYearChange={setSelectedYear}
            attendanceRange={attendanceRange}
            onAttendanceRangeChange={setAttendanceRange}
            showFilters={showFilters}
            onToggleFilters={() => setShowFilters(!showFilters)}
            hasActiveFilters={hasActiveFiltersState}
            onClearFilters={clearFilters}
            onExport={downloadAttendanceExcel}
            filteredAttendanceCount={filteredAttendance.length}
            departments={filterOptions.departments}
            months={filterOptions.months}
            years={filterOptions.years}
            attendanceRanges={filterOptions.attendanceRanges}
          />
        </CardHeader>
        <CardContent className="p-3 sm:p-4 md:p-6">
          <AttendanceTable
            filteredAttendance={filteredAttendance}
            employees={employees}
            onViewAttendance={handleViewAttendance}
            onEditAttendance={handleEditAttendance}
          />
        </CardContent>
      </Card>

      {/* View Attendance Details Modal */}
      {viewingAttendance && (
        <AttendanceViewModal
          isOpen={viewModalOpen}
          onClose={() => setViewModalOpen(false)}
          viewingAttendance={viewingAttendance}
          employees={employees}
          formatCurrency={formatCurrency}
          userRole={user?.role}
        />
      )}

      {/* modal */}
      {selectedEmployee && (
        <AttendanceInputModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedEmployee(null)
            setEditingAttendance(null)
          }}
          employee={selectedEmployee}
          onSave={handleSaveAttendance}
          existingData={
            editingAttendance
              ? {
                  employeeId: editingAttendance.employeeId,
                  month: editingAttendance.month,
                  year: editingAttendance.year,
                  workingDays: editingAttendance.totalDays,
                  presentDays: editingAttendance.presentDays,
                  absentDays: editingAttendance.leavesTaken,
                  overtimeHours: Number(editingAttendance.overtimeHours),
                  hazardPay: Number(editingAttendance.shiftAllowance),
                  halfDays: 0,
                  paidLeave: 0,
                  unpaidLeave: editingAttendance.leavesTaken,
                  sickLeave: 0,
                  nightShiftDays: 0,
                }
              : undefined
          }
        />
      )}
    </div>
  )
}