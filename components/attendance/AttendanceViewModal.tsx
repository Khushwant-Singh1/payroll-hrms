"use client"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Calendar } from "lucide-react"
import type { Employee } from "../../types/payroll"

interface AttendanceViewModalProps {
  isOpen: boolean
  onClose: () => void
  viewingAttendance: any
  employees: Employee[]
  formatCurrency: (amount: number) => string
  userRole?: string
}

export function AttendanceViewModal({
  isOpen,
  onClose,
  viewingAttendance,
  employees,
  formatCurrency,
  userRole,
}: AttendanceViewModalProps) {
  if (!viewingAttendance) return null

  const employee = viewingAttendance.employee || employees.find(e => e.id === viewingAttendance.employeeId)
  const fullEmployee = employees.find(e => e.id === viewingAttendance.employeeId)
  
  const basicSalary = employee?.basicSalary || fullEmployee?.basicSalary || 0
  const hra = employee?.hra || fullEmployee?.hra || 0
  const allowances = employee?.allowances || fullEmployee?.allowances || 0
  const totalSalary = Number(basicSalary) + Number(hra) + Number(allowances)
  const attendanceRate = viewingAttendance.presentDays / viewingAttendance.totalDays
  const salaryEarned = totalSalary * attendanceRate
  const salaryLoss = totalSalary - salaryEarned
  const overtimePay = Number(viewingAttendance.overtimeHours) * 200
  const shiftAllowance = Number(viewingAttendance.shiftAllowance)
  const totalEarnings = salaryEarned + overtimePay + shiftAllowance

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] md:max-w-4xl lg:max-w-5xl max-h-[90vh] overflow-y-auto p-3 sm:p-4 md:p-6">
        <DialogHeader className="pb-3 sm:pb-4 md:pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <div className="p-2 bg-blue-100 rounded-lg self-start sm:self-center">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-blue-600" />
            </div>
            <div>
              <DialogTitle className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                Attendance Details
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm md:text-base text-gray-600 mt-1">
                Comprehensive attendance information for{" "}
                <span className="font-semibold text-gray-800">
                  {employee?.name || fullEmployee?.name}
                </span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-4 sm:space-y-6 md:space-y-8">
          {/* Employee Information Card */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 sm:p-4 md:p-6 border border-blue-100">
            <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
              <div className="p-1.5 bg-blue-200 rounded-md">
                <svg className="h-3 w-3 sm:h-4 sm:w-4 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              Employee Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
              <div className="bg-white rounded-lg p-2 sm:p-3 md:p-4 border border-blue-200">
                <label className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-1 block">Employee Name</label>
                <p className="text-xs sm:text-sm font-semibold text-gray-900">
                  {employee?.name || fullEmployee?.name}
                </p>
              </div>
              <div className="bg-white rounded-lg p-2 sm:p-3 md:p-4 border border-blue-200">
                <label className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-1 block">Employee ID</label>
                <p className="text-xs sm:text-sm font-semibold text-gray-900">
                  {employee?.employeeId || fullEmployee?.employeeId}
                </p>
              </div>
              <div className="bg-white rounded-lg p-2 sm:p-3 md:p-4 border border-blue-200">
                <label className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-1 block">Department</label>
                <p className="text-xs sm:text-sm font-semibold text-gray-900">
                  {fullEmployee?.department || "N/A"}
                </p>
              </div>
              <div className="bg-white rounded-lg p-2 sm:p-3 md:p-4 border border-blue-200">
                <label className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-1 block">Designation</label>
                <p className="text-xs sm:text-sm font-semibold text-gray-900">
                  {fullEmployee?.designation || "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Salary Preview Card */}
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-3 sm:p-4 md:p-6 border border-emerald-100">
            <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
              <div className="p-1.5 bg-emerald-200 rounded-md">
                <svg className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              Salary Preview & Impact
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4">
              <div className="bg-white rounded-lg p-2 sm:p-3 md:p-4 border border-emerald-200">
                <label className="text-xs font-medium text-emerald-600 uppercase tracking-wide mb-1 block">Basic Salary</label>
                <p className="text-sm sm:text-base md:text-lg font-semibold text-gray-900">
                  {formatCurrency(basicSalary)}
                </p>
              </div>
              <div className="bg-white rounded-lg p-2 sm:p-3 md:p-4 border border-emerald-200">
                <label className="text-xs font-medium text-emerald-600 uppercase tracking-wide mb-1 block">HRA</label>
                <p className="text-sm sm:text-base md:text-lg font-semibold text-gray-900">
                  {formatCurrency(hra)}
                </p>
              </div>
              <div className="bg-white rounded-lg p-2 sm:p-3 md:p-4 border border-emerald-200">
                <label className="text-xs font-medium text-emerald-600 uppercase tracking-wide mb-1 block">Other Allowances</label>
                <p className="text-sm sm:text-base md:text-lg font-semibold text-gray-900">
                  {formatCurrency(allowances)}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-emerald-100 rounded-lg p-4 border border-emerald-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-emerald-800">Total Monthly Salary</span>
                  <span className="text-xl font-bold text-emerald-900">{formatCurrency(totalSalary)}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                <div className="bg-white rounded-lg p-2 sm:p-3 md:p-4 border border-emerald-200 text-center">
                  <p className="text-xs sm:text-sm font-medium text-gray-700 mb-1">Salary Earned</p>
                  <p className="text-sm sm:text-base md:text-lg font-bold text-green-600">{formatCurrency(Math.round(salaryEarned))}</p>
                  <p className="text-xs text-gray-500">{(attendanceRate * 100).toFixed(1)}% of total</p>
                </div>
                
                <div className="bg-white rounded-lg p-2 sm:p-3 md:p-4 border border-emerald-200 text-center">
                  <p className="text-xs sm:text-sm font-medium text-gray-700 mb-1">Salary Loss</p>
                  <p className="text-sm sm:text-base md:text-lg font-bold text-red-600">{formatCurrency(Math.round(salaryLoss))}</p>
                  <p className="text-xs text-gray-500">Due to absences</p>
                </div>
                
                <div className="bg-white rounded-lg p-2 sm:p-3 md:p-4 border border-emerald-200 text-center">
                  <p className="text-xs sm:text-sm font-medium text-gray-700 mb-1">Overtime Pay</p>
                  <p className="text-sm sm:text-base md:text-lg font-bold text-orange-600">{formatCurrency(overtimePay)}</p>
                  <p className="text-xs text-gray-500">{Number(viewingAttendance.overtimeHours)} hours</p>
                </div>
                
                <div className="bg-white rounded-lg p-2 sm:p-3 md:p-4 border border-emerald-200 text-center">
                  <p className="text-xs sm:text-sm font-medium text-gray-700 mb-1">Shift Allowance</p>
                  <p className="text-sm sm:text-base md:text-lg font-bold text-indigo-600">{formatCurrency(shiftAllowance)}</p>
                  <p className="text-xs text-gray-500">Additional benefits</p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg p-4 text-white">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total Earnings This Month</span>
                  <span className="text-2xl font-bold">{formatCurrency(Math.round(totalEarnings))}</span>
                </div>
                <p className="text-xs text-emerald-100 mt-1">
                  Including base salary, overtime, and allowances
                </p>
              </div>
            </div>
          </div>

          {/* Attendance Summary Card */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-3 sm:p-4 md:p-6 border border-green-100">
            <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
              <div className="p-1.5 bg-green-200 rounded-md">
                <svg className="h-3 w-3 sm:h-4 sm:w-4 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              Attendance Summary for {viewingAttendance.month} {viewingAttendance.year}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
              <div className="bg-white rounded-xl p-3 sm:p-4 md:p-6 border border-green-200 text-center shadow-sm hover:shadow-md transition-shadow">
                <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-green-600 mb-1">{viewingAttendance.presentDays}</p>
                <p className="text-xs sm:text-sm font-medium text-green-800">Present Days</p>
              </div>
              <div className="bg-white rounded-xl p-3 sm:p-4 md:p-6 border border-gray-200 text-center shadow-sm hover:shadow-md transition-shadow">
                <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-600 mb-1">{viewingAttendance.totalDays}</p>
                <p className="text-xs sm:text-sm font-medium text-gray-800">Total Days</p>
              </div>
              <div className="bg-white rounded-xl p-3 sm:p-4 md:p-6 border border-red-200 text-center shadow-sm hover:shadow-md transition-shadow">
                <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-red-600 mb-1">{viewingAttendance.leavesTaken}</p>
                <p className="text-xs sm:text-sm font-medium text-red-800">Leaves Taken</p>
              </div>
              <div className="bg-white rounded-xl p-3 sm:p-4 md:p-6 border border-emerald-200 text-center shadow-sm hover:shadow-md transition-shadow">
                <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-emerald-600 mb-1">
                  {Math.round((viewingAttendance.presentDays / viewingAttendance.totalDays) * 100)}%
                </p>
                <p className="text-xs sm:text-sm font-medium text-emerald-800">Attendance Rate</p>
              </div>
            </div>
            
            {/* Attendance Progress Bar */}
            <div className="mt-4 sm:mt-6 bg-white rounded-lg p-3 sm:p-4 border border-green-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs sm:text-sm font-medium text-gray-700">Attendance Progress</span>
                <span className="text-xs sm:text-sm font-semibold text-green-600">
                  {Math.round((viewingAttendance.presentDays / viewingAttendance.totalDays) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
                <div 
                  className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 sm:h-3 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${(viewingAttendance.presentDays / viewingAttendance.totalDays) * 100}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>
          </div>

          {/* Additional Details Card */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 sm:p-6 border border-purple-100">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <div className="p-1.5 bg-purple-200 rounded-md">
                <svg className="h-4 w-4 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              Additional Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="bg-white rounded-lg p-3 sm:p-4 border border-purple-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <svg className="h-5 w-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Overtime Hours</label>
                    <p className="text-base sm:text-lg font-semibold text-gray-900">{Number(viewingAttendance.overtimeHours)} hours</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg p-3 sm:p-4 border border-purple-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <svg className="h-5 w-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Shift Allowance</label>
                    <p className="text-base sm:text-lg font-semibold text-gray-900">{formatCurrency(Number(viewingAttendance.shiftAllowance))}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg p-3 sm:p-4 border border-purple-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Record Created</label>
                    <p className="text-base sm:text-lg font-semibold text-gray-900">
                      {new Date(viewingAttendance.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg p-3 sm:p-4 border border-purple-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Last Updated</label>
                    <p className="text-base sm:text-lg font-semibold text-gray-900">
                      {new Date(viewingAttendance.updatedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Role-based additional information for admins */}
          {userRole === "ADMIN" && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 sm:p-6 border border-amber-100">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <div className="p-1.5 bg-amber-200 rounded-md">
                  <svg className="h-4 w-4 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                Admin Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-white rounded-lg p-3 sm:p-4 border border-amber-200">
                  <label className="text-xs font-medium text-amber-600 uppercase tracking-wide mb-1 block">Basic Salary</label>
                  <p className="text-base sm:text-lg font-semibold text-gray-900">
                    {formatCurrency(Number(basicSalary))}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-3 sm:p-4 border border-amber-200">
                  <label className="text-xs font-medium text-amber-600 uppercase tracking-wide mb-1 block">HRA</label>
                  <p className="text-base sm:text-lg font-semibold text-gray-900">
                    {formatCurrency(Number(hra))}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-3 sm:p-4 border border-amber-200">
                  <label className="text-xs font-medium text-amber-600 uppercase tracking-wide mb-1 block">Allowances</label>
                  <p className="text-base sm:text-lg font-semibold text-gray-900">
                    {formatCurrency(Number(allowances))}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-3 sm:p-4 border border-amber-200">
                  <label className="text-xs font-medium text-amber-600 uppercase tracking-wide mb-1 block">Salary Earned</label>
                  <p className="text-base sm:text-lg font-semibold text-amber-600">
                    {((viewingAttendance.presentDays / viewingAttendance.totalDays) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
