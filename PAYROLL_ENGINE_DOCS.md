# Payroll Engine - Frontend UI Documentation

## Overview

The Payroll Engine is a comprehensive dashboard and form-driven interface for managing payroll operations. It provides a complete solution for payroll processing, from attendance management to salary disbursement.

## Core UI Sections

### 1. Payroll Dashboard (`/components/payroll-dashboard.tsx`)

**Purpose**: Central overview of payroll status and key metrics

**Features**:
- **Period Selection**: Month and year dropdown selectors
- **Payroll Status**: Current processing status with visual indicators
- **Quick Stats Cards**:
  - Total Employees (with processed/pending breakdown)
  - Total Gross Salary
  - Total Deductions (PF, ESI, Tax & Others)
  - Net Payout Amount
- **Alerts & Notifications**: 
  - Missing attendance data
  - Pending tax declarations
  - Approval requirements
  - Compliance issues
- **Quick Actions**: Direct access to common tasks

**Key Components**:
```tsx
<PayrollDashboard />
```

### 2. Payroll Configuration (`/components/payroll-configuration.tsx`)

**Purpose**: Configure payroll settings and run payroll processing

**Features**:
- **Period Selection**: Month & Year selection with calendar details
- **Calendar Integration**: 
  - Automatic calculation of working days
  - Weekend days (Sundays) identification
  - National holidays from Holiday Master
  - Custom holiday management
- **Lock/Unlock Controls**: Prevent/allow payroll modifications
- **Attendance Synchronization**:
  - Pull attendance data from Attendance module
  - Real-time sync status
  - Pending employee alerts
- **Processing Configuration**:
  - Full/Partial processing modes
  - Component selection (Basic, Overtime, Deductions, etc.)
  - Preview and validation options

**Key Components**:
```tsx
<PayrollConfiguration />
```

### 3. Salary Calculation Screen (`/components/salary-calculation-screen.tsx`)

**Purpose**: Review and process individual employee salary calculations

**Features**:
- **Summary Cards**: Total employees, gross, deductions, net payout
- **Advanced Filtering**:
  - Search by employee name/ID/department
  - Status filtering (Pending, Calculated, Approved, etc.)
  - Department-wise filtering
- **Detailed Employee Table**:
  - Employee information with profile
  - Days worked vs working days
  - Gross salary breakdown
  - Deduction details
  - Net salary calculation
  - Status indicators with icons
- **Bulk Operations**:
  - Select all/individual employees
  - Bulk approval/rejection
  - Batch processing
- **Individual Actions**: View details, recalculate, approve

**Table Columns**:
- ☑️ **Selection Checkbox**
- 👤 **Employee** (Name, ID, Department, Designation)
- 📅 **Days Worked** (Present/Total with percentage)
- 💰 **Gross** (Total with basic salary breakdown)
- 📉 **Deductions** (Total with PF breakdown)
- 💵 **Net Salary** (Final amount)
- 🏷️ **Status** (Visual badge with icon)
- ⚙️ **Actions** (More options menu)

**Key Components**:
```tsx
<SalaryCalculationScreen />
```

## Main Payroll Engine Component

### PayrollEngine (`/components/payroll-engine.tsx`)

**Purpose**: Main container component with tabbed interface

**Tabs**:
1. **Dashboard** - Overview and statistics
2. **Configure** - Payroll configuration and run controls
3. **Calculate** - Salary calculation and review
4. **Compliance** - Statutory returns and compliance
5. **Reports** - Generate and download reports
6. **Workflows** - Approval workflow management

## Integration Points

### Calendar Integration (`/lib/calendar.ts`)
- Automatic weekend calculation
- National holiday identification
- Custom holiday management
- Working days computation

### Attendance Module Integration
- Real-time attendance data sync
- Missing attendance alerts
- Attendance percentage calculations

### Employee Management Integration
- Employee profile data
- Department and designation info
- Salary structure details

## Usage Examples

### Basic Implementation
```tsx
import { PayrollEngine } from "@/components/payroll-engine"

export default function PayrollPage() {
  return <PayrollEngine />
}
```

### Individual Component Usage
```tsx
import { PayrollDashboard, SalaryCalculationScreen } from "@/components"

// Use individual components
function CustomPayrollView() {
  return (
    <div>
      <PayrollDashboard />
      <SalaryCalculationScreen />
    </div>
  )
}
```

## Features Implemented

### ✅ Core Dashboard Features
- [x] Payroll status overview
- [x] Key metrics and statistics
- [x] Alert system for missing data
- [x] Quick action buttons
- [x] Period selection controls

### ✅ Configuration Features
- [x] Month/Year selection
- [x] Calendar details with working days
- [x] Lock/Unlock payroll functionality
- [x] Attendance synchronization
- [x] Processing mode selection
- [x] Component inclusion options

### ✅ Calculation Features
- [x] Employee salary table
- [x] Advanced search and filtering
- [x] Bulk selection and operations
- [x] Status management
- [x] Detailed salary breakdown
- [x] Real-time calculations

### ✅ Additional Features
- [x] Statutory compliance tracking
- [x] Report generation interface
- [x] Workflow management
- [x] Responsive design
- [x] Accessibility features

## Technical Details

### Dependencies
- React 18+ with TypeScript
- Tailwind CSS for styling
- Radix UI components
- Lucide React for icons
- Custom UI component library

### State Management
- React useState for local state
- useEffect for data loading
- Custom hooks for complex logic

### Data Flow
1. **Configuration** → Set period and sync attendance
2. **Calculation** → Process salary calculations
3. **Review** → Validate and approve calculations
4. **Compliance** → Generate statutory returns
5. **Reports** → Download payroll reports

## API Integration Points

### Required API Endpoints
```typescript
// Attendance Data
GET /api/attendance/{month}/{year}
POST /api/attendance/sync

// Payroll Processing
POST /api/payroll/calculate
PUT /api/payroll/approve
GET /api/payroll/status

// Employee Data
GET /api/employees
GET /api/employees/{id}/salary-structure

// Statutory Returns
GET /api/compliance/pf-returns
GET /api/compliance/esi-returns
GET /api/compliance/tds-returns
```

## Accessibility Features

- Keyboard navigation support
- Screen reader friendly
- High contrast mode support
- Focus management
- ARIA labels and descriptions

## Responsive Design

- Mobile-first approach
- Tablet optimization
- Desktop enhancement
- Print-friendly layouts

## Next Steps

1. **API Integration**: Connect with backend services
2. **Real-time Updates**: WebSocket integration for live updates
3. **Advanced Filtering**: More sophisticated search capabilities
4. **Export Features**: Excel, PDF generation
5. **Audit Trail**: Track all payroll changes
6. **Mobile App**: Native mobile application
7. **Automation**: Scheduled payroll processing
8. **Integration**: Connect with accounting systems
