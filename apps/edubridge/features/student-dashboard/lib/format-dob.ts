const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

/** Format a `YYYY-MM-DD` date without timezone drift. */
export function formatDob(isoDate: string): string {
  const [year, month, day] = isoDate.split("-");
  const monthIndex = Number(month) - 1;
  const monthName = MONTHS[monthIndex];
  if (!year || !day || !monthName) return isoDate;
  return `${Number(day)} ${monthName} ${year}`;
}
