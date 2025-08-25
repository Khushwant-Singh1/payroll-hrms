import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/utils/auth";

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

// GET all statutory returns
export async function GET() {
  const session = await auth();
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const returns = await withRetry(async () => {
      return await prisma.statutoryReturn.findMany({
        orderBy: { generatedAt: "desc" },
      });
    });
    
    return NextResponse.json(returns);
  } catch (error: any) {
    console.error("Error fetching statutory returns:", error);
    
    // Check if it's a database connection error
    if (error.message?.includes('database server') || error.code === 'P1001') {
      return new NextResponse("Database connection failed. Please try again later.", { status: 503 });
    }
    
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
