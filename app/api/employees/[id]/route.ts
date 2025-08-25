// app/api/employees/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { employeeSchema, toDb } from "../route";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    const employee = await prisma.employee.findUnique({
      where: { id }
    });
    
    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }
    
    // Add calculated salary fields to the response
    const totalEarnings = (
      Number(employee.basicSalary) +
      Number(employee.specialBasic) +
      Number(employee.dearnessAllowance) +
      Number(employee.hra) +
      Number(employee.foodAllowance) +
      Number(employee.conveyanceAllowance) +
      Number(employee.officeWearAllowance) +
      Number(employee.bonus) +
      Number(employee.leaveWithWages) +
      Number(employee.otherAllowances) +
      Number(employee.rateOfWages || 0) // Added rate of wages to total earnings
    );
    
    const totalDeductions = (
      Number(employee.pfDeduction) +
      Number(employee.esicDeduction) +
      Number(employee.societyDeduction) +
      Number(employee.incomeTaxDeduction) +
      Number(employee.insuranceDeduction) +
      Number(employee.otherRecoveries)
    );
    
    const netSalary = totalEarnings - totalDeductions;
    
    const employeeWithCalculations = {
      ...employee,
      totalEarnings,
      totalDeductions,
      netSalary
    };
    
    return NextResponse.json(employeeWithCalculations);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    
    const parsed = employeeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ errors: parsed.error.errors }, { status: 400 });
    }

    // Check if employee ID already exists (excluding current employee)
    if (parsed.data.employeeId) {
      const existingEmployee = await prisma.employee.findFirst({
        where: { 
          employeeId: parsed.data.employeeId,
          NOT: { id }
        }
      });
      
      if (existingEmployee) {
        return NextResponse.json(
          { error: "Employee ID already exists" }, 
          { status: 409 }
        );
      }
    }

    // Check if email already exists (excluding current employee)
    if (parsed.data.email) {
      const existingEmail = await prisma.employee.findFirst({
        where: { 
          email: parsed.data.email,
          NOT: { id }
        }
      });
      
      if (existingEmail) {
        return NextResponse.json(
          { error: "Email already exists" }, 
          { status: 409 }
        );
      }
    }

    const updated = await prisma.employee.update({
      where: { id },
      data: toDb(parsed.data),
    });
    
    // Add calculated salary fields to the response
    const totalEarnings = (
      Number(updated.basicSalary) +
      Number(updated.specialBasic) +
      Number(updated.dearnessAllowance) +
      Number(updated.hra) +
      Number(updated.foodAllowance) +
      Number(updated.conveyanceAllowance) +
      Number(updated.officeWearAllowance) +
      Number(updated.bonus) +
      Number(updated.leaveWithWages) +
      Number(updated.otherAllowances) +
      Number(updated.rateOfWages || 0) // Added rate of wages to total earnings
    );
    
    const totalDeductions = (
      Number(updated.pfDeduction) +
      Number(updated.esicDeduction) +
      Number(updated.societyDeduction) +
      Number(updated.incomeTaxDeduction) +
      Number(updated.insuranceDeduction) +
      Number(updated.otherRecoveries)
    );
    
    const netSalary = totalEarnings - totalDeductions;
    
    const employeeWithCalculations = {
      ...updated,
      totalEarnings,
      totalDeductions,
      netSalary
    };
    
    return NextResponse.json(employeeWithCalculations);
  } catch (error: any) {
    console.error("Error updating employee:", error);
    
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }
    
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    await prisma.employee.delete({ 
      where: { id } 
    });
    
    return NextResponse.json({ deleted: true });
  } catch (error: any) {
    console.error("Error deleting employee:", error);
    
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }
    
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}