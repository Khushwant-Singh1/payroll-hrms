import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json()
    
    // Convert numeric fields
    const updateData: any = { ...body }
    if (updateData.year) updateData.year = parseInt(updateData.year)
    if (updateData.presentDays !== undefined) updateData.presentDays = parseInt(updateData.presentDays)
    if (updateData.totalDays !== undefined) updateData.totalDays = parseInt(updateData.totalDays)
    if (updateData.overtimeHours !== undefined) updateData.overtimeHours = parseFloat(updateData.overtimeHours)
    if (updateData.leavesTaken !== undefined) updateData.leavesTaken = parseInt(updateData.leavesTaken)
    if (updateData.shiftAllowance !== undefined) updateData.shiftAllowance = parseFloat(updateData.shiftAllowance)

    const updated = await prisma.attendance.update({
      where: { id: params.id },
      data: updateData,
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
    
    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating attendance:', error)
    return NextResponse.json(
      { error: 'Failed to update attendance record' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.attendance.delete({ where: { id: params.id } })
    return NextResponse.json({}, { status: 204 })
  } catch (error) {
    console.error('Error deleting attendance:', error)
    return NextResponse.json(
      { error: 'Failed to delete attendance record' },
      { status: 500 }
    )
  }
}