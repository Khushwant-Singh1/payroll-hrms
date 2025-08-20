// Comprehensive Payroll Calculation Engine for Indian Compliance

import type { Employee, PayrollResult, PayrollDeductions, PayrollEarnings } from "../types/erp-payroll"

export interface SalaryComponents {
  basic: number
  hra: number
  conveyanceAllowance: number
  medicalAllowance: number
  specialAllowance: number
  da: number
  cityCompensatoryAllowance: number
  otherAllowances: number
}

export interface AttendanceData {
  totalDaysInMonth: number
  workingDaysInMonth: number
  actualWorkingDays: number
  presentDays: number
  absentDays: number
  lopDays: number
  paidLeaveDays: number
  weeklyOffDays: number
  holidayDays: number
  halfDays: number
  overtimeHours: number
  nightShiftDays: number
  weekendShiftDays: number
}

export interface EmployeeProfile {
  joiningDate: Date
  exitDate?: Date
  pfOptIn: boolean
  esiApplicable: boolean
  vpfPercentage: number
  workState: string
  pfUan: string
  esicNumber: string
  pan: string
  aadhaar: string
  bankAccount: string
  ifscCode: string
  isHandicapped: boolean
  age: number
  gender: "male" | "female"
}

export interface CalculationContext {
  employeeId: string
  month: string
  year: number
  financialYear: string
  processingDate: Date
}

export interface YTDData {
  grossEarnings: number
  tdsDeducted: number
}

// Validation Functions
export class PayrollValidator {
  static validatePAN(pan: string): { isValid: boolean; error?: string } {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/
    if (!panRegex.test(pan)) {
      return { isValid: false, error: "Invalid PAN format. Should be ABCDE1234F" }
    }
    return { isValid: true }
  }

  static validateIFSC(ifsc: string): { isValid: boolean; error?: string } {
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/
    if (!ifscRegex.test(ifsc)) {
      return { isValid: false, error: "Invalid IFSC format. Should be ABCD0123456" }
    }
    return { isValid: true }
  }

  static validateUAN(uan: string): { isValid: boolean; error?: string } {
    const uanRegex = /^[0-9]{12}$/
    if (!uanRegex.test(uan)) {
      return { isValid: false, error: "Invalid UAN format. Should be 12 digits" }
    }
    return { isValid: true }
  }

  static validateSalaryStructure(components: SalaryComponents, ctc: number): { isValid: boolean; error?: string } {
    const totalComponents = Object.values(components).reduce((sum, val) => sum + val, 0)
    if (Math.abs(totalComponents - ctc) > 1) {
      return { isValid: false, error: "Salary components do not match CTC" }
    }
    return { isValid: true }
  }

  static validateAttendance(attendance: AttendanceData): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (attendance.presentDays > attendance.workingDaysInMonth) {
      errors.push("Present days cannot exceed working days")
    }

    if (attendance.lopDays < 0) {
      errors.push("LOP days cannot be negative")
    }

    if (attendance.overtimeHours < 0) {
      errors.push("Overtime hours cannot be negative")
    }

    return { isValid: errors.length === 0, errors }
  }
}

