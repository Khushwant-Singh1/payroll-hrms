import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

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

    const records = await prisma.attendance.findMany({
      where,
      include: { 
        employee: { 
          select: { 
            id: true, 
            name: true, 
            employeeId: true,
            basicSalary: true,
            hra: true,
            allowances: true
          } 
        } 
      },
      orderBy: [
        { year: 'desc' },
        { month: 'desc' },
        { createdAt: 'desc' }
      ],
    })

    return NextResponse.json(records)
  } catch (error) {
    console.error('Error fetching attendance:', error)
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

    // Check if attendance record already exists for this employee, month, year
    const existing = await prisma.attendance.findFirst({
      where: {
        employeeId,
        month,
        year: parseInt(year)
      }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Attendance record already exists for this employee and period' },
        { status: 409 }
      )
    }

    const record = await prisma.attendance.create({ 
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
            allowances: true
          }
        }
      }
    })
    
    return NextResponse.json(record, { status: 201 })
  } catch (error) {
    console.error('Error creating attendance:', error)
    return NextResponse.json(
      { error: 'Failed to create attendance record' },
      { status: 500 }
    )
  }
}