import type {
  PayrollInput,
  PayrollOutput,
  PayrollRules,
  BankTransferRecord,
  StatutoryFile,
} from "../types/payroll-engine"

// Default payroll rules (can be configured)
const DEFAULT_PAYROLL_RULES: PayrollRules = {
  pfRates: {
    employeeRate: 0.12,
    employerRate: 0.12,
    maxBasicForPf: 15000,
    epsRate: 0.0833,
  },
  esiRates: {
    employeeRate: 0.0075,
    employerRate: 0.0325,
    maxGrossForEsi: 21000,
  },
  professionalTax: {
    Karnataka: [
      { minSlab: 0, maxSlab: 15000, tax: 0 },
      { minSlab: 15001, maxSlab: 25000, tax: 150 },
      { minSlab: 25001, maxSlab: 40000, tax: 200 },
      { minSlab: 40001, maxSlab: Number.POSITIVE_INFINITY, tax: 200 },
    ],
    Maharashtra: [
      { minSlab: 0, maxSlab: 5000, tax: 0 },
      { minSlab: 5001, maxSlab: 10000, tax: 175 },
      { minSlab: 10001, maxSlab: Number.POSITIVE_INFINITY, tax: 200 },
    ],
    "Tamil Nadu": [
      { minSlab: 0, maxSlab: 21000, tax: 0 },
      { minSlab: 21001, maxSlab: Number.POSITIVE_INFINITY, tax: 208.33 },
    ],
  },
  lwfRates: {
    Karnataka: { employee: 20, employer: 20, frequency: "monthly" },
    Maharashtra: { employee: 0.75, employer: 0.75, frequency: "monthly" },
    "Tamil Nadu": { employee: 20, employer: 20, frequency: "half-yearly" },
  },
  tdsRates: {
    standardDeduction: 50000,
    slabs: [
      { minIncome: 0, maxIncome: 250000, rate: 0 },
      { minIncome: 250001, maxIncome: 500000, rate: 0.05 },
      { minIncome: 500001, maxIncome: 1000000, rate: 0.2 },
      { minIncome: 1000001, maxIncome: Number.POSITIVE_INFINITY, rate: 0.3 },
    ],
  },
  overtimeRates: {
    normalRate: 500,
    nightShiftRate: 1000,
    weekendRate: 1500,
  },
}

export class PayrollEngine {
  private rules: PayrollRules
  private auditLog: Array<{ timestamp: string; action: string; data: any }> = []

  constructor(customRules?: Partial<PayrollRules>) {
    this.rules = { ...DEFAULT_PAYROLL_RULES, ...customRules }
  }

  // 1️⃣ Input Validation
  private validateInput(input: PayrollInput): { isValid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = []
    const warnings: string[] = []

    // Mandatory field validation
    if (!input.employee.name) errors.push("Employee name is required")
    if (!input.employee.employeeId) errors.push("Employee ID is required")
    if (!input.employee.pan || !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(input.employee.pan)) {
      errors.push("Valid PAN number is required")
    }
    if (!input.employee.bankAccount) errors.push("Bank account number is required")
    if (!input.employee.ifsc || !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(input.employee.ifsc)) {
      errors.push("Valid IFSC code is required")
    }

    // Salary structure validation
    const totalComponents =
      input.salaryStructure.basic +
      input.salaryStructure.hra +
      input.salaryStructure.allowances +
      input.salaryStructure.da
    if (Math.abs(totalComponents - input.salaryStructure.ctc) > 1) {
      warnings.push("Salary components do not match CTC")
    }

    // Attendance validation
    if (input.attendance.presentDays > input.attendance.workingDays) {
      errors.push("Present days cannot exceed working days")
    }
    if (input.attendance.lopDays < 0) {
      errors.push("LOP days cannot be negative")
    }

    // PF validation
    if (input.employee.pfOptIn && !input.employee.uan) {
      warnings.push("UAN number missing for PF opted employee")
    }

    // ESI validation
    if (input.employee.esiApplicable && !input.employee.esicNumber) {
      warnings.push("ESIC number missing for ESI applicable employee")
    }

    return { isValid: errors.length === 0, errors, warnings }
  }

