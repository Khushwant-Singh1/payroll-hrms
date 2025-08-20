// Excel file generation utilities
export class ExcelGenerator {
  static generateCSVWithBOM(data: any[], filename: string) {
    if (!data || data.length === 0) {
      return
    }

    const headers = Object.keys(data[0])
    let csvContent = headers.join(",") + "
"

    data.forEach((row) => {
      const values = headers.map((header) => {
        const value = row[header]
        if (typeof value === 'string') {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value
      })
      csvContent += values.join(",") + "
"
    })

    const BOM = "\uFEFF"
    const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `${filename}.csv`
    link.click()
  }

  static generateBankFile(payrollResults: any[]) {
    const bankData = payrollResults.map((result) => ({
      "Employee Code": result.employee.employeeId,
      "Employee Name": result.employee.name,
      "Account Number": result.employee.bankAccount || "N/A",
      "IFSC Code": result.employee.ifscCode || "N/A",
      "Net Pay": result.netPay,
      "Payment Date": new Date().toLocaleDateString("en-IN"),
      "Payment Mode": "NEFT",
      Remarks: `Salary for ${new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" })}`,
    }))

    this.generateCSVWithBOM(bankData, `Bank_Transfer_${new Date().toISOString().slice(0, 7)}`)
  }

  static generatePFECR(payrollResults: any[]) {
    const pfData = payrollResults
      .filter((result) => result.deductions.pf > 0)
      .map((result) => ({
        UAN: result.employee.uan || "N/A",
        "Member Name": result.employee.name,
        "Gross Wages": result.grossPay,
        "EPF Wages": Math.min(result.grossPay, 15000),
        "EPS Wages": Math.min(result.grossPay, 15000),
        "EDLI Wages": Math.min(result.grossPay, 15000),
        "EPF Contribution": result.deductions.pf,
        "EPS Contribution": Math.round(Math.min(result.grossPay, 15000) * 0.0833),
        "EDLI Contribution": Math.round(Math.min(result.grossPay, 15000) * 0.005),
        "NCP Days": result.employee.ncp || 0,
        Refund: 0,
      }))

    this.generateCSVWithBOM(pfData, `PF_ECR_${new Date().toISOString().slice(0, 7)}`)
  }

  static generateESIReturn(payrollResults: any[]) {
    const esiData = payrollResults
      .filter((result) => result.deductions.esi > 0)
      .map((result) => ({
        "IP Number": result.employee.esiNumber || "N/A",
        "IP Name": result.employee.name,
        "No of Days": result.employee.workingDays || 30,
        "Total Monthly Wages": result.grossPay,
        "Reason Code": "",
        "Last Working Day": "",
        "Employee ESI": result.deductions.esi,
        "Employer ESI": Math.round(result.grossPay * 0.0325),
      }))

    this.generateCSVWithBOM(esiData, `ESI_Return_${new Date().toISOString().slice(0, 7)}`)
  }

  static generateForm24Q(payrollResults: any[]) {
    const tdsData = payrollResults
      .filter((result) => result.deductions.tds > 0)
      .map((result) => ({
        PAN: result.employee.pan || "N/A",
        "Employee Name": result.employee.name,
        Designation: result.employee.designation || "Employee",
        "Gross Salary": result.grossPay,
        "Tax Deducted": result.deductions.tds,
        Quarter: `Q${Math.ceil((new Date().getMonth() + 1) / 3)}`,
        "Financial Year": `${new Date().getFullYear()}-${(new Date().getFullYear() + 1).toString().slice(-2)}`,
        "Challan Number": "TBD",
        "Date of Deposit": new Date().toLocaleDateString("en-IN"),
      }))

    this.generateCSVWithBOM(tdsData, `Form_24Q_${new Date().toISOString().slice(0, 7)}`)
  }

  static generatePayslips(payrollResults: any[]) {
    const payslipData = payrollResults.map((result) => ({
      "Employee ID": result.employee.employeeId,
      "Employee Name": result.employee.name,
      Department: result.employee.department || "N/A",
      Designation: result.employee.designation || "Employee",
      "Pay Period": new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" }),
      "Working Days": result.employee.workingDays || 30,
      "Present Days": result.employee.presentDays || 30,
      "Basic Salary": result.earnings.basic,
      HRA: result.earnings.hra,
      Conveyance: result.earnings.conveyance,
      Medical: result.earnings.medical,
      "Special Allowance": result.earnings.special,
      Overtime: result.earnings.overtime || 0,
      "Gross Pay": result.grossPay,
      "PF Deduction": result.deductions.pf,
      "ESI Deduction": result.deductions.esi,
      "Professional Tax": result.deductions.professionalTax,
      TDS: result.deductions.tds,
      "Other Deductions": result.deductions.other || 0,
      "Total Deductions": result.totalDeductions,
      "Net Pay": result.netPay,
      "Bank Account": result.employee.bankAccount || "N/A",
      PAN: result.employee.pan || "N/A",
      UAN: result.employee.uan || "N/A",
    }))

    this.generateCSVWithBOM(payslipData, `Payslips_${new Date().toISOString().slice(0, 7)}`)
  }

  static generatePayrollSummary(payrollResults: any[]) {
    const summaryData = [
      {
        "Total Employees": payrollResults.length,
        "Total Gross Pay": payrollResults.reduce((sum, r) => sum + r.grossPay, 0),
        "Total PF": payrollResults.reduce((sum, r) => sum + r.deductions.pf, 0),
        "Total ESI": payrollResults.reduce((sum, r) => sum + r.deductions.esi, 0),
        "Total Professional Tax": payrollResults.reduce((sum, r) => sum + r.deductions.professionalTax, 0),
        "Total TDS": payrollResults.reduce((sum, r) => sum + r.deductions.tds, 0),
        "Total Deductions": payrollResults.reduce((sum, r) => sum + r.totalDeductions, 0),
        "Total Net Pay": payrollResults.reduce((sum, r) => sum + r.netPay, 0),
        "Pay Period": new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" }),
        "Generated On": new Date().toLocaleString("en-IN"),
      },
    ]

    this.generateCSVWithBOM(summaryData, `Payroll_Summary_${new Date().toISOString().slice(0, 7)}`)
  }
}
