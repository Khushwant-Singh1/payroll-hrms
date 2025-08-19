import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { employeeSchema, toDb } from "../../employees/route";

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

/* GET /api/drafts/[id] - Get a specific draft */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const draft = await prisma.employeeDraft.findUnique({
      where: { id: params.id },
    });

    if (!draft) {
      return NextResponse.json(
        { error: "Draft not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(draft);
  } catch (error) {
    console.error("Error fetching draft:", error);
    return NextResponse.json(
      { error: "Failed to fetch draft" },
      { status: 500 }
    );
  }
}

/* PUT /api/drafts/[id] - Update a draft */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const parsed = employeeDraftSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { errors: parsed.error.errors },
        { status: 400 }
      );
    }

    const draft = await prisma.employeeDraft.update({
      where: { id: params.id },
      data: parsed.data,
    });

    return NextResponse.json(draft);
  } catch (error) {
    console.error("Error updating draft:", error);
    return NextResponse.json(
      { error: "Failed to update draft" },
      { status: 500 }
    );
  }
}

/* DELETE /api/drafts/[id] - Delete a draft */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.employeeDraft.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting draft:", error);
    return NextResponse.json(
      { error: "Failed to delete draft" },
      { status: 500 }
    );
  }
}

/* POST /api/drafts/[id]/convert - Convert draft to employee */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the draft
    const draft = await prisma.employeeDraft.findUnique({
      where: { id: params.id },
    });

    if (!draft) {
      return NextResponse.json(
        { error: "Draft not found" },
        { status: 404 }
      );
    }

    // Convert draft data to employee format and validate
    const employeeData = {
      employeeId: draft.employeeId || "",
      name: draft.name || "",
      email: draft.email || "",
      phone: draft.phone || "",
      department: draft.department || "",
      designation: draft.designation || "",
      company: draft.company || "",
      location: draft.location || "",
      grade: draft.grade || "",
      status: draft.status,
      joiningDate: draft.joiningDate || "",
      dateOfBirth: draft.dateOfBirth || "",
      basicSalary: Number(draft.basicSalary) || 0,
      hra: Number(draft.hra) || 0,
      allowances: Number(draft.allowances) || 0,
      pan: draft.pan || "",
      aadhaar: draft.aadhaar || "",
      uan: draft.uan || "",
      esicNumber: draft.esicNumber || "",
      pfOptIn: draft.pfOptIn,
      esiApplicable: draft.esiApplicable,
      lwfState: draft.lwfState || "",
      bankAccount: draft.bankAccount || "",
      ifsc: draft.ifsc || "",
      branch: draft.branch || "",
      profilePic: draft.profilePic || "",
    };

    // Validate with employee schema
    const parsed = employeeSchema.safeParse(employeeData);
    if (!parsed.success) {
      return NextResponse.json(
        { 
          error: "Draft data is incomplete or invalid",
          validationErrors: parsed.error.errors 
        },
        { status: 400 }
      );
    }

    // Create employee and delete draft in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const employee = await tx.employee.create({
        data: toDb(parsed.data),
      });

      await tx.employeeDraft.delete({
        where: { id: params.id },
      });

      return employee;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error converting draft:", error);
    return NextResponse.json(
      { error: "Failed to convert draft to employee" },
      { status: 500 }
    );
  }
}
