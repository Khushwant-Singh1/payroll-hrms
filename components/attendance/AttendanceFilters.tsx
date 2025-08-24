"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, Download } from "lucide-react"

interface AttendanceFiltersProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  selectedDepartment: string
  onDepartmentChange: (value: string) => void
  selectedMonth: string
  onMonthChange: (value: string) => void
  selectedYear: string
  onYearChange: (value: string) => void
  attendanceRange: string
  onAttendanceRangeChange: (value: string) => void
  showFilters: boolean
  onToggleFilters: () => void
  hasActiveFilters: boolean
  onClearFilters: () => void
  onExport: () => void
  filteredAttendanceCount: number
  departments: string[]
  months: string[]
  years: number[]
  attendanceRanges: { value: string; label: string }[]
}

export function AttendanceFilters({
  searchTerm,
  onSearchChange,
  selectedDepartment,
  onDepartmentChange,
  selectedMonth,
  onMonthChange,
  selectedYear,
  onYearChange,
  attendanceRange,
  onAttendanceRangeChange,
  showFilters,
  onToggleFilters,
  hasActiveFilters,
  onClearFilters,
  onExport,
  filteredAttendanceCount,
  departments,
  months,
  years,
  attendanceRanges,
}: AttendanceFiltersProps) {
  return (
    <div className="mt-3 sm:mt-4 space-y-3 sm:space-y-4">
      {/* Search bar with filter toggle */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name, ID, month, or year..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 text-sm sm:text-base"
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant={showFilters ? "default" : "outline"}
            onClick={onToggleFilters}
            className="w-full sm:w-auto text-sm sm:text-base"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center">
                !
              </Badge>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={onExport}
            disabled={filteredAttendanceCount === 0}
            title="Download Excel Report"
            className="w-full sm:w-auto text-sm sm:text-base"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          {hasActiveFilters && (
            <Button 
              variant="ghost" 
              onClick={onClearFilters}
              className="w-full sm:w-auto text-sm sm:text-base"
            >
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
          <div>
            <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2 block">Department</label>
            <Select value={selectedDepartment} onValueChange={onDepartmentChange}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2 block">Month</label>
            <Select value={selectedMonth} onValueChange={onMonthChange}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="All Months" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Months</SelectItem>
                {months.map((month) => (
                  <SelectItem key={month} value={month}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2 block">Year</label>
            <Select value={selectedYear} onValueChange={onYearChange}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="All Years" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2 block">Attendance Range</label>
            <Select value={attendanceRange} onValueChange={onAttendanceRangeChange}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="All Ranges" />
              </SelectTrigger>
              <SelectContent>
                {attendanceRanges.map((range) => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Results count */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 text-xs sm:text-sm">
        <div className="text-gray-600">
          Showing {filteredAttendanceCount} attendance records
          {hasActiveFilters && " (filtered)"}
        </div>
        <div className="text-gray-500">
          {filteredAttendanceCount > 0 && (
            <span>Ready to export {filteredAttendanceCount} records</span>
          )}
        </div>
      </div>
    </div>
  )
}
