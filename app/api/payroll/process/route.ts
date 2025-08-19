// File: /app/api/payroll/process/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/utils/auth";

// Simplified calculation logic. This should be expanded based on your business rules.
const calculateDeductions = (gross: number, basic: number, pfOptIn: boolean, esiApplicable: boolean) => {
  const pfEmployee = pfOptIn ? Math.min(basic * 0.12, 1800) : 0;
  const esiEmployee = esiApplicable && gross <= 21000 ? gross * 0.0075 : 0;
  const professionalTax = gross > 15000 ? 200 : 0; // Simplified
  const tds = gross > 41667 ? (gross - 41667) * 0.10 : 0; // Highly simplified

  const totalDeductions = pfEmployee + esiEmployee + professionalTax + tds;
  return { pfEmployee, esiEmployee, professionalTax, tds, totalDeductions };
};

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || !['ADMIN', 'HR'].includes(session.user.role)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  try {
    const { month, year } = await req.json(); // e.g., month: 8, year: 2025

    const activeEmployees = await prisma.employee.findMany({ where: { status: "ACTIVE" } });

    const calculationsData = activeEmployees.map(emp => {
      const grossEarnings = emp.salary;
      const { pfEmployee, esiEmployee, professionalTax, tds, totalDeductions } = 
        calculateDeductions(grossEarnings, emp.basicSalary, emp.pfOptIn, emp.esiApplicable);
      const netPay = grossEarnings - totalDeductions;
      
      return {
        employeeId: emp.id,
        grossEarnings, pfEmployee, esiEmployee, professionalTax, tds,
        otherDeductions: 0, totalDeductions, netPay,
        isValid: true, validationErrors: [], validationWarnings: [],
      };
    });

    // Use a transaction to ensure data integrity
    const result = await prisma.$transaction(async (prisma) => {
      let payrollRun = await prisma.payrollRun.findFirst({ where: { month, year } });

      if (!payrollRun) {
        payrollRun = await prisma.payrollRun.create({ data: { month, year, status: "PENDING", totalEmployees: 0, processedEmployees: 0, totalGrossSalary: 0, totalDeductions: 0, totalNetSalary: 0 } });
      }

      await prisma.payrollCalculation.deleteMany({ where: { payrollRunId: payrollRun.id } });
      await prisma.payrollCalculation.createMany({ data: calculationsData.map(c => ({ ...c, payrollRunId: payrollRun!.id })) });

      const totals = calculationsData.reduce((acc, cv) => ({
          gross: acc.gross + cv.grossEarnings,
          deductions: acc.deductions + cv.totalDeductions,
          net: acc.net + cv.netPay,
        }), { gross: 0, deductions: 0, net: 0 });

      return prisma.payrollRun.update({
        where: { id: payrollRun.id },
        data: {
          status: "PROCESSED",
          processedAt: new Date(),
          totalEmployees: activeEmployees.length,
          processedEmployees: calculationsData.length,
          totalGrossSalary: totals.gross,
          totalDeductions: totals.deductions,
          totalNetSalary: totals.net,
        },
        include: { calculations: { include: { employee: true } } },
      });
    });

    return NextResponse.json(result);
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}