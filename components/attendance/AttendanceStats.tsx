"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Timer, Clock } from "lucide-react"

interface AttendanceStatsProps {
  attendance: any[]
  formatCurrency: (amount: number) => string
  onExportData: () => void
  filteredAttendanceCount: number
}

export function AttendanceStats({ 
  attendance, 
  formatCurrency, 
  onExportData, 
  filteredAttendanceCount 
}: AttendanceStatsProps) {
  const attendanceStats = [
    {
      icon: Calendar,
      title: "Leave Records",
      desc: "Annual, sick, casual leaves",
      value: `${attendance.reduce((s, a) => s + a.leavesTaken, 0)} days`,
      action: "Export Data",
      onClick: onExportData,
      disabled: filteredAttendanceCount === 0,
    },
    {
      icon: Timer,
      title: "Overtime",
      desc: "Extra hours worked",
      value: `${attendance.reduce((s, a) => s + Number(a.overtimeHours), 0)} hours`,
      action: "View Details",
      onClick: undefined,
      disabled: false,
    },
    {
      icon: Clock,
      title: "Shift Allowances",
      desc: "Night/weekend premiums",
      value: formatCurrency(attendance.reduce((s, a) => s + Number(a.shiftAllowance), 0)),
      action: "View Details",
      onClick: undefined,
      disabled: false,
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
      {attendanceStats.map((item, i) => (
        <Card key={i}>
          <CardHeader className="pb-2 sm:pb-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <item.icon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              <CardTitle className="text-base sm:text-lg">{item.title}</CardTitle>
            </div>
            <CardDescription className="text-xs sm:text-sm">{item.desc}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-gray-900">{item.value}</div>
            <Button 
              variant="outline" 
              className="w-full mt-3 sm:mt-4 text-sm sm:text-base"
              onClick={item.onClick}
              disabled={item.disabled}
            >
              {item.action}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
