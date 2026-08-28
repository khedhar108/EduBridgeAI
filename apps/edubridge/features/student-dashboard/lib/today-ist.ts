/** Calendar date in India — attendance registers follow the school day, not UTC. */
export function todayIst(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(
    new Date(),
  );
}
