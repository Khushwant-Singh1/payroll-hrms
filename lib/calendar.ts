// lib/calendar.ts

export interface Holiday {
  date: string; // YYYY-MM-DD format
  name: string;
}

export interface CustomHoliday {
  date: number; // Day of the month
  name: string;
}

export interface MonthDetails {
  workingDays: number;
  weekendDays: number;
  totalDaysInMonth: number;
  holidays: Array<Holiday & { type: 'predefined' | 'custom' }>;
}

// NOTE: In a production app, this data should come from an API.
// This structure is more accurate as it defines holidays per year.
const PREDEFINED_HOLIDAYS: Record<number, Holiday[]> = {
  2024: [
    { date: "2024-01-26", name: "Republic Day" },
    { date: "2024-03-25", name: "Holi" },
    { date: "2024-08-15", name: "Independence Day" },
    { date: "2024-10-02", name: "Gandhi Jayanti" },
    { date: "2024-10-31", name: "Diwali" },
    { date: "2024-12-25", name: "Christmas" },
  ],
  2025: [
    { date: "2025-01-26", name: "Republic Day" },
    { date: "2025-03-14", name: "Holi" },
    { date: "2025-08-15", name: "Independence Day" }, // This is a Friday
    { date: "2025-10-02", name: "Gandhi Jayanti" },
    { date: "2025-10-21", name: "Diwali" },
    { date: "2025-12-25", name: "Christmas" },
  ],
  2026: [
    { date: "2026-01-26", name: "Republic Day" },
    { date: "2026-03-04", name: "Holi" },
    { date: "2026-08-15", name: "Independence Day" },
    { date: "2026-10-02", name: "Gandhi Jayanti" },
    { date: "2026-11-08", name: "Diwali" },
    { date: "2026-12-25", name: "Christmas" },
  ],
};

/**
 * Simulates fetching holidays from an API for a given year.
 */
function getHolidaysForYear(year: number): Holiday[] {
  return PREDEFINED_HOLIDAYS[year] || [];
}

/**
 * Calculates all calendar details for a given month and year.
 * @param year - The full year (e.g., 2025).
 * @param monthIndex - The month index (0-11).
 * @param customHolidays - An array of custom holidays for the month.
 * @returns An object with detailed calendar data for the month.
 */
export function getMonthDetails(
  year: number,
  monthIndex: number,
  customHolidays: CustomHoliday[] = []
): MonthDetails {
  const totalDaysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const predefinedHolidaysForYear = getHolidaysForYear(year);

  let workingDays = 0;
  let weekendDays = 0;
  const holidays: MonthDetails['holidays'] = [];

  for (let day = 1; day <= totalDaysInMonth; day++) {
    const date = new Date(year, monthIndex, day);
    const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday

    // Check for weekends
    if (dayOfWeek === 0 || dayOfWeek === 7) {
      weekendDays++;
      continue; // Skip to next day
    }

    // Check for predefined holidays
    const dateString = date.toISOString().split('T')[0]; // Format to "YYYY-MM-DD"
    const predefinedHoliday = predefinedHolidaysForYear.find(h => h.date === dateString);
    if (predefinedHoliday) {
      holidays.push({ ...predefinedHoliday, type: 'predefined' });
      continue;
    }

    // Check for custom holidays
    const customHoliday = customHolidays.find(h => h.date === day);
    if (customHoliday) {
      const customHolidayDateString = new Date(year, monthIndex, day).toISOString().split('T')[0];
      holidays.push({ date: customHolidayDateString, name: customHoliday.name, type: 'custom' });
      continue;
    }
    
    // If not a weekend or holiday, it's a working day
    workingDays++;
  }

  return { workingDays, weekendDays, totalDaysInMonth, holidays };
}