// Proration Calculator
export class ProrationCalculator {
  static calculateProration(
    joiningDate: Date,
    exitDate: Date | undefined,
    month: number,
    year: number,
  ): {
    prorationFactor: number
    effectiveDays: number
    totalDays: number
  } {
    const monthStart = new Date(year, month - 1, 1)
    const monthEnd = new Date(year, month, 0)

    let effectiveStartDate = monthStart
    let effectiveEndDate = monthEnd

    // Adjust for joining mid-month
    if (joiningDate > monthStart) {
      effectiveStartDate = joiningDate
    }

    // Adjust for exit mid-month
    if (exitDate && exitDate < monthEnd) {
      effectiveEndDate = exitDate
    }

    const effectiveDays =
      Math.ceil((effectiveEndDate.getTime() - effectiveStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
    const totalDays = monthEnd.getDate()

    return {
      prorationFactor: effectiveDays / totalDays,
      effectiveDays,
      totalDays,
    }
  }
}

// Overtime Calculator
export class OvertimeCalculator {
  static calculateOvertime(
    basicSalary: number,
    overtimeHours: number,
    nightShiftDays: number,
    weekendShiftDays: number,
  ): {
    regularOT: number
    nightShiftAllowance: number
    weekendAllowance: number
    totalOTAmount: number
  } {
    const hourlyRate = (basicSalary * 12) / (26 * 8 * 12) // Annual basic / total working hours
    const regularOT = overtimeHours * hourlyRate * 2 // Double time for OT
    const nightShiftAllowance = nightShiftDays * 200 // Fixed night shift allowance
    const weekendAllowance = weekendShiftDays * 500 // Fixed weekend allowance

    return {
      regularOT,
      nightShiftAllowance,
      weekendAllowance,
      totalOTAmount: regularOT + nightShiftAllowance + weekendAllowance,
    }
  }
}

// PF Calculator
export class PFCalculator {
  static calculatePF(
    basicSalary: number,
    da: number,
    pfOptIn: boolean,
    vpfPercentage = 0,
  ): {
    pfWage: number
    employeePF: number
    employerEPF: number
    employerEPS: number
    vpfAmount: number
    adminCharges: number
    totalEmployerContribution: number
  } {
    if (!pfOptIn) {
      return {
        pfWage: 0,
        employeePF: 0,
        employerEPF: 0,
        employerEPS: 0,
        vpfAmount: 0,
        adminCharges: 0,
        totalEmployerContribution: 0,
      }
    }

    const pfWage = Math.min(basicSalary + da, 15000) // PF wage ceiling
    const employeePF = Math.round(pfWage * 0.12)
    const employerEPS = Math.round(pfWage * 0.0833) // 8.33% to EPS
    const employerEPF = Math.round(pfWage * 0.12) - employerEPS // Remaining to EPF
    const vpfAmount = vpfPercentage > 0 ? Math.round(pfWage * (vpfPercentage / 100)) : 0
    const adminCharges = Math.round(pfWage * 0.0065) // 0.65% admin charges

    return {
      pfWage,
      employeePF,
      employerEPF,
      employerEPS,
      vpfAmount,
      adminCharges,
      totalEmployerContribution: employerEPF + employerEPS + adminCharges,
    }
  }
}

// ESI Calculator
export class ESICalculator {
  static calculateESI(
    grossEarnings: number,
    esiApplicable: boolean,
  ): {
    esiWage: number
    employeeESI: number
    employerESI: number
    totalESIContribution: number
  } {
    if (!esiApplicable || grossEarnings > 21000) {
      return {
        esiWage: 0,
        employeeESI: 0,
        employerESI: 0,
        totalESIContribution: 0,
      }
    }

    const esiWage = grossEarnings
    const employeeESI = Math.round(esiWage * 0.0075) // 0.75%
    const employerESI = Math.round(esiWage * 0.0325) // 3.25%

    return {
      esiWage,
      employeeESI,
      employerESI,
      totalESIContribution: employeeESI + employerESI,
    }
  }
}

// Professional Tax Calculator
export class ProfessionalTaxCalculator {
  private static ptSlabs: Record<string, Array<{ min: number; max: number; tax: number }>> = {
    Karnataka: [
      { min: 0, max: 15000, tax: 0 },
      { min: 15001, max: 25000, tax: 150 },
      { min: 25001, max: 40000, tax: 200 },
      { min: 40001, max: Number.POSITIVE_INFINITY, tax: 200 },
    ],
    Maharashtra: [
      { min: 0, max: 5000, tax: 0 },
      { min: 5001, max: 10000, tax: 175 },
      { min: 10001, max: Number.POSITIVE_INFINITY, tax: 200 },
    ],
    "Tamil Nadu": [
      { min: 0, max: 21000, tax: 0 },
      { min: 21001, max: Number.POSITIVE_INFINITY, tax: 208.33 },
    ],
    "West Bengal": [
      { min: 0, max: 10000, tax: 0 },
      { min: 10001, max: 15000, tax: 110 },
      { min: 15001, max: 25000, tax: 130 },
      { min: 25001, max: Number.POSITIVE_INFINITY, tax: 200 },
    ],
    Gujarat: [
      { min: 0, max: 6000, tax: 0 },
      { min: 6001, max: 9000, tax: 80 },
      { min: 9001, max: 12000, tax: 150 },
      { min: 12001, max: Number.POSITIVE_INFINITY, tax: 200 },
    ],
    "Andhra Pradesh": [
      { min: 0, max: 15000, tax: 0 },
      { min: 15001, max: Number.POSITIVE_INFINITY, tax: 200 },
    ],
  }

  static calculatePT(grossEarnings: number, state: string): number {
    const slabs = this.ptSlabs[state]
    if (!slabs) return 0

    for (const slab of slabs) {
      if (grossEarnings >= slab.min && grossEarnings <= slab.max) {
        return slab.tax
      }
    }
    return 0
  }
}

// LWF Calculator
export class LWFCalculator {
  private static lwfRates: Record<string, { employee: number; employer: number; frequency: string }> = {
    Karnataka: { employee: 20, employer: 20, frequency: "monthly" },
    Maharashtra: { employee: 0.75, employer: 0.75, frequency: "monthly" },
    "Tamil Nadu": { employee: 20, employer: 20, frequency: "half-yearly" },
    "West Bengal": { employee: 6, employer: 6, frequency: "monthly" },
    Gujarat: { employee: 6, employer: 6, frequency: "monthly" },
    "Andhra Pradesh": { employee: 20, employer: 20, frequency: "half-yearly" },
  }

  static calculateLWF(state: string, month: number): { employeeLWF: number; employerLWF: number } {
    const rates = this.lwfRates[state]
    if (!rates) return { employeeLWF: 0, employerLWF: 0 }

    if (rates.frequency === "monthly") {
      return { employeeLWF: rates.employee, employerLWF: rates.employer }
    }

    // Half-yearly - deduct in specific months
    if (rates.frequency === "half-yearly" && (month === 6 || month === 12)) {
      return { employeeLWF: rates.employee, employerLWF: rates.employer }
    }

    return { employeeLWF: 0, employerLWF: 0 }
  }
}

// TDS Calculator
export class TDSCalculator {
  static calculateTDS(
    annualGross: number,
    hraReceived: number,
    rentPaid: number,
    cityType: "metro" | "non-metro",
    section80C: number,
    section80D: number,
    homeLoanInterest: number,
    previousTDSDeducted: number,
    remainingMonths: number,
  ): {
    taxableIncome: number
    annualTax: number
    monthlyTDS: number
    hraExemption: number
  } {
    // Calculate HRA exemption
    const basicAnnual = annualGross * 0.5 // Assuming basic is 50% of gross
    const hraExemption = Math.min(
      hraReceived,
      basicAnnual * (cityType === "metro" ? 0.5 : 0.4),
      Math.max(0, rentPaid - basicAnnual * 0.1),
    )

    // Calculate taxable income
    let taxableIncome = annualGross - hraExemption - 50000 // Standard deduction
    taxableIncome = Math.max(0, taxableIncome - Math.min(section80C, 150000))
    taxableIncome = Math.max(0, taxableIncome - Math.min(section80D, 25000))
    taxableIncome = Math.max(0, taxableIncome - Math.min(homeLoanInterest, 200000))

    // Calculate tax as per new regime (simplified)
    let annualTax = 0
    if (taxableIncome > 250000) {
      if (taxableIncome <= 500000) {
        annualTax = (taxableIncome - 250000) * 0.05
      } else if (taxableIncome <= 1000000) {
        annualTax = 12500 + (taxableIncome - 500000) * 0.2
      } else {
        annualTax = 112500 + (taxableIncome - 1000000) * 0.3
      }
    }

    // Add cess
    annualTax = annualTax * 1.04

    const totalTDSForYear = Math.round(annualTax)
    const remainingTDS = Math.max(0, totalTDSForYear - previousTDSDeducted)
    const monthlyTDS = remainingMonths > 0 ? Math.round(remainingTDS / remainingMonths) : 0

    return {
      taxableIncome,
      annualTax: totalTDSForYear,
      monthlyTDS,
      hraExemption,
    }
  }
}

// Main Payroll Calculator
export class ComprehensivePayrollCalculator {
  static calculatePayroll(
    salaryComponents: SalaryComponents,
    attendance: AttendanceData,
    employee: EmployeeProfile,
    context: CalculationContext,
    variablePay: any = {},
    deductions: any = {},
    taxSavings: any = {},
    ytdData: YTDData = { grossEarnings: 0, tdsDeducted: 0 },
  ) {
    // 1. Calculate Proration
    const proration = ProrationCalculator.calculateProration(
      employee.joiningDate,
      employee.exitDate,
      Number.parseInt(context.month),
      context.year,
    )

    // 2. Calculate prorated salary components
    const proratedBasic = salaryComponents.basic * proration.prorationFactor
    const proratedHRA = salaryComponents.hra * proration.prorationFactor
    const proratedAllowances =
      (salaryComponents.conveyanceAllowance +
        salaryComponents.medicalAllowance +
        salaryComponents.specialAllowance +
        salaryComponents.cityCompensatoryAllowance +
        salaryComponents.otherAllowances) *
      proration.prorationFactor

    // 3. Calculate LOP deduction
    const lopDeduction =
      attendance.lopDays > 0
        ? ((salaryComponents.basic + salaryComponents.hra + salaryComponents.conveyanceAllowance) /
            attendance.totalDaysInMonth) *
          attendance.lopDays
        : 0

    // 4. Calculate overtime
    const overtime = OvertimeCalculator.calculateOvertime(
      salaryComponents.basic,
      attendance.overtimeHours,
      attendance.nightShiftDays,
      attendance.weekendShiftDays,
    )

    // 5. Calculate gross earnings
    const grossEarnings =
      proratedBasic +
      proratedHRA +
      proratedAllowances +
      salaryComponents.da +
      overtime.totalOTAmount +
      (variablePay.bonus || 0) +
      (variablePay.incentives || 0) +
      (variablePay.arrears || 0) +
      (variablePay.reimbursements || 0) -
      lopDeduction

    // 6. Calculate statutory deductions
    const pf = PFCalculator.calculatePF(proratedBasic, salaryComponents.da, employee.pfOptIn, employee.vpfPercentage)
    const esi = ESICalculator.calculateESI(grossEarnings, employee.esiApplicable)
    const pt = ProfessionalTaxCalculator.calculatePT(grossEarnings, employee.workState)
    const lwf = LWFCalculator.calculateLWF(employee.workState, Number.parseInt(context.month))

    // 7. Calculate TDS
    const annualGross = grossEarnings * 12
    const remainingMonths = 12 - Number.parseInt(context.month) + 1
    const tds = TDSCalculator.calculateTDS(
      annualGross,
      salaryComponents.hra * 12,
      taxSavings.rentPaid || 0,
      taxSavings.cityType || "metro",
      taxSavings.section80C || 0,
      taxSavings.section80D || 0,
      taxSavings.homeLoanInterest || 0,
      ytdData.tdsDeducted,
      remainingMonths,
    )

    // 8. Calculate non-statutory deductions
    const nonStatutoryDeductions = {
      loanEMI: deductions.loanEMI || 0,
      advanceRecovery: deductions.advanceRecovery || 0,
      insurancePremium: deductions.insurancePremium || 0,
      canteenDeduction: deductions.canteenDeduction || 0,
      otherDeductions: deductions.otherDeductions || 0,
    }

    const totalNonStatutoryDeductions = Object.values(nonStatutoryDeductions).reduce(
      (sum: number, val: any) => sum + val,
      0,
    )

    // 9. Calculate totals
    const totalStatutoryDeductions = pf.employeePF + esi.employeeESI + pt + lwf.employeeLWF + tds.monthlyTDS
    const totalDeductions = totalStatutoryDeductions + totalNonStatutoryDeductions
    const netPay = Math.round(grossEarnings - totalDeductions)

    // 10. Validation
    const validation = {
      isValid: netPay > 0 && grossEarnings > 0,
      errors: netPay <= 0 ? ["Net pay is zero or negative"] : [],
      warnings: grossEarnings < 10000 ? ["Low gross earnings"] : [],
    }

    return {
      employeeId: context.employeeId,
      month: context.month,
      year: context.year,
      proration: {
        prorationFactor: proration.prorationFactor,
        effectiveDays: proration.effectiveDays,
        totalDays: proration.totalDays,
        adjustedBasic: proratedBasic,
      },
      earnings: {
        basic: proratedBasic,
        hra: proratedHRA,
        allowances: proratedAllowances,
        da: salaryComponents.da,
        overtime: overtime.totalOTAmount,
        bonus: variablePay.bonus || 0,
        incentives: variablePay.incentives || 0,
        arrears: variablePay.arrears || 0,
        reimbursements: variablePay.reimbursements || 0,
        lopDeduction,
      },
      grossEarnings,
      statutoryDeductions: {
        pf: pf.employeePF,
        esi: esi.employeeESI,
        pt,
        lwf: lwf.employeeLWF,
        tds: tds.monthlyTDS,
      },
      nonStatutoryDeductions,
      totalDeductions,
      netPay,
      detailedCalculations: {
        pf,
        esi,
        tds,
        lwf,
        overtime,
      },
      validation,
      summary: {
        grossEarnings,
        totalDeductions,
        netPay,
      },
    }
  }
}

// Simple calculation function for basic payroll
export function calculateCompletePayroll(employee: any, attendance: any, deductions: any, month: number, year: number) {
  const salaryComponents: SalaryComponents = {
    basic: employee.basicSalary,
    hra: employee.hra,
    conveyanceAllowance: employee.allowances * 0.3,
    medicalAllowance: employee.allowances * 0.2,
    specialAllowance: employee.allowances * 0.5,
    da: 0,
    cityCompensatoryAllowance: 0,
    otherAllowances: 0,
  }

  const employeeProfile: EmployeeProfile = {
    joiningDate: new Date(employee.joiningDate),
    pfOptIn: employee.pfOptIn,
    esiApplicable: employee.esiApplicable,
    vpfPercentage: 0,
    workState: employee.lwfState || "Karnataka",
    pfUan: employee.uan,
    esicNumber: employee.esicNumber,
    pan: employee.pan,
    aadhaar: employee.aadhaar,
    bankAccount: employee.bankAccount,
    ifscCode: employee.ifsc,
    isHandicapped: false,
    age: 30,
    gender: "male",
  }

  const context: CalculationContext = {
    employeeId: employee.id,
    month: month.toString(),
    year,
    financialYear: `${year}-${year + 1}`,
    processingDate: new Date(),
  }

  return ComprehensivePayrollCalculator.calculatePayroll(
    salaryComponents,
    attendance,
    employeeProfile,
    context,
    {},
    deductions,
    {},
  )
}
}

// Payroll Engine
export class PayrollEngine {
  // Tax slabs for FY 2024-25 (New Tax Regime)
  static readonly TAX_SLABS = [
    { min: 0, max: 300000, rate: 0 },
    { min: 300000, max: 700000, rate: 0.05 },
    { min: 700000, max: 1000000, rate: 0.1 },
    { min: 1000000, max: 1200000, rate: 0.15 },
    { min: 1200000, max: 1500000, rate: 0.2 },
    { min: 1500000, max: Number.POSITIVE_INFINITY, rate: 0.3 },
  ]

