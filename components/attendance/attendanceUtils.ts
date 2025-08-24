import type { Employee } from "../../types/payroll"
import type { Attendance } from "@prisma/client"

// Type for attendance with employee data (from API response)
export type AttendanceWithEmployee = Attendance & {
  employee?: {
    id: string;
    name: string;
    employeeId: string;
    basicSalary: number;
    hra: number;
    allowances: number;
  }
}

export interface AttendanceStats {
  icon: any;
  title: string;
  desc: string;
  value: string;
  action: string;
  onClick?: () => void;
  disabled: boolean;
}

export interface FilterOptions {
  departments: string[];
  months: string[];
  years: number[];
  attendanceRanges: { value: string; label: string }[];
}

export interface ExcelExportData {
  [key: string]: any;
}

// Generate attendance statistics
export function generateAttendanceStats(
  attendance: AttendanceWithEmployee[],
  formatCurrency: (amount: number) => string,
  onExportData: () => void,
  filteredAttendanceCount: number
): AttendanceStats[] {
  return [
    {
      icon: null, // Will be set by component
      title: "Leave Records",
      desc: "Annual, sick, casual leaves",
      value: `${attendance.reduce((s, a) => s + a.leavesTaken, 0)} days`,
      action: "Export Data",
      onClick: onExportData,
      disabled: filteredAttendanceCount === 0,
    },
    {
      icon: null,
      title: "Overtime",
      desc: "Extra hours worked",
      value: `${attendance.reduce((s, a) => s + Number(a.overtimeHours), 0)} hours`,
      action: "View Details",
      onClick: undefined,
      disabled: false,
    },
    {
      icon: null,
      title: "Shift Allowances",
      desc: "Night/weekend premiums",
      value: formatCurrency(attendance.reduce((s, a) => s + Number(a.shiftAllowance), 0)),
      action: "View Details",
      onClick: undefined,
      disabled: false,
    },
  ]
}

// Generate filter options
export function generateFilterOptions(
  employees: Employee[],
  attendance: AttendanceWithEmployee[]
): FilterOptions {
  const departments = Array.from(new Set(employees.map(emp => emp.department))).sort()
  
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]
  
  const years = Array.from(new Set(attendance.map(a => a.year))).sort((a, b) => b - a)
  
  const attendanceRanges = [
    { value: "all", label: "All Attendance" },
    { value: "excellent", label: "Excellent (90%+)" },
    { value: "good", label: "Good (75-89%)" },
    { value: "average", label: "Average (60-74%)" },
    { value: "poor", label: "Poor (<60%)" },
  ]

  return { departments, months, years, attendanceRanges }
}

// Filter attendance records based on search and filter criteria
export function filterAttendanceRecords(
  attendance: AttendanceWithEmployee[],
  employees: Employee[],
  searchTerm: string,
  selectedDepartment: string,
  selectedMonth: string,
  selectedYear: string,
  attendanceRange: string
): AttendanceWithEmployee[] {
  const term = searchTerm.toLowerCase()
  
  return attendance.filter((rec) => {
    const emp = rec.employee || employees.find((e) => e.id === rec.employeeId)
    if (!emp) return false
    
    const fullEmployee = employees.find((e) => e.id === rec.employeeId)
    
    // Search filter
    const matchesSearch = !term || (
      emp.name.toLowerCase().includes(term) ||
      emp.employeeId.toLowerCase().includes(term) ||
      rec.month.toLowerCase().includes(term) ||
      String(rec.year).includes(term)
    )
    
    // Department filter
    const matchesDepartment = selectedDepartment === "all" || 
                             (fullEmployee && fullEmployee.department === selectedDepartment)
    
    // Month filter
    const matchesMonth = selectedMonth === "all" || rec.month === selectedMonth
    
    // Year filter
    const matchesYear = selectedYear === "all" || rec.year === parseInt(selectedYear)
    
    // Attendance percentage filter
    const percentage = Math.round((rec.presentDays / rec.totalDays) * 100)
    let matchesAttendanceRange = true
    if (attendanceRange !== "all") {
      switch (attendanceRange) {
        case "excellent":
          matchesAttendanceRange = percentage >= 90
          break
        case "good":
          matchesAttendanceRange = percentage >= 75 && percentage < 90
          break
        case "average":
          matchesAttendanceRange = percentage >= 60 && percentage < 75
          break
        case "poor":
          matchesAttendanceRange = percentage < 60
          break
      }
    }
    
    return matchesSearch && matchesDepartment && matchesMonth && matchesYear && matchesAttendanceRange
  })
}

