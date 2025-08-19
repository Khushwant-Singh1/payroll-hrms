export interface Employee {
  id: string
  employeeId: string
  name: string
  fatherName: string
  aadhaar: string
  pan: string
  uan: string
  esicNumber: string
  phoneNo: string
  dob: string
  joiningDate: string
  company: string
  designation: string
  profilePic?: string
  salary: number
  reportingManager: string
  location: string
  grade: string
  basicSalary: number
  hra: number
  allowances: number
  benefits: number
  bankAccount: string
  ifsc: string
  branch: string
  permanentAddress: string
  currentAddress: string
  pfOptIn: boolean
  esiApplicable: boolean
  lwfState: string
  status: "active" | "inactive" | "terminated"
}

export interface AttendanceRecord {
  employeeId: string
  month: string
  year: number
  workingDays: number
  presentDays: number
  absentDays: number
  halfDays: number
  paidLeave: number
  unpaidLeave: number
  sickLeave: number
  overtimeHours: number
  nightShiftDays: number
  hazardPay: number
}

export interface PayrollCalculation {
  employeeId: string
  month: string
  year: number
  grossEarnings: number
  basicSalary: number
  hra: number
  allowances: number
  variablePay: number
  overtimePay: number
  shiftAllowance: number
  pfEmployee: number
  pfEmployer: number
  esiEmployee: number
  esiEmployer: number
  professionalTax: number
  lwf: number
  incomeTax: number
  loanDeductions: number
  otherDeductions: number
  netSalary: number
}

export interface StatutoryReturn {
  id: string
  type: "pf-ecr" | "esi-challan" | "pt-return" | "lwf-payment" | "form-24q" | "form-16"
  title: string
  month: string
  year: number
  dueDate: string
  status: "pending" | "generated" | "filed" | "overdue"
  amount?: number
  employees: number
}

export interface WorkflowStep {
  id: string
  title: string
  description: string
  status: "pending" | "in-progress" | "completed" | "error"
  completedAt?: string
  assignedTo?: string
  dependencies?: string[]
}

export interface PayrollCycle {
  id: string
  month: string
  year: number
  status: "draft" | "processing" | "review" | "approved" | "paid" | "closed"
  steps: WorkflowStep[]
  totalEmployees: number
  totalGross: number
  totalNet: number
  createdAt: string
  approvedBy?: string
  approvedAt?: string
}

export interface AttendanceInput {
  employeeId: string
  month: string
  year: number
  workingDays: number
  presentDays: number
  absentDays: number
  halfDays: number
  paidLeave: number
  unpaidLeave: number
  sickLeave: number
  overtimeHours: number
  nightShiftDays: number
  hazardPay: number
}

export interface DeductionInput {
  employeeId: string
  month: string
  year: number
  loanDeduction: number
  advanceDeduction: number
  otherDeductions: number
  description?: string
}

export interface SalaryCalculation {
  employeeId: string
  totalWorkingDays: number
  actualWorkingDays: number
  perDayBasicSalary: number
  perDayGrossSalary: number
  calculatedBasicSalary: number
  calculatedGrossSalary: number
  lopDays: number
  lopAmount: number
}
