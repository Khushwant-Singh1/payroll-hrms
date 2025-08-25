"use client"

import { useState, useEffect, useMemo, FormEvent } from "react"
// UI Components
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// Icons
import {
  AlertCircle, AlertTriangle, Calculator, Calendar as CalendarIcon, CheckCircle,
  Clock, Flag, Moon, Plus, Sun, Trash2, TrendingUp, User, Users, XCircle,
} from "lucide-react"
// Utils & Types
import { cn } from "@/lib/utils"
import { getMonthDetails, CustomHoliday } from "@/lib/calendar" // <-- Import new logic
import type { Employee } from "../types/payroll"
import type { AttendanceInput } from "../types/erp-payroll"

interface AttendanceInputModalProps {
  isOpen: boolean
  onClose: () => void
  employee: Employee
  onSave: (attendanceData: AttendanceInput) => void
  existingData?: AttendanceInput
}

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export function AttendanceInputModal({ isOpen, onClose, employee, onSave, existingData }: AttendanceInputModalProps) {
  const currentDate = new Date();
  const currentMonthIndex = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // --- STATE MANAGEMENT ---
  const [selectedMonth, setSelectedMonth] = useState(existingData?.month || monthNames[currentMonthIndex]);
  const [selectedYear, setSelectedYear] = useState(existingData?.year || currentYear);
  const [presentDays, setPresentDays] = useState(existingData?.presentDays || 0);
  const [overtimeHours, setOvertimeHours] = useState(existingData?.overtimeHours || 0);
  const [nightShiftDays, setNightShiftDays] = useState(existingData?.nightShiftDays || 0);
  const [hazardPay, setHazardPay] = useState(existingData?.hazardPay || 0);
  
  const [customHolidays, setCustomHolidays] = useState<CustomHoliday[]>([]);
  const [newHolidayDate, setNewHolidayDate] = useState<string>("");
  const [newHolidayName, setNewHolidayName] = useState<string>("");

  const [financialData, setFinancialData] = useState({
    perDayGross: 0,
    calculatedGross: 0,
    lopAmount: 0,
    overtimePay: 0,
    nightShiftPay: 0,
    totalGross: 0,
  });

  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  // --- LOGIC & CALCULATIONS ---

  const selectedMonthIndex = useMemo(() => monthNames.indexOf(selectedMonth), [selectedMonth]);

  // ✨ IMPROVED: Memoize calendar calculations. This only re-runs when the period or custom holidays change.
  const monthDetails = useMemo(() => {
    return getMonthDetails(selectedYear, selectedMonthIndex, customHolidays);
  }, [selectedYear, selectedMonthIndex, customHolidays]);

  const absentDays = useMemo(() => {
    return Math.max(0, monthDetails.workingDays - presentDays);
  }, [monthDetails.workingDays, presentDays]);
  
  const attendancePercentage = useMemo(() => {
    return monthDetails.workingDays > 0 ? (presentDays / monthDetails.workingDays) * 100 : 0;
  }, [presentDays, monthDetails.workingDays]);

  // ✨ IMPROVED: This effect only handles financial calculations.
  useEffect(() => {
    const { totalDaysInMonth } = monthDetails;
    
    // Calculate total salary from all components based on new schema
    const totalSalary = (
      Number(employee.basicSalary || 0) +
      Number(employee.specialBasic || 0) +
      Number(employee.dearnessAllowance || 0) +
      Number(employee.hra || 0) +
      Number(employee.overtimeRate || 0) +
      Number(employee.foodAllowance || 0) +
      Number(employee.conveyanceAllowance || 0) +
      Number(employee.officeWearAllowance || 0) +
      Number(employee.bonus || 0) +
      Number(employee.leaveWithWages || 0) +
      Number(employee.otherAllowances || 0) +
      Number(employee.rateOfWages || 0)
    );
    
    // Safety checks to prevent NaN
    const validTotalDays = totalDaysInMonth > 0 ? totalDaysInMonth : 30; // fallback to 30 days
    const validPresentDays = presentDays >= 0 ? presentDays : 0;
    const validAbsentDays = absentDays >= 0 ? absentDays : 0;
    const validOvertimeHours = overtimeHours >= 0 ? overtimeHours : 0;
    const validNightShiftDays = nightShiftDays >= 0 ? nightShiftDays : 0;
    const validHazardPay = hazardPay >= 0 ? hazardPay : 0;
    
    const perDayGross = totalSalary / validTotalDays;
    const calculatedGross = perDayGross * validPresentDays;
    const lopAmount = perDayGross * validAbsentDays;
    const overtimePay = validOvertimeHours * 500;
    const nightShiftPay = validNightShiftDays * 1000;
    const totalGross = calculatedGross + overtimePay + nightShiftPay + validHazardPay;

    // Additional safety check to ensure no NaN values
    setFinancialData({
      perDayGross: isNaN(perDayGross) ? 0 : perDayGross,
      calculatedGross: isNaN(calculatedGross) ? 0 : calculatedGross,
      lopAmount: isNaN(lopAmount) ? 0 : lopAmount,
      overtimePay: isNaN(overtimePay) ? 0 : overtimePay,
      nightShiftPay: isNaN(nightShiftPay) ? 0 : nightShiftPay,
      totalGross: isNaN(totalGross) ? 0 : totalGross,
    });
  }, [presentDays, overtimeHours, nightShiftDays, hazardPay, employee, monthDetails, absentDays]);


  // --- HANDLERS ---
  
  const handleMonthChange = (month: string) => {
    setSelectedMonth(month);
    setCustomHolidays([]); // Reset custom holidays when month changes
  };

  const handleYearChange = (year: string) => {
    setSelectedYear(Number(year));
    setCustomHolidays([]); // Reset custom holidays when year changes
  };

  const handlePresentDaysChange = (value: string) => {
    const num = Number(value);
    if (!isNaN(num) && num >= 0 && num <= monthDetails.workingDays) {
      setPresentDays(num);
    }
  };

  const handleOvertimeHoursChange = (value: string) => {
    const num = Number(value);
    if (!isNaN(num) && num >= 0) {
      setOvertimeHours(num);
    }
  };

  const handleNightShiftDaysChange = (value: string) => {
    const num = Number(value);
    if (!isNaN(num) && num >= 0) {
      setNightShiftDays(num);
    }
  };

  const handleHazardPayChange = (value: string) => {
    const num = Number(value);
    if (!isNaN(num) && num >= 0) {
      setHazardPay(num);
    }
  };

  const addCustomHoliday = () => {
    const dateNum = parseInt(newHolidayDate, 10);
    if (!newHolidayDate || !newHolidayName || isNaN(dateNum)) return;
    
    const { totalDaysInMonth } = monthDetails;
    if (dateNum < 1 || dateNum > totalDaysInMonth) {
      alert(`Date must be between 1 and ${totalDaysInMonth} for ${selectedMonth}.`);
      return;
    }
    // Prevent adding duplicate dates
    if (customHolidays.some(h => h.date === dateNum)) {
       alert(`A custom holiday for date ${dateNum} already exists.`);
       return;
    }

    setCustomHolidays([...customHolidays, { date: dateNum, name: newHolidayName }]);
    setNewHolidayDate("");
    setNewHolidayName("");
  };

  const removeCustomHoliday = (dateToRemove: number) => {
    setCustomHolidays(customHolidays.filter(h => h.date !== dateToRemove));
  };
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    
    const attendanceData: AttendanceInput = {
      employeeId: employee.id,
      month: selectedMonth,
      year: selectedYear,
      workingDays: monthDetails.workingDays,
      presentDays,
      absentDays,
      halfDays: 0, // Not captured in this form
      paidLeave: 0, // Not captured in this form  
      unpaidLeave: absentDays,
      sickLeave: 0, // Not captured in this form
      overtimeHours,
      nightShiftDays,
      hazardPay,
    }
    
    onSave(attendanceData)
  }
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }
  
  const getAttendanceStatus = (percentage: number) => {
    if (percentage >= 95) return { label: "Excellent", color: "bg-green-500" }
    if (percentage >= 90) return { label: "Good", color: "bg-blue-500" }
    if (percentage >= 80) return { label: "Average", color: "bg-yellow-500" }
    if (percentage >= 70) return { label: "Below Average", color: "bg-orange-500" }
    return { label: "Poor", color: "bg-red-500" }
  }
  const attendanceStatus = getAttendanceStatus(attendancePercentage);

  // --- RENDER ---
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader>
          <DialogTitle>
            Attendance Input - {employee.name} ({employee.employeeId})
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          {/* Period Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Period Selection
              </CardTitle>
              <CardDescription>
                Select the month and year for attendance recording
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Month Select */}
                <div className="space-y-2">
                  <Label>Month</Label>
                  <Select value={selectedMonth} onValueChange={handleMonthChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select month" />
                    </SelectTrigger>
                    <SelectContent>
                      {monthNames.map((month) => (
                        <SelectItem key={month} value={month}>
                          {month}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {/* Year Select */}
                <div className="space-y-2">
                  <Label>Year</Label>
                  <Select value={selectedYear.toString()} onValueChange={handleYearChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* ✨ IMPROVED: Working Days & Holiday Info (now powered by monthDetails) */}
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <span>Working Days:</span>
                  <span className="font-semibold text-right">{monthDetails.workingDays}</span>
                  <span>Weekend Days:</span>
                  <span className="font-semibold text-right">{monthDetails.weekendDays}</span>
                  <span>Public Holidays:</span>
                  <span className="font-semibold text-right">{monthDetails.holidays.length}</span>
                </div>
                
                {monthDetails.holidays.length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs text-blue-800 font-medium mb-1">Holidays in {selectedMonth}:</p>
                    <div className="flex flex-wrap gap-2">
                      {monthDetails.holidays.map((holiday) => (
                        <Badge key={holiday.date} variant="outline"
                          className={cn(
                            "font-normal",
                            holiday.type === 'predefined' 
                              ? "bg-orange-50 text-orange-700 border-orange-200"
                              : "bg-purple-50 text-purple-700 border-purple-200"
                          )}>
                          {new Date(holiday.date + 'T00:00:00').getDate()} {selectedMonth.substring(0,3)}: {holiday.name}
                           {holiday.type === 'custom' && (
                            <button type="button" onClick={() => removeCustomHoliday(parseInt(holiday.date.split('-')[2]))} className="ml-1.5 text-purple-600 hover:text-purple-900">
                              <Trash2 className="h-3 w-3" />
                            </button>
                           )}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Add Custom Holiday Section */}
                <div className="mt-4 p-3 bg-gray-50 rounded-lg border">
                  <h4 className="text-sm font-medium mb-3">Add Custom Holiday</h4>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Day (1-31)"
                      value={newHolidayDate}
                      onChange={(e) => setNewHolidayDate(e.target.value)}
                      min="1"
                      max="31"
                      className="w-24"
                    />
                    <Input
                      placeholder="Holiday name"
                      value={newHolidayName}
                      onChange={(e) => setNewHolidayName(e.target.value)}
                      className="flex-1"
                    />
                    <Button type="button" onClick={addCustomHoliday} size="sm" className="cursor-pointer">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
              </div>
            </CardContent>
          </Card>

          {/* Attendance Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Attendance Details
              </CardTitle>
              <CardDescription>
                Enter attendance information for {selectedMonth} {selectedYear}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="presentDays">Present Days</Label>
                  <Input
                    id="presentDays"
                    type="number"
                    value={presentDays}
                    onChange={(e) => handlePresentDaysChange(e.target.value)}
                    min="0"
                    max={monthDetails.workingDays}
                    placeholder="0"
                  />
                  <p className="text-xs text-gray-500">Max: {monthDetails.workingDays} days</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="overtimeHours">Overtime Hours</Label>
                  <Input
                    id="overtimeHours"
                    type="number"
                    value={overtimeHours}
                    onChange={(e) => handleOvertimeHoursChange(e.target.value)}
                    min="0"
                    placeholder="0"
                  />
                  <p className="text-xs text-gray-500">₹500 per hour</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nightShiftDays">Night Shift Days</Label>
                  <Input
                    id="nightShiftDays"
                    type="number"
                    value={nightShiftDays}
                    onChange={(e) => handleNightShiftDaysChange(e.target.value)}
                    min="0"
                    placeholder="0"
                  />
                  <p className="text-xs text-gray-500">₹1,000 per day</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hazardPay">Hazard Pay</Label>
                  <Input
                    id="hazardPay"
                    type="number"
                    value={hazardPay}
                    onChange={(e) => handleHazardPayChange(e.target.value)}
                    min="0"
                    placeholder="0"
                  />
                  <p className="text-xs text-gray-500">Additional amount</p>
                </div>
              </div>

              {/* Attendance Summary */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium mb-3">Attendance Summary</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Working Days:</span>
                    <span className="ml-2 font-semibold">{monthDetails.workingDays}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Present:</span>
                    <span className="ml-2 font-semibold">{presentDays}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Absent:</span>
                    <span className="ml-2 font-semibold">{absentDays}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Attendance:</span>
                    <Badge className={`ml-2 ${attendanceStatus.color} text-white`}>
                      {attendancePercentage.toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Salary Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Salary Preview
              </CardTitle>
              <CardDescription>
                Calculated salary based on attendance (Total Monthly Salary: {formatCurrency(
                  Number(employee.basicSalary || 0) +
                  Number(employee.specialBasic || 0) +
                  Number(employee.dearnessAllowance || 0) +
                  Number(employee.hra || 0) +
                  Number(employee.overtimeRate || 0) +
                  Number(employee.foodAllowance || 0) +
                  Number(employee.conveyanceAllowance || 0) +
                  Number(employee.officeWearAllowance || 0) +
                  Number(employee.bonus || 0) +
                  Number(employee.leaveWithWages || 0) +
                  Number(employee.otherAllowances || 0) +
                  Number(employee.rateOfWages || 0)
                )})
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span>Per Day Gross:</span>
                    <span className="font-semibold">{formatCurrency(financialData.perDayGross)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Calculated Gross:</span>
                    <span className="font-semibold">{formatCurrency(financialData.calculatedGross)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>LOP Amount:</span>
                    <span className="font-semibold text-red-600">{formatCurrency(financialData.lopAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Overtime Pay:</span>
                    <span className="font-semibold text-green-600">{formatCurrency(financialData.overtimePay)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Night Shift Pay:</span>
                    <span className="font-semibold text-green-600">{formatCurrency(financialData.nightShiftPay)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Hazard Pay:</span>
                    <span className="font-semibold text-green-600">{formatCurrency(hazardPay)}</span>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total Gross:</span>
                    <span className="text-blue-600">{formatCurrency(financialData.totalGross)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onClose} className="cursor-pointer">
              Cancel
            </Button>
            <Button type="submit" className="cursor-pointer">
              Save Attendance
            </Button>
          </div>
          
        </form>
      </DialogContent>
    </Dialog>
  )
}