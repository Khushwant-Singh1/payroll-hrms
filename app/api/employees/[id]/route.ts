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
  return NextResponse.json(updated);
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  await prisma.employee.delete({ where: { id: params.id } });
  return NextResponse.json({ deleted: true });
}