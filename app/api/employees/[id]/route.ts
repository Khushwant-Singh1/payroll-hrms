import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { employeeSchema, toDb } from "../route";

export async function PUT(req: NextRequest, { params }: { params:Promise<{ id: string }>  }) {
  const { id } = await params

  const body = await req.json();
  const parsed = employeeSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ errors: parsed.error.errors }, { status: 400 });

  const updated = await prisma.employee.update({
    where: { id },
    data: toDb(parsed.data),
  });
  
  // Add calculated salary field to the response
  const employeeWithSalary = {
    ...updated,
    salary: Number(updated.basicSalary) + Number(updated.hra) + Number(updated.allowances)
  };
  
  return NextResponse.json(employeeWithSalary);
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  await prisma.employee.delete({ where: { id: params.id } });
  return NextResponse.json({ deleted: true });
}