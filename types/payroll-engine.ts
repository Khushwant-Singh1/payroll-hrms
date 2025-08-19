export interface PayrollInput {
  employeeId: string
  month: string
  year: number
  // Employee Master Data
  employee: {
    id: string
    name: string
    employeeId: string
    pan: string
    aadhaar: string
    uan: string
    esicNumber: string
    bankAccount: string
    ifsc: string
    joiningDate: string
    exitDate?: string
    workState: string
    pfOptIn: boolean
    esiApplicable: boolean
  }
  // Salary Structure
  salaryStructure: {
    basic: number
    hra: number
    allowances: number
    da: number // Dearness Allowance
    ctc: number
  }
  // Attendance & Leave
  attendance: {
    totalDays: number
    workingDays: number
    presentDays: number
    lopDays: number
    overtimeHours: number
    nightShiftDays: number
    weekendShiftDays: number
  }
  // Variable Pay
  variablePay: {
    bonus: number
    incentives: number
    arrears: number
    reimbursements: number
  }
  // Deductions
  deductions: {
    loanEmi: number
    advanceRecovery: number
    insurancePremium: number
    canteenDeduction: number
    otherDeductions: number
  }
}

export interface PayrollOutput {
  employeeId: string
  month: string
  year: number
  processedAt: string
  processedBy: string

  // Earnings
  earnings: {
    basic: number
    hra: number
    allowances: number
    da: number
    overtime: number
    nightShiftAllowance: number
    weekendAllowance: number
    bonus: number
    incentives: number
    arrears: number
    reimbursements: number
    grossEarnings: number
    lopDeduction: number
    netGrossEarnings: number
  }

  // Statutory Deductions
  statutoryDeductions: {
    pfEmployee: number
    pfEmployer: number
    esiEmployee: number
    esiEmployer: number
    professionalTax: number
    lwf: number
    tds: number
  }

  // Non-Statutory Deductions
  nonStatutoryDeductions: {
    loanEmi: number
    advanceRecovery: number
    insurancePremium: number
    canteenDeduction: number
    otherDeductions: number
    totalNonStatutory: number
  }

  // Final Calculation
  totalDeductions: number
  netPay: number

  // Year to Date
  ytd: {
    grossEarnings: number
    totalDeductions: number
    netPay: number
    tdsDeducted: number
  }

  // Validation Status
  validation: {
    isValid: boolean
    errors: string[]
    warnings: string[]
  }
}

export interface PayrollRules {
  pfRates: {
    employeeRate: number
    employerRate: number
    maxBasicForPf: number
    epsRate: number
  }
  esiRates: {
    employeeRate: number
    employerRate: number
    maxGrossForEsi: number
  }
  professionalTax: {
    [state: string]: Array<{
      minSlab: number
      maxSlab: number
      tax: number
    }>
  }
  lwfRates: {
    [state: string]: {
      employee: number
      employer: number
      frequency: "monthly" | "half-yearly" | "yearly"
    }
  }
  tdsRates: {
    standardDeduction: number
    slabs: Array<{
      minIncome: number
      maxIncome: number
      rate: number
    }>
  }
  overtimeRates: {
    normalRate: number
    nightShiftRate: number
    weekendRate: number
  }
}

export interface BankTransferRecord {
  employeeId: string
  employeeName: string
  accountNumber: string
  ifscCode: string
  amount: number
  narration: string
}

export interface StatutoryFile {
  type: "pf-ecr" | "esi-return" | "pt-challan" | "lwf-return" | "tds-24q"
  month: string
  year: number
  data: any
  generatedAt: string
}
