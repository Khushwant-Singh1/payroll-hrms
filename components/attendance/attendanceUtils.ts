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
    
    // Calculate total earnings based on new schema
    const totalEarnings = fullEmployee ? (
      Number(fullEmployee.basicSalary || 0) +
      Number(fullEmployee.specialBasic || 0) +
      Number(fullEmployee.dearnessAllowance || 0) +
      Number(fullEmployee.hra || 0) +
      Number(fullEmployee.overtimeRate || 0) +
      Number(fullEmployee.foodAllowance || 0) +
      Number(fullEmployee.conveyanceAllowance || 0) +
      Number(fullEmployee.officeWearAllowance || 0) +
      Number(fullEmployee.bonus || 0) +
      Number(fullEmployee.leaveWithWages || 0) +
      Number(fullEmployee.otherAllowances || 0) +
      Number(fullEmployee.rateOfWages || 0)
    ) : 0;

    // Calculate total deductions based on new schema
    const totalDeductions = fullEmployee ? (
      Number(fullEmployee.pfDeduction || 0) +
      Number(fullEmployee.esicDeduction || 0) +
      Number(fullEmployee.societyDeduction || 0) +
      Number(fullEmployee.incomeTaxDeduction || 0) +
      Number(fullEmployee.insuranceDeduction || 0) +
      Number(fullEmployee.otherRecoveries || 0)
    ) : 0;

    // Calculate net salary
    const netSalary = totalEarnings - totalDeductions;
    
    // Calculate salary impact based on attendance (pro-rated based on present days)
    const earnedSalary = (totalEarnings * rec.presentDays) / rec.totalDays;
    const salaryLoss = totalEarnings - earnedSalary;
    const netEarnedSalary = earnedSalary - totalDeductions;
    
    // Calculate overtime pay (assuming ₹500 per hour as per modal)
    const overtimePay = Number(rec.overtimeHours) * 500;
    
    // Calculate final net pay including overtime and shift allowances
    const finalNetPay = netEarnedSalary + overtimePay + Number(rec.shiftAllowance);
    
    return {
      "Employee ID": employee?.employeeId || "N/A",
      "Employee Name": employee?.name || "N/A",
      "Department": fullEmployee?.department || "N/A",
      "Designation": fullEmployee?.designation || "N/A",
      "Company": fullEmployee?.company || "N/A",
      "Location": fullEmployee?.location || "N/A",
      "Grade": fullEmployee?.grade || "N/A",
      "Employment Status": fullEmployee?.status || "N/A",
      
      // Attendance Details
      "Month": rec.month,
      "Year": rec.year,
      "Present Days": rec.presentDays,
      "Total Working Days": rec.totalDays,
      "Absent Days": rec.leavesTaken,
      "Attendance Percentage": `${percentage}%`,
      "Attendance Category": percentage >= 90 ? "Excellent" : percentage >= 75 ? "Good" : percentage >= 60 ? "Average" : "Poor",
      "Overtime Hours": Number(rec.overtimeHours),
      "Shift Allowance": Number(rec.shiftAllowance),
      
      // Salary Components (Earnings)
      "Basic Salary": Number(fullEmployee?.basicSalary || 0),
      "Special Basic": Number(fullEmployee?.specialBasic || 0),
      "Dearness Allowance (DA)": Number(fullEmployee?.dearnessAllowance || 0),
      "House Rent Allowance (HRA)": Number(fullEmployee?.hra || 0),
      "Overtime Rate": Number(fullEmployee?.overtimeRate || 0),
      "Food Allowance": Number(fullEmployee?.foodAllowance || 0),
      "Conveyance Allowance": Number(fullEmployee?.conveyanceAllowance || 0),
      "Office Wear Allowance": Number(fullEmployee?.officeWearAllowance || 0),
      "Bonus": Number(fullEmployee?.bonus || 0),
      "Leave With Wages": Number(fullEmployee?.leaveWithWages || 0),
      "Other Allowances": Number(fullEmployee?.otherAllowances || 0),
      "Rate of Wages": Number(fullEmployee?.rateOfWages || 0),
      "Total Earnings (Monthly)": totalEarnings,
      
      // Deductions
      "PF Deduction": Number(fullEmployee?.pfDeduction || 0),
      "ESIC Deduction": Number(fullEmployee?.esicDeduction || 0),
      "Society Deduction": Number(fullEmployee?.societyDeduction || 0),
      "Income Tax Deduction": Number(fullEmployee?.incomeTaxDeduction || 0),
      "Insurance Deduction": Number(fullEmployee?.insuranceDeduction || 0),
      "Other Recoveries": Number(fullEmployee?.otherRecoveries || 0),
      "Total Deductions (Monthly)": totalDeductions,
      
      // Net Salary Calculations
      "Net Salary (Monthly)": netSalary,
      "Earned Salary (Pro-rated)": Math.round(earnedSalary),
      "Salary Loss Due to Absence": Math.round(salaryLoss),
      "Net Earned Salary": Math.round(netEarnedSalary),
      "Overtime Pay": overtimePay,
      "Final Net Pay (Including OT & Allowances)": Math.round(finalNetPay),
      
      // Employer Contributions
      "Employer PF Contribution": Number(fullEmployee?.employerPfContribution || 0),
      "Employer ESIC Contribution": Number(fullEmployee?.employerEsicContribution || 0),
      
      // Personal Details
      "Phone": fullEmployee?.phone || "N/A",
      "Email": fullEmployee?.email || "N/A",
      "Joining Date": fullEmployee?.joiningDate ? new Date(fullEmployee.joiningDate).toLocaleDateString() : "N/A",
      "Date of Birth": fullEmployee?.dateOfBirth ? new Date(fullEmployee.dateOfBirth).toLocaleDateString() : "N/A",
      
      // Statutory Information
      "PAN": fullEmployee?.pan || "N/A",
      "Aadhaar": fullEmployee?.aadhaar || "N/A",
      "UAN": fullEmployee?.uan || "N/A",
      "ESIC Number": fullEmployee?.esicNumber || "N/A",
      "PF Opted": fullEmployee?.pfOptIn ? "Yes" : "No",
      "ESI Applicable": fullEmployee?.esiApplicable ? "Yes" : "No",
      "LWF State": fullEmployee?.lwfState || "N/A",
      
      // Bank Information
      "Bank Account": fullEmployee?.bankAccount || "N/A",
      "IFSC Code": fullEmployee?.ifsc || "N/A",
      "Branch": fullEmployee?.branch || "N/A",
      "Last Transaction ID": fullEmployee?.lastTransactionId || "N/A",
      "Last Payment Date": fullEmployee?.lastPaymentDate ? new Date(fullEmployee.lastPaymentDate).toLocaleDateString() : "N/A",
      
      // Record Tracking
      "Record Created": new Date(rec.createdAt).toLocaleDateString(),
      "Last Updated": new Date(rec.updatedAt).toLocaleDateString(),
    }
  })

  // Calculate comprehensive summary statistics
  const totalEmployees = filteredAttendance.length
  const totalPresentDays = filteredAttendance.reduce((sum, rec) => sum + rec.presentDays, 0)
  const totalWorkingDays = filteredAttendance.reduce((sum, rec) => sum + rec.totalDays, 0)
  const totalAbsentDays = filteredAttendance.reduce((sum, rec) => sum + rec.leavesTaken, 0)
  const totalOvertimeHours = filteredAttendance.reduce((sum, rec) => sum + Number(rec.overtimeHours), 0)
  const totalShiftAllowance = filteredAttendance.reduce((sum, rec) => sum + Number(rec.shiftAllowance), 0)
  const averageAttendance = totalWorkingDays > 0 ? Math.round((totalPresentDays / totalWorkingDays) * 100) : 0

  // Calculate total salary impact
  const totalMonthlyEarnings = filteredAttendance.reduce((sum, rec) => {
    const fullEmployee = employees.find((e) => e.id === rec.employeeId)
    if (!fullEmployee) return sum;
    return sum + (
      Number(fullEmployee.basicSalary || 0) +
      Number(fullEmployee.specialBasic || 0) +
      Number(fullEmployee.dearnessAllowance || 0) +
      Number(fullEmployee.hra || 0) +
      Number(fullEmployee.overtimeRate || 0) +
      Number(fullEmployee.foodAllowance || 0) +
      Number(fullEmployee.conveyanceAllowance || 0) +
      Number(fullEmployee.officeWearAllowance || 0) +
      Number(fullEmployee.bonus || 0) +
      Number(fullEmployee.leaveWithWages || 0) +
      Number(fullEmployee.otherAllowances || 0) +
      Number(fullEmployee.rateOfWages || 0)
    );
  }, 0);

  const totalMonthlyDeductions = filteredAttendance.reduce((sum, rec) => {
    const fullEmployee = employees.find((e) => e.id === rec.employeeId)
    if (!fullEmployee) return sum;
    return sum + (
      Number(fullEmployee.pfDeduction || 0) +
      Number(fullEmployee.esicDeduction || 0) +
      Number(fullEmployee.societyDeduction || 0) +
      Number(fullEmployee.incomeTaxDeduction || 0) +
      Number(fullEmployee.insuranceDeduction || 0) +
      Number(fullEmployee.otherRecoveries || 0)
    );
  }, 0);

  const totalOvertimePay = totalOvertimeHours * 500;
  const totalEarnedSalaries = filteredAttendance.reduce((sum, rec) => {
    const fullEmployee = employees.find((e) => e.id === rec.employeeId)
    if (!fullEmployee) return sum;
    const totalEarnings = (
      Number(fullEmployee.basicSalary || 0) +
      Number(fullEmployee.specialBasic || 0) +
      Number(fullEmployee.dearnessAllowance || 0) +
      Number(fullEmployee.hra || 0) +
      Number(fullEmployee.overtimeRate || 0) +
      Number(fullEmployee.foodAllowance || 0) +
      Number(fullEmployee.conveyanceAllowance || 0) +
      Number(fullEmployee.officeWearAllowance || 0) +
      Number(fullEmployee.bonus || 0) +
      Number(fullEmployee.leaveWithWages || 0) +
      Number(fullEmployee.otherAllowances || 0) +
      Number(fullEmployee.rateOfWages || 0)
    );
    return sum + ((totalEarnings * rec.presentDays) / rec.totalDays);
  }, 0);

  // Add summary rows
  excelData.push({
    "Employee ID": "",
    "Employee Name": "--- COMPREHENSIVE SUMMARY ---",
    "Department": "",
    "Designation": "",
    "Company": "",
    "Location": "",
    "Grade": "",
    "Employment Status": "",
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
    "Special Basic": "" as any,
    "Dearness Allowance (DA)": "" as any,
    "House Rent Allowance (HRA)": "" as any,
    "Overtime Rate": "" as any,
    "Food Allowance": "" as any,
    "Conveyance Allowance": "" as any,
    "Office Wear Allowance": "" as any,
    "Bonus": "" as any,
    "Leave With Wages": "" as any,
    "Other Allowances": "" as any,
    "Rate of Wages": "" as any,
    "Total Earnings (Monthly)": "" as any,
    "PF Deduction": "" as any,
    "ESIC Deduction": "" as any,
    "Society Deduction": "" as any,
    "Income Tax Deduction": "" as any,
    "Insurance Deduction": "" as any,
    "Other Recoveries": "" as any,
    "Total Deductions (Monthly)": "" as any,
    "Net Salary (Monthly)": "" as any,
    "Earned Salary (Pro-rated)": "" as any,
    "Salary Loss Due to Absence": "" as any,
    "Net Earned Salary": "" as any,
    "Overtime Pay": "" as any,
    "Final Net Pay (Including OT & Allowances)": "" as any,
    "Employer PF Contribution": "" as any,
    "Employer ESIC Contribution": "" as any,
    "Phone": "",
    "Email": "",
    "Joining Date": "",
    "Date of Birth": "",
    "PAN": "",
    "Aadhaar": "",
    "UAN": "",
    "ESIC Number": "",
    "PF Opted": "",
    "ESI Applicable": "",
    "LWF State": "",
    "Bank Account": "",
    "IFSC Code": "",
    "Branch": "",
    "Last Transaction ID": "",
    "Last Payment Date": "",
    "Record Created": "",
    "Last Updated": "",
  })

  excelData.push({
    "Employee ID": "TOTALS",
    "Employee Name": `${totalEmployees} Employees`,
    "Department": `${new Set(employees.map(e => e.department)).size} Departments`,
    "Designation": "",
    "Company": `${new Set(employees.map(e => e.company)).size} Companies`,
    "Location": "",
    "Grade": "",
    "Employment Status": "",
    "Month": "",
    "Year": "" as any,
    "Present Days": totalPresentDays,
    "Total Working Days": totalWorkingDays,
    "Absent Days": totalAbsentDays,
    "Attendance Percentage": `${averageAttendance}%`,
    "Attendance Category": "",
    "Overtime Hours": totalOvertimeHours,
    "Shift Allowance": Math.round(totalShiftAllowance),
    "Basic Salary": "" as any,
    "Special Basic": "" as any,
    "Dearness Allowance (DA)": "" as any,
    "House Rent Allowance (HRA)": "" as any,
    "Overtime Rate": "" as any,
    "Food Allowance": "" as any,
    "Conveyance Allowance": "" as any,
    "Office Wear Allowance": "" as any,
    "Bonus": "" as any,
    "Leave With Wages": "" as any,
    "Other Allowances": "" as any,
    "Rate of Wages": "" as any,
    "Total Earnings (Monthly)": Math.round(totalMonthlyEarnings),
    "PF Deduction": "" as any,
    "ESIC Deduction": "" as any,
    "Society Deduction": "" as any,
    "Income Tax Deduction": "" as any,
    "Insurance Deduction": "" as any,
    "Other Recoveries": "" as any,
    "Total Deductions (Monthly)": Math.round(totalMonthlyDeductions),
    "Net Salary (Monthly)": Math.round(totalMonthlyEarnings - totalMonthlyDeductions),
    "Earned Salary (Pro-rated)": Math.round(totalEarnedSalaries),
    "Salary Loss Due to Absence": Math.round(totalMonthlyEarnings - totalEarnedSalaries),
    "Net Earned Salary": Math.round(totalEarnedSalaries - totalMonthlyDeductions),
    "Overtime Pay": totalOvertimePay,
    "Final Net Pay (Including OT & Allowances)": Math.round(totalEarnedSalaries - totalMonthlyDeductions + totalOvertimePay + totalShiftAllowance),
    "Employer PF Contribution": "" as any,
    "Employer ESIC Contribution": "" as any,
    "Phone": "",
    "Email": "",
    "Joining Date": "",
    "Date of Birth": "",
    "PAN": "",
    "Aadhaar": "",
    "UAN": "",
    "ESIC Number": "",
    "PF Opted": "",
    "ESI Applicable": "",
    "LWF State": "",
    "Bank Account": "",
    "IFSC Code": "",
    "Branch": "",
    "Last Transaction ID": "",
    "Last Payment Date": "",
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