  // Professional Tax slabs (Maharashtra)
  static readonly PT_SLABS = [
    { min: 0, max: 21000, amount: 0 },
    { min: 21000, max: Number.POSITIVE_INFINITY, amount: 200 },
  ]

  // State-wise LWF rates
  static readonly LWF_RATES = {
    Maharashtra: { employee: 0.75, employer: 1.5 },
    Karnataka: { employee: 1, employer: 2 },
    "Andhra Pradesh": { employee: 1, employer: 2 },
    Default: { employee: 0, employer: 0 },
  }

  static validateEmployee(employee: Employee): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!employee.name?.trim()) errors.push("Employee name is required")
    if (!employee.employeeId?.trim()) errors.push("Employee ID is required")
    if (!employee.basicSalary || employee.basicSalary <= 0) errors.push("Valid basic salary is required")
    if (!employee.presentDays || employee.presentDays < 0) errors.push("Present days must be valid")
    if (!employee.workingDays || employee.workingDays <= 0) errors.push("Working days must be valid")
    if (employee.presentDays > employee.workingDays) errors.push("Present days cannot exceed working days")

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  static calculateProration(employee: Employee): number {
    const workingDays = employee.workingDays || 30
    const presentDays = employee.presentDays || workingDays
    return presentDays / workingDays
  }

