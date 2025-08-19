export interface Employee {
  id: string
  employeeId: string
  name: string
  email: string
  phone: string
  department: string
  designation: string
  company: string
  location: string
  grade: string
  status: "active" | "inactive"
  joiningDate: string
  dateOfBirth?: string
  basicSalary: number
  hra: number
  allowances: number
  salary: number
  pan: string
  aadhaar: string
  uan: string
  esicNumber: string
  pfOptIn: boolean
  esiApplicable: boolean
  lwfState: string
  bankAccount: string
  ifsc: string
  branch: string
  profilePic?: string
}

export interface AttendanceRecord {
  id: string
  employeeId: string
  month: string
  year: number
  presentDays: number
  totalDays: number
  overtimeHours: number
  leavesTaken: number
  shiftAllowance: number
}

export interface PayrollCalculation {
  id: string
  employeeId: string
  month: string
  year: number
  grossPay: number
  basicSalary: number
  hra: number
  allowances: number
  overtimePay: number
  pfDeduction: number
  esiDeduction: number
  taxDeduction: number
  otherDeductions: number
  netPay: number
}

export interface StatutoryReturn {
  id: string
  title: string
  type: "pf" | "esi" | "tds" | "pt"
  month: string
  year: number
  dueDate: string
  status: "pending" | "generated" | "filed" | "overdue"
  amount?: number
  employees: number
}
