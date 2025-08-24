# Responsive Design Guide

This document outlines the responsive design system implemented across the payroll dashboard application.

## Overview

The application has been redesigned to be fully responsive across all device sizes:
- **Mobile**: < 768px (portrait and landscape)
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px+

## Core Components

### 1. useResponsive Hook

The main responsive hook that provides breakpoint information:

```typescript
import { useResponsive } from "@/hooks/use-responsive"

const { isMobile, isTablet, isDesktop } = useResponsive()
```

## Layout Patterns

### 1. Mobile-First Approach

Always start with mobile design and scale up:

```typescript
// ✅ Good - Mobile first
className="p-3 sm:p-4 md:p-6"

// ❌ Bad - Desktop first
className="p-6 md:p-4 sm:p-3"
```

### 2. Responsive Grids

Use responsive grid classes for different breakpoints:

```typescript
// Single column on mobile, 2 on tablet, 3+ on desktop
className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6"
```

### 3. Responsive Typography

Scale text sizes appropriately:

```typescript
className="text-sm sm:text-base md:text-lg lg:text-xl"
```

### 4. Responsive Spacing

Adjust spacing based on screen size:

```typescript
className="space-y-2 sm:space-y-3 md:space-y-4 lg:space-y-6"
```

## Component Guidelines

### 1. Tables

- Use horizontal scroll on mobile
- Consider card layouts for mobile
- Ensure minimum touch target sizes (44px)

### 2. Forms

- Stack form fields vertically on mobile
- Use full-width inputs on mobile
- Group related fields in rows on larger screens

### 3. Navigation

- Use hamburger menu on mobile
- Collapse sidebar on mobile
- Provide clear touch targets

### 4. Cards

- Adjust padding based on screen size
- Use appropriate grid layouts
- Ensure content is readable on all devices

## Breakpoint Strategy

### Mobile (< 768px)
- Single column layouts
- Stacked navigation
- Full-width components
- Touch-friendly interactions

### Tablet (768px - 1024px)
- Two-column grids
- Side navigation
- Medium spacing
- Touch and mouse support

### Desktop (1024px+)
- Multi-column layouts
- Sidebar navigation
- Comfortable spacing
- Mouse-optimized interactions

## Testing

### 1. Device Testing
- Test on actual devices when possible
- Use browser dev tools for different screen sizes
- Test both portrait and landscape orientations

### 2. Breakpoint Testing
- Test at exact breakpoint boundaries
- Ensure smooth transitions between breakpoints
- Verify content doesn't break at edge cases

### 3. Content Testing
- Ensure text is readable on all devices
- Verify images scale appropriately
- Test form interactions on touch devices

## Common Patterns

### 1. Responsive Header
```typescript
<div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
  <div className="flex-1">
    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Title</h1>
  </div>
  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
    <Button className="w-full sm:w-auto">Action</Button>
  </div>
</div>
```

### 2. Responsive Table
```typescript
<div className="overflow-x-auto -mx-3 sm:mx-0">
  <div className="inline-block min-w-full align-middle">
    <Table>...</Table>
  </div>
</div>
```

### 3. Responsive Cards
```typescript
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
  <Card className="p-3 sm:p-4 md:p-6">...</Card>
</div>
```

## Performance Considerations

### 1. Conditional Rendering
- Use responsive hooks to conditionally render components
- Avoid rendering hidden content on mobile

### 2. Image Optimization
- Use responsive images with appropriate sizes
- Implement lazy loading for better performance

### 3. CSS Optimization
- Use utility classes to avoid duplicate CSS
- Leverage CSS Grid and Flexbox for responsive layouts

## Accessibility

### 1. Touch Targets
- Ensure minimum 44px touch targets on mobile
- Provide adequate spacing between interactive elements

### 2. Text Readability
- Maintain minimum 16px font size on mobile
- Ensure sufficient contrast ratios

### 3. Navigation
- Provide clear navigation patterns on all devices
- Use semantic HTML for better screen reader support

## Future Enhancements

### 1. Advanced Breakpoints
- Add more granular breakpoints for specific use cases
- Implement container queries for component-level responsiveness

### 2. Performance Monitoring
- Track performance metrics across different devices
- Implement responsive performance budgets

### 3. User Experience
- Gather user feedback on mobile experience
- Implement progressive enhancement strategies