  static calculateEarnings(employee: Employee): PayrollEarnings {
    const prorationFactor = this.calculateProration(employee)
    const basicSalary = employee.basicSalary || 0

    // Standard component calculations
    const basic = Math.round(basicSalary * prorationFactor)
    const hra = Math.round(basic * 0.4) // 40% of basic
    const conveyance = Math.min(1600, Math.round(basicSalary * 0.1 * prorationFactor)) // Max 1600 or 10%
    const medical = Math.min(1250, Math.round(basicSalary * 0.05 * prorationFactor)) // Max 1250 or 5%

    // Special allowance to make up the total
    const fixedComponents = basic + hra + conveyance + medical
    const totalSalary = Math.round(employee.basicSalary * prorationFactor)
    const special = Math.max(0, totalSalary - fixedComponents)

    // Overtime calculation
    const overtimeHours = employee.overtimeHours || 0
    const overtimeRate = (basicSalary / (employee.workingDays || 30) / 8) * 2 // Double rate
    const overtime = Math.round(overtimeHours * overtimeRate)

    return {
      basic,
      hra,
      conveyance,
      medical,
      special,
      overtime,
      bonus: employee.bonus || 0,
      other: employee.otherEarnings || 0,
    }
  }

  static calculatePF(grossPay: number, employee: Employee): number {
    if (!employee.pfApplicable) return 0

    const pfWages = Math.min(grossPay, 15000) // PF ceiling
    return Math.round(pfWages * 0.12) // 12% employee contribution
  }

