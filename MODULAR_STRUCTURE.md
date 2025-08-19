# Payroll Dashboard - Modular Structure

This document outlines the modular structure of the payroll dashboard application.

## Architecture Overview

The payroll dashboard has been refactored into a modular architecture with the following benefits:

- **Separation of Concerns**: Each component handles a specific responsibility
- **Reusability**: Components can be easily reused across different parts of the application
- **Maintainability**: Easier to maintain and update individual features
- **Testability**: Each component can be tested in isolation
- **Scalability**: Easy to add new features without affecting existing code

## Component Structure

### Main Components

#### `/components/sidebar.tsx`
- **Purpose**: Navigation sidebar with collapsible functionality
- **Props**: `activeTab`, `setActiveTab`, `isSidebarCollapsed`, `setIsSidebarCollapsed`, `formatCurrency`, `getTotalNetPay`
- **Features**: Responsive design, mobile-friendly toggle, net pay display

#### `/components/dashboard-header.tsx`
- **Purpose**: Main header with title and total net pay summary
- **Props**: `formatCurrency`, `getTotalNetPay`
- **Features**: Clean layout with company branding and key metrics

#### `/components/employee-management.tsx`
- **Purpose**: Complete employee management interface
- **Props**: `employees`, `formatCurrency`, search and filter states
- **Features**: Employee table, search functionality, filtering, action buttons

### Tab Components

#### `/components/attendance-tab.tsx`
- **Purpose**: Attendance overview with statistics
- **Props**: `attendance`, `formatCurrency`
- **Features**: Leave records, overtime tracking, shift allowances

#### `/components/payroll-tab.tsx`
- **Purpose**: Payroll processing engine interface
- **Props**: `employees`, `payrollCalculations`, `isProcessing`, and processing functions
- **Features**: Payroll calculation, results display, processing status

#### `/components/statutory-tab.tsx`
- **Purpose**: Statutory returns management
- **Props**: `statutoryReturns`, `formatCurrency`, `generateStatutoryReturn`
- **Features**: Return status tracking, generation buttons, due date monitoring

#### `/components/payments-tab.tsx`
- **Purpose**: Payment processing interface
- **Props**: `payrollCalculations`, `formatCurrency`, `getTotalNetPay`
- **Features**: Bank transfer, payslip generation, GL posting

#### `/components/portal-tab.tsx`
- **Purpose**: Employee self-service portal overview
- **Props**: `employees`, `payrollCalculations`
- **Features**: Service availability, usage statistics, portal management

### Modal Components

#### `/components/modals/payroll-results-modal.tsx`
- **Purpose**: Detailed payroll calculation results
- **Props**: `isOpen`, `onClose`, `calculations`, `employees`
- **Features**: Tabular results, calculation breakdown, responsive design

## Usage Example

```tsx
import {
  Sidebar,
  DashboardHeader,
  EmployeeManagement,
  PayrollTab,
  PayrollResultsModal
} from "./components"

// Use components with appropriate props
<Sidebar 
  activeTab={activeTab}
  setActiveTab={setActiveTab}
  // ... other props
/>
```

## File Organization

```
/components/
  ├── index.ts                    # Central export file
  ├── sidebar.tsx                 # Navigation sidebar
  ├── dashboard-header.tsx        # Main header
  ├── employee-management.tsx     # Employee CRUD interface
  ├── attendance-tab.tsx          # Attendance overview
  ├── payroll-tab.tsx            # Payroll processing
  ├── statutory-tab.tsx          # Statutory returns
  ├── payments-tab.tsx           # Payment processing
  ├── portal-tab.tsx             # Employee portal
  └── modals/
      └── payroll-results-modal.tsx  # Results modal
```

## Benefits of This Structure

1. **Clean Imports**: Centralized exports through `components/index.ts`
2. **Single Responsibility**: Each component has a clear, focused purpose
3. **Props Interface**: Well-defined prop interfaces for type safety
4. **Reduced Bundle Size**: Only import what you need
5. **Easy Testing**: Each component can be unit tested independently
6. **Enhanced Readability**: Main dashboard file is now much cleaner and easier to understand

## Future Enhancements

- Add component-level unit tests
- Implement error boundaries for each major section
- Add component documentation with Storybook
- Consider implementing lazy loading for tab components
- Add analytics tracking at the component level