  // 2️⃣ Pre-Processing Adjustments
  private calculateProration(input: PayrollInput): number {
    const joiningDate = new Date(input.employee.joiningDate)
    const exitDate = input.employee.exitDate ? new Date(input.employee.exitDate) : null
    const monthStart = new Date(input.year, new Date(`${input.month} 1, ${input.year}`).getMonth(), 1)
    const monthEnd = new Date(input.year, new Date(`${input.month} 1, ${input.year}`).getMonth() + 1, 0)

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
    const totalDaysInMonth = monthEnd.getDate()

    return effectiveDays / totalDaysInMonth
  }

  private calculateLOP(input: PayrollInput): number {
    const { basic, hra, allowances, da } = input.salaryStructure
    const monthlyGross = basic + hra + allowances + da
    const totalDaysInMonth = input.attendance.totalDays
    const lopDays = input.attendance.lopDays

    return (monthlyGross / totalDaysInMonth) * lopDays
  }

  private calculateOvertime(input: PayrollInput): {
    normalOvertime: number
    nightShiftAllowance: number
    weekendAllowance: number
  } {
    const { overtimeHours, nightShiftDays, weekendShiftDays } = input.attendance
    const { normalRate, nightShiftRate, weekendRate } = this.rules.overtimeRates

    return {
      normalOvertime: overtimeHours * normalRate,
      nightShiftAllowance: nightShiftDays * nightShiftRate,
      weekendAllowance: weekendShiftDays * weekendRate,
    }
  }

  // 3️⃣ Earnings Calculation
  private calculateEarnings(input: PayrollInput): PayrollOutput["earnings"] {
    const prorationFactor = this.calculateProration(input)
    const lopAmount = this.calculateLOP(input)
    const overtime = this.calculateOvertime(input)

    // Base salary components (prorated)
    const basic = input.salaryStructure.basic * prorationFactor
    const hra = input.salaryStructure.hra * prorationFactor
    const allowances = input.salaryStructure.allowances * prorationFactor
    const da = input.salaryStructure.da * prorationFactor

    // Variable components
    const { bonus, incentives, arrears, reimbursements } = input.variablePay

    const grossEarnings =
      basic +
      hra +
      allowances +
      da +
      overtime.normalOvertime +
      overtime.nightShiftAllowance +
      overtime.weekendAllowance +
      bonus +
      incentives +
      arrears +
      reimbursements

    const netGrossEarnings = grossEarnings - lopAmount

    return {
      basic,
      hra,
      allowances,
      da,
      overtime: overtime.normalOvertime,
      nightShiftAllowance: overtime.nightShiftAllowance,
      weekendAllowance: overtime.weekendAllowance,
      bonus,
      incentives,
      arrears,
      reimbursements,
      grossEarnings,
      lopDeduction: lopAmount,
      netGrossEarnings,
    }
  }

  // 4️⃣ Statutory Deductions
  private calculatePF(basicSalary: number, pfOptIn: boolean): { employee: number; employer: number } {
    if (!pfOptIn) return { employee: 0, employer: 0 }

    const pfBasic = Math.min(basicSalary, this.rules.pfRates.maxBasicForPf)
    const employeePF = pfBasic * this.rules.pfRates.employeeRate
    const employerPF = pfBasic * this.rules.pfRates.employerRate

    return {
      employee: Math.round(employeePF),
      employer: Math.round(employerPF),
    }
  }

  private calculateESI(grossEarnings: number, esiApplicable: boolean): { employee: number; employer: number } {
    if (!esiApplicable || grossEarnings > this.rules.esiRates.maxGrossForEsi) {
      return { employee: 0, employer: 0 }
    }

    const employeeESI = grossEarnings * this.rules.esiRates.employeeRate
    const employerESI = grossEarnings * this.rules.esiRates.employerRate

    return {
      employee: Math.round(employeeESI),
      employer: Math.round(employerESI),
    }
  }

  private calculateProfessionalTax(grossEarnings: number, workState: string): number {
    const statePTRules = this.rules.professionalTax[workState]
    if (!statePTRules) return 0

    for (const slab of statePTRules) {
      if (grossEarnings >= slab.minSlab && grossEarnings <= slab.maxSlab) {
        return slab.tax
      }
    }
    return 0
  }

