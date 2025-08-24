"use client"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Edit } from "lucide-react"
import type { Employee } from "../../types/payroll"

interface AttendanceTableProps {
  filteredAttendance: any[]
  employees: Employee[]
  onViewAttendance: (record: any) => void
  onEditAttendance: (employee: Employee, record: any) => void
}

export function AttendanceTable({
  filteredAttendance,
  employees,
  onViewAttendance,
  onEditAttendance,
}: AttendanceTableProps) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs sm:text-sm">Employee</TableHead>
              <TableHead className="text-xs sm:text-sm">Month/Year</TableHead>
              <TableHead className="text-xs sm:text-sm">Present Days</TableHead>
              <TableHead className="text-xs sm:text-sm">Total Days</TableHead>
              <TableHead className="text-xs sm:text-sm">Overtime Hours</TableHead>
              <TableHead className="text-xs sm:text-sm">Leaves</TableHead>
              <TableHead className="text-xs sm:text-sm">Attendance %</TableHead>
              <TableHead className="text-xs sm:text-sm">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAttendance.map((rec) => {
              // Try to get employee from the included relation first, then fallback to employees array
              const employee = rec.employee || employees.find((e) => e.id === rec.employeeId)
              if (!employee) return null
              const percentage = Math.round((rec.presentDays / rec.totalDays) * 100)
              return (
                <TableRow key={rec.id}>
                  <TableCell className="text-xs sm:text-sm">
                    <div>
                      <div className="font-medium">{employee.name}</div>
                      <div className="text-xs text-gray-500">{employee.employeeId}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs sm:text-sm">{rec.month} {rec.year}</TableCell>
                  <TableCell className="text-xs sm:text-sm">{rec.presentDays}</TableCell>
                  <TableCell className="text-xs sm:text-sm">{rec.totalDays}</TableCell>
                  <TableCell className="text-xs sm:text-sm">{Number(rec.overtimeHours)}</TableCell>
                  <TableCell className="text-xs sm:text-sm">{rec.leavesTaken}</TableCell>
                  <TableCell className="text-xs sm:text-sm">
                    <Badge
                      variant={
                        percentage >= 90 ? "default" : percentage >= 75 ? "secondary" : "destructive"
                      }
                      className="text-xs"
                    >
                      {percentage}%
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs sm:text-sm">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onViewAttendance(rec)}
                        title="View Attendance Details"
                        className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                      >
                        <Eye className="h-3 w-3 sm:h-3 sm:w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          // Find the full employee object from the employees array
                          const fullEmployee = employees.find(e => e.id === employee.id)
                          if (fullEmployee) {
                            onEditAttendance(fullEmployee, rec)
                          }
                        }}
                        title="Edit Attendance"
                        className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                      >
                        <Edit className="h-3 w-3 sm:h-3 sm:w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
