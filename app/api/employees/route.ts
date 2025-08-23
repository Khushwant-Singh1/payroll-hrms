import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

/* same shape as the front-end schema */
export const employeeSchema = z.object({
  employeeId:   z.string().min(1),
  name:         z.string().min(1),
  email:        z.string().email(),
  phone:        z.string().min(1),
  department:   z.string().min(1),
  designation:  z.string().min(1),
  company:      z.string().min(1),
  location:     z.string().optional(),
  grade:        z.string().optional(),
  status:       z.enum(["active", "inactive"]).default("active"),
  joiningDate:  z.string().min(1),
  dateOfBirth:  z.string().optional(),
  basicSalary:  z.number().min(0),
  hra:          z.number().min(0),
  allowances:   z.number().min(0),
  pan:          z.string().optional(),
  aadhaar:      z.string().optional(),
  uan:          z.string().optional(),
  esicNumber:   z.string().optional(),
  pfOptIn:      z.boolean().default(true),
  esiApplicable:z.boolean().default(true),
  lwfState:     z.string().optional(),
  bankAccount:  z.string().optional(),
  ifsc:         z.string().optional(),
  branch:       z.string().optional(),
  profilePic:   z.string().optional(),
});

/* convert strings → Date objects */
export const toDb = (data: z.infer<typeof employeeSchema>) => ({
  ...data,
  joiningDate: new Date(data.joiningDate),
  ...(data.dateOfBirth && { dateOfBirth: new Date(data.dateOfBirth) }),
});

/* GET /api/employees */
export async function GET() {
  const employees = await prisma.employee.findMany({ orderBy: { createdAt: "desc" } });
  
  // Add calculated salary field to each employee
  const employeesWithSalary = employees.map(employee => ({
    ...employee,
    salary: Number(employee.basicSalary) + Number(employee.hra) + Number(employee.allowances)
  }));
  
  return NextResponse.json(employeesWithSalary);
}

/* POST /api/employees */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = employeeSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ errors: parsed.error.errors }, { status: 400 });

  try {
    const created = await prisma.employee.create({ data: toDb(parsed.data) });
    
    // Add calculated salary field to the response
    const employeeWithSalary = {
      ...created,
      salary: Number(created.basicSalary) + Number(created.hra) + Number(created.allowances)
    };
    
    return NextResponse.json(employeeWithSalary, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 409 });
  }
}