  private calculateLWF(workState: string): number {
    const stateLWFRules = this.rules.lwfRates[workState]
    if (!stateLWFRules) return 0

    // For monthly frequency, return the monthly amount
    if (stateLWFRules.frequency === "monthly") {
      return stateLWFRules.employee
    }

    // For half-yearly, return 1/6th of annual amount
    if (stateLWFRules.frequency === "half-yearly") {
      return stateLWFRules.employee / 6
    }

    // For yearly, return 1/12th of annual amount
    return stateLWFRules.employee / 12
  }

  private calculateTDS(annualGross: number, previousTDSDeducted: number, remainingMonths: number): number {
    const taxableIncome = Math.max(0, annualGross - this.rules.tdsRates.standardDeduction)
    let annualTax = 0

    for (const slab of this.rules.tdsRates.slabs) {
      if (taxableIncome > slab.minIncome) {
        const taxableAtThisSlab = Math.min(taxableIncome, slab.maxIncome) - slab.minIncome
        annualTax += taxableAtThisSlab * slab.rate
      }
    }

    const totalTDSForYear = Math.round(annualTax)
    const remainingTDS = Math.max(0, totalTDSForYear - previousTDSDeducted)

    return remainingMonths > 0 ? Math.round(remainingTDS / remainingMonths) : 0
  }

  // 5️⃣ Process Single Employee Payroll
  public processPayroll(input: PayrollInput, ytdData?: any): PayrollOutput {
    const startTime = Date.now()

    // Validate input
    const validation = this.validateInput(input)

    if (!validation.isValid) {
      return {
        employeeId: input.employeeId,
        month: input.month,
        year: input.year,
        processedAt: new Date().toISOString(),
        processedBy: "system",
        earnings: {} as any,
        statutoryDeductions: {} as any,
        nonStatutoryDeductions: {} as any,
        totalDeductions: 0,
        netPay: 0,
        ytd: {} as any,
        validation,
      }
    }

    // Calculate earnings
    const earnings = this.calculateEarnings(input)

    // Calculate statutory deductions
    const pf = this.calculatePF(earnings.basic, input.employee.pfOptIn)
    const esi = this.calculateESI(earnings.netGrossEarnings, input.employee.esiApplicable)
    const professionalTax = this.calculateProfessionalTax(earnings.netGrossEarnings, input.employee.workState)
    const lwf = this.calculateLWF(input.employee.workState)

    // Calculate TDS (requires annual projection)
    const monthsInYear = 12
    const currentMonth = new Date(`${input.month} 1, ${input.year}`).getMonth() + 1
    const remainingMonths = monthsInYear - currentMonth + 1
    const projectedAnnualGross = earnings.netGrossEarnings * monthsInYear
    const previousTDSDeducted = ytdData?.tdsDeducted || 0
    const tds = this.calculateTDS(projectedAnnualGross, previousTDSDeducted, remainingMonths)

    const statutoryDeductions = {
      pfEmployee: pf.employee,
      pfEmployer: pf.employer,
      esiEmployee: esi.employee,
      esiEmployer: esi.employer,
      professionalTax,
      lwf,
      tds,
    }

    // Non-statutory deductions
    const nonStatutoryDeductions = {
      loanEmi: input.deductions.loanEmi,
      advanceRecovery: input.deductions.advanceRecovery,
      insurancePremium: input.deductions.insurancePremium,
      canteenDeduction: input.deductions.canteenDeduction,
      otherDeductions: input.deductions.otherDeductions,
      totalNonStatutory: Object.values(input.deductions).reduce((sum, val) => sum + val, 0),
    }

    // Calculate totals
    const totalStatutoryDeductions =
      statutoryDeductions.pfEmployee +
      statutoryDeductions.esiEmployee +
      statutoryDeductions.professionalTax +
      statutoryDeductions.lwf +
      statutoryDeductions.tds
    const totalDeductions = totalStatutoryDeductions + nonStatutoryDeductions.totalNonStatutory
    const netPay = earnings.netGrossEarnings - totalDeductions

    // Update YTD
    const ytd = {
      grossEarnings: (ytdData?.grossEarnings || 0) + earnings.netGrossEarnings,
      totalDeductions: (ytdData?.totalDeductions || 0) + totalDeductions,
      netPay: (ytdData?.netPay || 0) + netPay,
      tdsDeducted: (ytdData?.tdsDeducted || 0) + tds,
    }

    const result: PayrollOutput = {
      employeeId: input.employeeId,
      month: input.month,
      year: input.year,
      processedAt: new Date().toISOString(),
      processedBy: "system",
      earnings,
      statutoryDeductions,
      nonStatutoryDeductions,
      totalDeductions,
      netPay: Math.round(netPay),
      ytd,
      validation,
    }

    // Audit log
    this.auditLog.push({
      timestamp: new Date().toISOString(),
      action: "PAYROLL_PROCESSED",
      data: {
        employeeId: input.employeeId,
        month: input.month,
        year: input.year,
        processingTime: Date.now() - startTime,
        netPay: result.netPay,
      },
    })

    return result
  }