// Check if any filters are active
export function hasActiveFilters(
  selectedDepartment: string,
  selectedMonth: string,
  selectedYear: string,
  attendanceRange: string,
  searchTerm: string
): boolean {
  return selectedDepartment !== "all" || 
         selectedMonth !== "all" || 
         selectedYear !== "all" || 
         attendanceRange !== "all" || 
         searchTerm !== ""
}

// Generate Excel export data
export function generateExcelExportData(
  filteredAttendance: AttendanceWithEmployee[],
  employees: Employee[],
  selectedDepartment: string,
  selectedMonth: string,
  selectedYear: string,
  attendanceRange: string,
  searchTerm: string
): ExcelExportData[] {
  const excelData = filteredAttendance.map((rec) => {
    const employee = rec.employee || employees.find((e) => e.id === rec.employeeId)
    const fullEmployee = employees.find((e) => e.id === rec.employeeId)
    const percentage = Math.round((rec.presentDays / rec.totalDays) * 100)
    
    // Calculate salary impact based on attendance
    const basicSalary = fullEmployee?.basicSalary || 0
    const hra = fullEmployee?.hra || 0
    const allowances = fullEmployee?.allowances || 0
    const totalSalary = Number(basicSalary) + Number(hra) + Number(allowances)
    const salaryEarned = (totalSalary * rec.presentDays) / rec.totalDays
    const salaryLoss = totalSalary - salaryEarned
    
    return {
      "Employee ID": employee?.employeeId || "N/A",
      "Employee Name": employee?.name || "N/A",
      "Department": fullEmployee?.department || "N/A",
      "Designation": fullEmployee?.designation || "N/A",
      "Company": fullEmployee?.company || "N/A",
      "Location": fullEmployee?.location || "N/A",
      "Grade": fullEmployee?.grade || "N/A",
      "Month": rec.month,
      "Year": rec.year,
      "Present Days": rec.presentDays,
      "Total Working Days": rec.totalDays,
      "Absent Days": rec.leavesTaken,
      "Attendance Percentage": `${percentage}%`,
      "Attendance Category": percentage >= 90 ? "Excellent" : percentage >= 75 ? "Good" : percentage >= 60 ? "Average" : "Poor",
      "Overtime Hours": Number(rec.overtimeHours),
      "Shift Allowance": Number(rec.shiftAllowance),
      "Basic Salary": Number(basicSalary),
      "HRA": Number(hra),
      "Other Allowances": Number(allowances),
      "Total Monthly Salary": totalSalary,
      "Salary Earned (Pro-rated)": Math.round(salaryEarned),
      "Salary Loss": Math.round(salaryLoss),
      "Phone": fullEmployee?.phone || "N/A",
      "Email": fullEmployee?.email || "N/A",
      "Joining Date": fullEmployee?.joiningDate ? new Date(fullEmployee.joiningDate).toLocaleDateString() : "N/A",
      "Employment Status": fullEmployee?.status || "N/A",
      "PF Opted": fullEmployee?.pfOptIn ? "Yes" : "No",
      "ESI Applicable": fullEmployee?.esiApplicable ? "Yes" : "No",
      "Record Created": new Date(rec.createdAt).toLocaleDateString(),
      "Last Updated": new Date(rec.updatedAt).toLocaleDateString(),
    }
  })

  // Add summary rows
  const totalEmployees = filteredAttendance.length
  const totalPresentDays = filteredAttendance.reduce((sum, rec) => sum + rec.presentDays, 0)
  const totalWorkingDays = filteredAttendance.reduce((sum, rec) => sum + rec.totalDays, 0)
  const totalAbsentDays = filteredAttendance.reduce((sum, rec) => sum + rec.leavesTaken, 0)
  const totalOvertimeHours = filteredAttendance.reduce((sum, rec) => sum + Number(rec.overtimeHours), 0)
  const totalShiftAllowance = filteredAttendance.reduce((sum, rec) => sum + Number(rec.shiftAllowance), 0)
  const averageAttendance = totalWorkingDays > 0 ? Math.round((totalPresentDays / totalWorkingDays) * 100) : 0

  // Add summary rows
  excelData.push({
    "Employee ID": "",
    "Employee Name": "--- SUMMARY ---",
    "Department": "",
    "Designation": "",
    "Company": "",
    "Location": "",
    "Grade": "",
    "Month": "",
    "Year": "" as any,
    "Present Days": "" as any,
    "Total Working Days": "" as any,
    "Absent Days": "" as any,
    "Attendance Percentage": "",
    "Attendance Category": "",
    "Overtime Hours": "" as any,
    "Shift Allowance": "" as any,
    "Basic Salary": "" as any,
    "HRA": "" as any,
    "Other Allowances": "" as any,
    "Total Monthly Salary": "" as any,
    "Salary Earned (Pro-rated)": "" as any,
    "Salary Loss": "" as any,
    "Phone": "",
    "Email": "",
    "Joining Date": "",
    "Employment Status": "",
    "PF Opted": "",
    "ESI Applicable": "",
    "Record Created": "",
    "Last Updated": "",
  })

  excelData.push({
    "Employee ID": "TOTAL",
    "Employee Name": `${totalEmployees} Employees`,
    "Department": "",
    "Designation": "",
    "Company": "",
    "Location": "",
    "Grade": "",
    "Month": "",
    "Year": "" as any,
    "Present Days": totalPresentDays,
    "Total Working Days": totalWorkingDays,
    "Absent Days": totalAbsentDays,
    "Attendance Percentage": `${averageAttendance}%`,
    "Attendance Category": "",
    "Overtime Hours": totalOvertimeHours,
    "Shift Allowance": totalShiftAllowance,
    "Basic Salary": "" as any,
    "HRA": "" as any,
    "Other Allowances": "" as any,
    "Total Monthly Salary": "" as any,
    "Salary Earned (Pro-rated)": "" as any,
    "Salary Loss": "" as any,
    "Phone": "",
    "Email": "",
    "Joining Date": "",
    "Employment Status": "",
    "PF Opted": "",
    "ESI Applicable": "",
    "Record Created": new Date().toLocaleDateString(),
    "Last Updated": "",
  })

  return excelData
}

// Generate filename for export
export function generateExportFilename(
  selectedDepartment: string,
  selectedMonth: string,
  selectedYear: string,
  attendanceRange: string,
  searchTerm: string
): string {
  let filename = "Attendance_Report"
  const filterParts = []
  
  if (selectedDepartment !== "all") filterParts.push(selectedDepartment.replace(/\s+/g, "_"))
  if (selectedMonth !== "all") filterParts.push(selectedMonth)
  if (selectedYear !== "all") filterParts.push(selectedYear)
  if (attendanceRange !== "all") filterParts.push(attendanceRange)
  if (searchTerm) filterParts.push("searched")
  
  if (filterParts.length > 0) {
    filename += `_${filterParts.join("_")}`
  }
  
  filename += `_${new Date().toISOString().slice(0, 10)}`
  
  return filename
}
