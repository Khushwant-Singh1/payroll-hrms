import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

// Schema for employee draft - all fields optional except for tracking
const employeeDraftSchema = z.object({
  employeeId: z.string().optional(),
  name: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  department: z.string().optional(),
  designation: z.string().optional(),
  company: z.string().optional(),
  location: z.string().optional(),
  grade: z.string().optional(),
  status: z.enum(["active", "inactive"]).default("active"),
  joiningDate: z.string().optional(),
  dateOfBirth: z.string().optional(),
  basicSalary: z.number().optional(),
  hra: z.number().optional(),
  allowances: z.number().optional(),
  pan: z.string().optional(),
  aadhaar: z.string().optional(),
  uan: z.string().optional(),
  esicNumber: z.string().optional(),
  pfOptIn: z.boolean().default(true),
  esiApplicable: z.boolean().default(true),
  lwfState: z.string().optional(),
  bankAccount: z.string().optional(),
  ifsc: z.string().optional(),
  branch: z.string().optional(),
  profilePic: z.string().optional(),
  createdBy: z.string().optional(),
});

/* GET /api/drafts - Get all employee drafts */
export async function GET() {
  try {
    const drafts = await prisma.employeeDraft.findMany({
      orderBy: { lastModified: "desc" }
    });
    return NextResponse.json(drafts);
  } catch (error) {
    console.error("Error fetching drafts:", error);
    return NextResponse.json(
      { error: "Failed to fetch drafts" },
      { status: 500 }
    );
  }
}

/* POST /api/drafts - Create a new employee draft */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = employeeDraftSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { errors: parsed.error.errors },
        { status: 400 }
      );
    }

    const draft = await prisma.employeeDraft.create({
      data: parsed.data,
    });

    return NextResponse.json(draft, { status: 201 });
  } catch (error) {
    console.error("Error creating draft:", error);
    return NextResponse.json(
      { error: "Failed to create draft" },
      { status: 500 }
    );
  }
}
