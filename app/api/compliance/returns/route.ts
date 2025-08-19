import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/utils/auth";

// GET all statutory returns
export async function GET() {
  const session = await auth();
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const returns = await prisma.statutoryReturn.findMany({
      orderBy: { generatedAt: "desc" },
    });
    return NextResponse.json(returns);
  } catch (error) {
    console.error("Error fetching statutory returns:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
