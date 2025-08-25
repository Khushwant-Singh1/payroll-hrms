// app/api/employees/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

// Retry utility function
async function withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      console.error(`Attempt ${i + 1} failed:`, error.message);
      
      // If it's the last retry or not a connection error, throw the error
      if (i === retries - 1 || !error.message?.includes('database server')) {
        throw error;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
    }
  }
  throw new Error('All retry attempts failed');
}

/* Updated schema to match frontend with rateOfWages */
export const employeeSchema = z.object({
  employeeId: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  department: z.string().min(1),
  designation: z.string().min(1),
  company: z.string().min(1),
  location: z.string().optional(),
  grade: z.string().optional(),
  status: z.enum(["active", "inactive"]).default("active"),
  joiningDate: z.string().min(1),
  dateOfBirth: z.string().optional(),
  
  // Salary Components
  basicSalary: z.number().min(0),
  specialBasic: z.number().min(0).default(0),
  dearnessAllowance: z.number().min(0).default(0),
  hra: z.number().min(0),
  overtimeRate: z.number().min(0).default(0),
  foodAllowance: z.number().min(0).default(0),
  conveyanceAllowance: z.number().min(0).default(0),
  officeWearAllowance: z.number().min(0).default(0),
  bonus: z.number().min(0).default(0),
  leaveWithWages: z.number().min(0).default(0),
  otherAllowances: z.number().min(0).default(0),
  rateOfWages: z.number().min(0).default(0), // Added rate of wages
  
  // Deductions (Employee Share)
  pfDeduction: z.number().min(0).default(0),
  esicDeduction: z.number().min(0).default(0),
  societyDeduction: z.number().min(0).default(0),
  incomeTaxDeduction: z.number().min(0).default(0),
  insuranceDeduction: z.number().min(0).default(0),
  otherRecoveries: z.number().min(0).default(0),
  
  // Employer Contributions
  employerPfContribution: z.number().min(0).default(0),
  employerEsicContribution: z.number().min(0).default(0),
  
  // Payment Details
  bankAccount: z.string().optional(),
  ifsc: z.string().optional(),
  branch: z.string().optional(),
  lastTransactionId: z.string().optional(),
  lastPaymentDate: z.string().optional(),
  
  // Additional Fields
  pan: z.string().optional(),
  aadhaar: z.string().optional(),
  uan: z.string().optional(),
  esicNumber: z.string().optional(),
  pfOptIn: z.boolean().default(true),
  esiApplicable: z.boolean().default(true),
  lwfState: z.string().optional(),
  profilePic: z.string().optional(),
});

/* convert strings → Date objects */
export const toDb = (data: z.infer<typeof employeeSchema>) => {
  const result: any = {
    ...data,
    joiningDate: new Date(data.joiningDate),
  };
  
  // Handle optional date fields - only include if not empty
  if (data.dateOfBirth && data.dateOfBirth.trim() !== "") {
    result.dateOfBirth = new Date(data.dateOfBirth);
  } else {
    delete result.dateOfBirth;
  }
  
  if (data.lastPaymentDate && data.lastPaymentDate.trim() !== "") {
    result.lastPaymentDate = new Date(data.lastPaymentDate);
  } else {
    delete result.lastPaymentDate;
  }
  
  // Remove empty string fields for optional string fields
  const optionalStringFields = [
    'location', 'grade', 'bankAccount', 'ifsc', 'branch', 
    'lastTransactionId', 'pan', 'aadhaar', 'uan', 'esicNumber', 'lwfState'
  ];
  
  optionalStringFields.forEach(field => {
    if (result[field] === "") {
      delete result[field];
    }
  });
  
  return result;
};

/* GET /api/employees */
export async function GET() {
  try {
    const employees = await withRetry(async () => {
      return await prisma.employee.findMany({ 
        orderBy: { createdAt: "desc" } 
      });
    });
    
    // Add calculated salary fields to each employee
    const employeesWithCalculations = employees.map(employee => {
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
      
      return {
        ...employee,
        totalEarnings,
        totalDeductions,
        netSalary
      };
    });
    
    return NextResponse.json(employeesWithCalculations);
  } catch (error: any) {
    console.error('Error fetching employees:', error);
    
    // Check if it's a database connection error
    if (error.message?.includes('database server') || error.code === 'P1001') {
      return NextResponse.json(
        { error: 'Database connection failed. Please try again later.' },
        { status: 503 } // Service Unavailable
      )
    }
    
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/* POST /api/employees */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = employeeSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ errors: parsed.error.errors }, { status: 400 });
    }

    const created = await withRetry(async () => {
      // Check if employee ID already exists
      const existingEmployee = await prisma.employee.findUnique({
        where: { employeeId: parsed.data.employeeId }
      });
      
      if (existingEmployee) {
        throw new Error("Employee ID already exists");
      }

      // Check if email already exists
      const existingEmail = await prisma.employee.findUnique({
        where: { email: parsed.data.email }
      });
      
      if (existingEmail) {
        throw new Error("Email already exists");
      }

      return await prisma.employee.create({ 
        data: toDb(parsed.data) 
      });
    });
    
    // Add calculated salary fields to the response
    const totalEarnings = (
      Number(created.basicSalary) +
      Number(created.specialBasic) +
      Number(created.dearnessAllowance) +
      Number(created.hra) +
      Number(created.foodAllowance) +
      Number(created.conveyanceAllowance) +
      Number(created.officeWearAllowance) +
      Number(created.bonus) +
      Number(created.leaveWithWages) +
      Number(created.otherAllowances) +
      Number(created.rateOfWages || 0) // Added rate of wages to total earnings
    );
    
    const totalDeductions = (
      Number(created.pfDeduction) +
      Number(created.esicDeduction) +
      Number(created.societyDeduction) +
      Number(created.incomeTaxDeduction) +
      Number(created.insuranceDeduction) +
      Number(created.otherRecoveries)
    );
    
    const netSalary = totalEarnings - totalDeductions;
    
    const employeeWithCalculations = {
      ...created,
      totalEarnings,
      totalDeductions,
      netSalary
    };
    
    return NextResponse.json(employeeWithCalculations, { status: 201 });
  } catch (error: any) {
    console.error("Error creating employee:", error);
    
    // Handle specific errors
    if (error.message?.includes('already exists')) {
      return NextResponse.json(
        { error: error.message }, 
        { status: 409 }
      );
    }
    
    if (error.message?.includes('database server') || error.code === 'P1001') {
      return NextResponse.json(
        { error: 'Database connection failed. Please try again later.' },
        { status: 503 }
      );
    }
    
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}