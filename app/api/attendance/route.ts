import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

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

// GET /api/attendance
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const employeeId = searchParams.get('employeeId')
    const search = searchParams.get('search')

    const where: any = {}
    if (employeeId) where.employeeId = employeeId

    if (search) {
      where.OR = [
        { employee: { name: { contains: search, mode: 'insensitive' } } },
        { employee: { employeeId: { contains: search, mode: 'insensitive' } } },
        { month: { contains: search, mode: 'insensitive' } },
        { year: { equals: isNaN(Number(search)) ? undefined : Number(search) } },
      ].filter(condition => condition.year?.equals !== undefined || condition.year === undefined)
    }

    const records = await withRetry(async () => {
      return await prisma.attendance.findMany({
        where,
        include: { 
          employee: { 
            select: { 
              id: true, 
              name: true, 
              employeeId: true,
              basicSalary: true,
              hra: true,
              foodAllowance: true,
              conveyanceAllowance: true,
              otherAllowances: true
            } 
          } 
        },
        orderBy: [
          { year: 'desc' },
          { month: 'desc' },
          { createdAt: 'desc' }
        ],
      })
    });

    return NextResponse.json(records)
  } catch (error: any) {
    console.error('Error fetching attendance:', error)
    
    // Check if it's a database connection error
    if (error.message?.includes('database server') || error.code === 'P1001') {
      return NextResponse.json(
        { error: 'Database connection failed. Please try again later.' },
        { status: 503 } // Service Unavailable
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch attendance records' },
      { status: 500 }
    )
  }
}

// POST /api/attendance
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    // Validate required fields
    const { employeeId, month, year, presentDays, totalDays, overtimeHours, leavesTaken, shiftAllowance } = body
    
    if (!employeeId || !month || !year || presentDays === undefined || totalDays === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const record = await withRetry(async () => {
      // Check if attendance record already exists for this employee, month, year
      const existing = await prisma.attendance.findFirst({
        where: {
          employeeId,
          month,
          year: parseInt(year)
        }
      })

      if (existing) {
        throw new Error('Attendance record already exists for this employee and period')
      }

      return await prisma.attendance.create({ 
        data: {
          employeeId,
          month,
          year: parseInt(year),
          presentDays: parseInt(presentDays),
          totalDays: parseInt(totalDays),
          overtimeHours: parseFloat(overtimeHours) || 0,
          leavesTaken: parseInt(leavesTaken) || 0,
          shiftAllowance: parseFloat(shiftAllowance) || 0
        },
        include: {
          employee: {
            select: {
              id: true,
              name: true,
              employeeId: true,
              basicSalary: true,
              hra: true,
              foodAllowance: true,
              conveyanceAllowance: true,
              otherAllowances: true
            }
          }
        }
      })
    });
    
    return NextResponse.json(record, { status: 201 })
  } catch (error: any) {
    console.error('Error creating attendance:', error)
    
    // Handle specific errors
    if (error.message?.includes('already exists')) {
      return NextResponse.json(
        { error: 'Attendance record already exists for this employee and period' },
        { status: 409 }
      )
    }
    
    if (error.message?.includes('database server') || error.code === 'P1001') {
      return NextResponse.json(
        { error: 'Database connection failed. Please try again later.' },
        { status: 503 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create attendance record' },
      { status: 500 }
    )
  }
}