  static calculateESI(grossPay: number, employee: Employee): number {
    if (!employee.esiApplicable || grossPay > 25000) return 0 // ESI ceiling

    return Math.round(grossPay * 0.0175) // 1.75% employee contribution
  }

  static calculateProfessionalTax(grossPay: number, state = "Maharashtra"): number {
    // Monthly PT calculation
    for (const slab of this.PT_SLABS) {
      if (grossPay >= slab.min && grossPay < slab.max) {
        return slab.amount
      }
    }
    return 0
  }

  static calculateLWF(employee: Employee): number {
    const state = employee.state || "Default"
    const rates = this.LWF_RATES[state as keyof typeof this.LWF_RATES] || this.LWF_RATES.Default
    return rates.employee
  }

  static calculateTDS(grossPay: number, employee: Employee): number {
    if (!employee.pan) return 0 // No PAN, no TDS calculation

    const annualSalary = grossPay * 12
    let tax = 0

    // Calculate tax based on slabs
    for (const slab of this.TAX_SLABS) {
      if (annualSalary > slab.min) {
        const taxableAmount = Math.min(annualSalary, slab.max) - slab.min
        tax += taxableAmount * slab.rate
      }
    }

    // Add cess (4% on tax)
    tax = tax * 1.04

    // Monthly TDS
    const monthlyTDS = Math.round(tax / 12)

    // Apply standard deduction and exemptions
    const standardDeduction = 50000 // Annual
    const adjustedTDS = Math.max(0, monthlyTDS - standardDeduction / 12)

    return Math.round(adjustedTDS)
  }

