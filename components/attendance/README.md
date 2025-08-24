# Attendance Components

This directory contains modular components for managing employee attendance functionality in the payroll dashboard.

## Component Structure

### Core Components

- **`AttendanceTab.tsx`** - Main container component that orchestrates all attendance functionality
- **`AttendanceStats.tsx`** - Displays attendance statistics cards (leaves, overtime, shift allowances)
- **`AttendanceFilters.tsx`** - Handles search, filtering, and export functionality
- **`AttendanceTable.tsx`** - Renders the attendance records table with actions
- **`AttendanceViewModal.tsx`** - Detailed view modal for individual attendance records

### Utilities

- **`attendanceUtils.ts`** - Contains helper functions for:
  - Data filtering and processing
  - Excel export data generation
  - Filter option generation
  - Type definitions

- **`index.ts`** - Central export file for all components and utilities

## Benefits of Modularization

1. **Separation of Concerns**: Each component has a single, focused responsibility
2. **Reusability**: Components can be easily reused in other parts of the application
3. **Maintainability**: Smaller, focused components are easier to debug and maintain
4. **Testing**: Individual components can be tested in isolation
5. **Performance**: Components can be optimized independently
6. **Code Organization**: Clear structure makes the codebase easier to navigate

## Component Responsibilities

### AttendanceStats
- Displays summary statistics
- Handles export button functionality
- Responsive grid layout for different screen sizes

### AttendanceFilters
- Search functionality
- Department, month, year, and attendance range filters
- Export and clear filter actions
- Results count display

### AttendanceTable
- Renders attendance data in a table format
- Handles view and edit actions
- Attendance percentage badges with color coding
- Responsive table design

### AttendanceViewModal
- Comprehensive attendance details view
- Employee information display
- Salary calculations and impact analysis
- Attendance summary with progress bars
- Role-based admin information

### attendanceUtils
- Data filtering logic
- Excel export data preparation
- Filter option generation
- Type definitions and interfaces

## Usage Example

```tsx
import { AttendanceTab } from '@/components/attendance'

function MyPage() {
  return (
    <AttendanceTab
      attendance={attendanceData}
      employees={employeeData}
      formatCurrency={formatCurrency}
      addAttendanceRecord={addRecord}
      updateAttendanceRecord={updateRecord}
    />
  )
}
```

## State Management

The main `AttendanceTab` component manages all state and passes it down to child components through props. This ensures:

- Centralized state management
- Predictable data flow
- Easy debugging and state inspection
- Consistent data across all components

## Responsive Design

All components are built with responsive design principles:
- Mobile-first approach
- Flexible grid layouts
- Adaptive spacing and typography
- Touch-friendly interactions

## Accessibility

Components include:
- Proper ARIA labels
- Keyboard navigation support
- Screen reader compatibility
- Focus management
- Semantic HTML structure
