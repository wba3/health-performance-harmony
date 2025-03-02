// Convert minutes to hours and minutes format (e.g., 92 -> "1h 32m")
export const formatMinutesToHoursAndMinutes = (minutes: number | undefined): string => {
  if (minutes === undefined) return "N/A";
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins}m`;
  }
  
  return `${hours}h ${mins}m`;
};

// Format date to a readable string (e.g., "Today, May 15, 2023")
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  // Check if the date is today
  if (date.toDateString() === today.toDateString()) {
    return `Today, ${date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;
  }
  
  // Check if the date is yesterday
  if (date.toDateString() === yesterday.toDateString()) {
    return `Yesterday, ${date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;
  }
  
  // Otherwise, return the date
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
};

// Format a number with unit (e.g., 32.5 "km")
export const formatWithUnit = (value: number | undefined, unit: string): string => {
  if (value === undefined) return "N/A";
  return `${value} ${unit}`;
};

// Calculate percentage change between two values (for trend indicators)
export const calculatePercentageChange = (current: number, previous: number): number => {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};