  // 6️⃣ Generate Bank Transfer File
  public generateBankTransferFile(payrollOutputs: PayrollOutput[]): BankTransferRecord[] {
    return payrollOutputs
      .filter((output) => output.validation.isValid && output.netPay > 0)
      .map((output) => ({
        employeeId: output.employeeId,
        employeeName: "", // Would be populated from employee master
        accountNumber: "", // Would be populated from employee master
        ifscCode: "", // Would be populated from employee master
        amount: output.netPay,
        narration: `Salary for ${output.month} ${output.year}`,
      }))
  }

  // 7️⃣ Generate Statutory Files
  public generatePFECR(payrollOutputs: PayrollOutput[], establishmentCode: string): StatutoryFile {
    const pfData = payrollOutputs
      .filter((output) => output.statutoryDeductions.pfEmployee > 0)
      .map((output) => ({
        employeeId: output.employeeId,
        uan: "", // Would be populated from employee master
        name: "", // Would be populated from employee master
        grossWages: output.earnings.netGrossEarnings,
        pfWages: Math.min(output.earnings.basic, this.rules.pfRates.maxBasicForPf),
        pfContribution: output.statutoryDeductions.pfEmployee,
        epsContribution: Math.round(output.earnings.basic * this.rules.pfRates.epsRate),
        fpfContribution: 0,
      }))

    return {
      type: "pf-ecr",
      month: payrollOutputs[0]?.month || "",
      year: payrollOutputs[0]?.year || 0,
      data: {
        establishmentCode,
        totalEmployees: pfData.length,
        totalPFWages: pfData.reduce((sum, emp) => sum + emp.pfWages, 0),
        totalPFContribution: pfData.reduce((sum, emp) => sum + emp.pfContribution, 0),
        employees: pfData,
      },
      generatedAt: new Date().toISOString(),
    }
  }

  public generateESIReturn(payrollOutputs: PayrollOutput[], establishmentCode: string): StatutoryFile {
    const esiData = payrollOutputs
      .filter((output) => output.statutoryDeductions.esiEmployee > 0)
      .map((output) => ({
        employeeId: output.employeeId,
        esicNumber: "", // Would be populated from employee master
        name: "", // Would be populated from employee master
        grossWages: output.earnings.netGrossEarnings,
        esiWages: output.earnings.netGrossEarnings,
        employeeContribution: output.statutoryDeductions.esiEmployee,
        employerContribution: output.statutoryDeductions.esiEmployer,
      }))

    return {
      type: "esi-return",
      month: payrollOutputs[0]?.month || "",
      year: payrollOutputs[0]?.year || 0,
      data: {
        establishmentCode,
        totalEmployees: esiData.length,
        totalESIWages: esiData.reduce((sum, emp) => sum + emp.esiWages, 0),
        totalEmployeeContribution: esiData.reduce((sum, emp) => sum + emp.employeeContribution, 0),
        totalEmployerContribution: esiData.reduce((sum, emp) => sum + emp.employerContribution, 0),
        employees: esiData,
      },
      generatedAt: new Date().toISOString(),
    }
  }

  // 8️⃣ Audit & Logging
  public getAuditLog(): Array<{ timestamp: string; action: string; data: any }> {
    return [...this.auditLog]
  }

  public lockPayroll(month: string, year: number, lockedBy: string): void {
    this.auditLog.push({
      timestamp: new Date().toISOString(),
      action: "PAYROLL_LOCKED",
      data: { month, year, lockedBy },
    })
  }

  // Utility Methods
  public validatePAN(pan: string): boolean {
    return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan)
  }

  public validateIFSC(ifsc: string): boolean {
    return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc)
  }

  public validateUAN(uan: string): boolean {
    return /^[0-9]{12}$/.test(uan)
  }

  public formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount)
  }
}

// Export singleton instance
export const payrollEngine = new PayrollEngine()
