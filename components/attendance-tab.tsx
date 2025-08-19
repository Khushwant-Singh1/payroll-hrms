"use client"
import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Calendar, Timer, Clock, Plus, Edit, Search } from "lucide-react"
import { AttendanceInputModal } from "./attendance-input-modal"
import type { AttendanceRecord, Employee } from "../types/payroll"
import type { AttendanceInput } from "../types/erp-payroll"

interface AttendanceTabProps {
  attendance: AttendanceRecord[]
  employees: Employee[]
  formatCurrency: (amount: number) => string
  addAttendanceRecord: (attendanceData: Omit<AttendanceRecord, "id">) => AttendanceRecord
  updateAttendanceRecord: (id: string, updates: Partial<AttendanceRecord>) => void
}

export function AttendanceTab({
  attendance,
  employees,
  formatCurrency,
  addAttendanceRecord,
  updateAttendanceRecord,
}: AttendanceTabProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [editingAttendance, setEditingAttendance] = useState<AttendanceRecord | null>(null)
  const [showEmployeeSelect, setShowEmployeeSelect] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  /* ---------- derived stats ---------- */
  const attendanceStats = [
    {
      icon: Calendar,
      title: "Leave Records",
      desc: "Annual, sick, casual leaves",
      value: `${attendance.reduce((s, a) => s + a.leavesTaken, 0)} days`,
    },
    {
      icon: Timer,
      title: "Overtime",
      desc: "Extra hours worked",
      value: `${attendance.reduce((s, a) => s + a.overtimeHours, 0)} hours`,
    },
    {
      icon: Clock,
      title: "Shift Allowances",
      desc: "Night/weekend premiums",
      value: formatCurrency(attendance.reduce((s, a) => s + a.shiftAllowance, 0)),
    },
  ]

  /* ---------- handlers ---------- */
  const handleAddAttendance = (employee: Employee) => {
    setSelectedEmployee(employee)
    setEditingAttendance(null)
    setIsModalOpen(true)
    setShowEmployeeSelect(false)
  }

  const handleEditAttendance = (employee: Employee, record: AttendanceRecord) => {
    setSelectedEmployee(employee)
    setEditingAttendance(record)
    setIsModalOpen(true)
  }

  const handleSaveAttendance = (attendanceData: AttendanceInput) => {
    if (!selectedEmployee) return

    const record: Omit<AttendanceRecord, "id"> = {
      employeeId: selectedEmployee.id,
      month: attendanceData.month,
      year: attendanceData.year,
      presentDays: attendanceData.presentDays,
      totalDays: attendanceData.workingDays,
      overtimeHours: attendanceData.overtimeHours,
      leavesTaken: attendanceData.absentDays,
      shiftAllowance: attendanceData.hazardPay,
    }

    if (editingAttendance) {
      updateAttendanceRecord(editingAttendance.id, record)
    } else {
      addAttendanceRecord(record)
    }
    setIsModalOpen(false)
    setSelectedEmployee(null)
    setEditingAttendance(null)
  }

  /* ---------- search filtering ---------- */
  const filteredAttendance = useMemo(() => {
    const term = searchTerm.toLowerCase()
    return attendance.filter((rec) => {
      const emp = employees.find((e) => e.id === rec.employeeId)
      if (!emp) return false
      return (
        emp.name.toLowerCase().includes(term) ||
        emp.employeeId.toLowerCase().includes(term) ||
        rec.month.toLowerCase().includes(term) ||
        String(rec.year).includes(term)
      )
    })
  }, [attendance, employees, searchTerm])

  return (
    <div className="space-y-6">
      {/* stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {attendanceStats.map((item, i) => (
          <Card key={i}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <item.icon className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-lg">{item.title}</CardTitle>
              </div>
              <CardDescription>{item.desc}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{item.value}</div>
              <Button variant="outline" className="w-full mt-4">
                View Details
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* attendance management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Attendance Management</CardTitle>
              <CardDescription>Manage employee attendance records</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {showEmployeeSelect && (
                <Select onValueChange={(id) => {
                  const employee = employees.find((e) => e.id === id)
                  if (employee) handleAddAttendance(employee)
                }}>
                  <SelectTrigger className="w-48">
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
              <Button onClick={() => setShowEmployeeSelect(!showEmployeeSelect)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Attendance
              </Button>
            </div>
          </div>
          {/* search bar */}
          <div className="mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, ID, month, or year..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Month/Year</TableHead>
                  <TableHead>Present Days</TableHead>
                  <TableHead>Total Days</TableHead>
                  <TableHead>Overtime Hours</TableHead>
                  <TableHead>Leaves</TableHead>
                  <TableHead>Attendance %</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAttendance.map((rec) => {
                  const employee = employees.find((e) => e.id === rec.employeeId)
                  if (!employee) return null
                  const percentage = Math.round((rec.presentDays / rec.totalDays) * 100)
                  return (
                    <TableRow key={rec.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{employee.name}</div>
                          <div className="text-sm text-gray-500">{employee.employeeId}</div>
                        </div>
                      </TableCell>
                      <TableCell>{rec.month} {rec.year}</TableCell>
                      <TableCell>{rec.presentDays}</TableCell>
                      <TableCell>{rec.totalDays}</TableCell>
                      <TableCell>{rec.overtimeHours}</TableCell>
                      <TableCell>{rec.leavesTaken}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            percentage >= 90 ? "default" : percentage >= 75 ? "secondary" : "destructive"
                          }
                        >
                          {percentage}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditAttendance(employee, rec)}
                          title="Edit Attendance"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

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
                  overtimeHours: editingAttendance.overtimeHours,
                  hazardPay: editingAttendance.shiftAllowance,
                  halfDays: 0, // Default value since not tracked in AttendanceRecord
                  paidLeave: 0, // Default value since not tracked in AttendanceRecord
                  unpaidLeave: editingAttendance.leavesTaken, // Map leavesTaken to unpaidLeave
                  sickLeave: 0, // Default value since not tracked in AttendanceRecord
                  nightShiftDays: 0, // Default value since not tracked in AttendanceRecord
                }
              : undefined
          }
        />
      )}
    </div>
  )
}