  static calculateDeductions(grossPay: number, employee: Employee): PayrollDeductions {
    const pf = this.calculatePF(grossPay, employee)
    const esi = this.calculateESI(grossPay, employee)
    const professionalTax = this.calculateProfessionalTax(grossPay, employee.state)
    const lwf = this.calculateLWF(employee)
    const tds = this.calculateTDS(grossPay, employee)
    const other = employee.otherDeductions || 0

    return {
      pf,
      esi,
      professionalTax,
      lwf,
      tds,
      advance: employee.advance || 0,
      loan: employee.loan || 0,
      other,
    }
  }

  static calculatePayroll(employee: Employee): PayrollResult {
    // Validate employee data
    const validation = this.validateEmployee(employee)
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(", ")}`)
    }

    // Calculate earnings
    const earnings = this.calculateEarnings(employee)
    const grossPay = Object.values(earnings).reduce((sum, value) => sum + value, 0)

    // Calculate deductions
    const deductions = this.calculateDeductions(grossPay, employee)
    const totalDeductions = Object.values(deductions).reduce((sum, value) => sum + value, 0)

    // Calculate net pay
    const netPay = grossPay - totalDeductions

    return {
      employee,
      earnings,
      deductions,
      grossPay,
      totalDeductions,
      netPay,
      calculatedAt: new Date().toISOString(),
    }
  }

  static calculateEmployerContributions(payrollResult: PayrollResult) {
    const { grossPay, employee } = payrollResult

    return {
      pf: employee.pfApplicable ? Math.round(Math.min(grossPay, 15000) * 0.12) : 0, // 12% employer
      esi: employee.esiApplicable && grossPay <= 25000 ? Math.round(grossPay * 0.0325) : 0, // 3.25% employer
      lwf: this.LWF_RATES[employee.state as keyof typeof this.LWF_RATES]?.employer || 0,
    }
  }

  static generatePayrollSummary(results: PayrollResult[]) {
    const summary = {
      totalEmployees: results.length,
      totalGrossPay: results.reduce((sum, r) => sum + r.grossPay, 0),
      totalDeductions: results.reduce((sum, r) => sum + r.totalDeductions, 0),
      totalNetPay: results.reduce((sum, r) => sum + r.netPay, 0),
      statutoryBreakdown: {
        totalPF: results.reduce((sum, r) => sum + r.deductions.pf, 0),
        totalESI: results.reduce((sum, r) => sum + r.deductions.esi, 0),
        totalPT: results.reduce((sum, r) => sum + r.deductions.professionalTax, 0),
        totalTDS: results.reduce((sum, r) => sum + r.deductions.tds, 0),
        totalLWF: results.reduce((sum, r) => sum + r.deductions.lwf, 0),
      },
      employerContributions: results.reduce(
        (acc, result) => {
          const contrib = this.calculateEmployerContributions(result)
          return {
            pf: acc.pf + contrib.pf,
            esi: acc.esi + contrib.esi,
            lwf: acc.lwf + contrib.lwf,
          }
        },
        { pf: 0, esi: 0, lwf: 0 },
      ),
    }

    return summary
  }
}
