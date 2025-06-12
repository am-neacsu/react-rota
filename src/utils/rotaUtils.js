export function generateRotaForDepartment(users = [], shifts = [], weekStartDate) {
  const rota = {};
  const weekKey = new Date(weekStartDate).toISOString().split('T')[0];
  rota[weekKey] = {};

  const weekDayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  users.forEach(user => {
    const userId = user.id;
    const assigned = {};
    const hoursNeeded = parseInt(user.contractedHours || 40, 10);

    const prefs = user.preferences || {};
    const daysOff = prefs.daysOff || [];
    const shiftPref = prefs.preferredShift;
    const fixedShiftEnabled = prefs.fixedShiftEnabled;
    const fixedShiftId = prefs.fixedShiftId;

    let totalHours = 0;

    let validShifts = shifts;

    if (fixedShiftEnabled && fixedShiftId) {
      validShifts = shifts.filter(s => s.id === fixedShiftId);
    } else if (shiftPref === 'day') {
      validShifts = shifts.filter(s => parseInt(s.start.split(':')[0], 10) <= 14);
    } else if (shiftPref === 'night') {
      validShifts = shifts.filter(s => parseInt(s.start.split(':')[0], 10) >= 18);
    }

    const grouped = groupByDuration(validShifts);
    const [duration] = Object.keys(grouped);
    const availableShifts = grouped[duration] || [];

    for (let i = 0; i < 7; i++) {
      const dayName = weekDayNames[i];

      if (daysOff.includes(dayName) || totalHours >= hoursNeeded) {
        assigned[dayName] = '';
        continue;
      }

      const shift = availableShifts[totalHours % availableShifts.length];
      if (!shift) {
        assigned[dayName] = '';
        continue;
      }

      assigned[dayName] = shift.id;
      totalHours += parseInt(duration);
    }

    rota[weekKey][userId] = assigned;
  });

  return rota;
}

export function getWeekDates(start) {
  const startDate = new Date(start);
  const days = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    days.push(date.toISOString().split('T')[0]);
  }
  return days;
}

export function groupByDuration(shifts) {
  const map = {};
  for (let s of shifts) {
    const dur = getDuration(s);
    if (!map[dur]) map[dur] = [];
    map[dur].push(s);
  }
  return map;
}

export function getDuration(shift) {
  const [sh, sm] = shift.start.split(':').map(Number);
  const [eh, em] = shift.end.split(':').map(Number);
  let mins = (eh * 60 + em) - (sh * 60 + sm);
  if (mins < 0) mins += 24 * 60;
  return Math.round(mins / 60);
}
