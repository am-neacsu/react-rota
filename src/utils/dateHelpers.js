export function getStartOfWeek(dateStr) {
  const date = new Date(dateStr);
  const day = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust to Monday
  const monday = new Date(date.setDate(diff));
  return monday.toISOString().split('T')[0];
}

export function getWeekDates(startDateStr) {
  const start = new Date(startDateStr);
  const days = [];

  for (let i = 0; i < 7; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    const iso = date.toISOString().split('T')[0]; // format: YYYY-MM-DD
    days.push(iso);
  }

  return days;
}
