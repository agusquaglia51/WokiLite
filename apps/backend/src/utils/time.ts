import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezonePlugin from "dayjs/plugin/timezone.js";

dayjs.extend(utc);
dayjs.extend(timezonePlugin);

export function parseTime(timeStr: string): { hour: number; minute: number } {
  const [hourStr, minuteStr] = timeStr.split(":");
  const hour = Number(hourStr) || 0;
  const minute = Number(minuteStr) || 0;
  return { hour, minute };
}


export function isWithinShifts(
  dateTime: Date,
  shifts?: Array<{ start: string; end: string }>
): boolean {
  if (!shifts || shifts.length === 0) return true;

  const hour = dateTime.getHours();
  const minute = dateTime.getMinutes();
  const totalMinutes = hour * 60 + minute;

  return shifts.some(shift => {
    const start = parseTime(shift.start);
    const end = parseTime(shift.end);
    const startMinutes = start.hour * 60 + start.minute;
    const endMinutes = end.hour * 60 + end.minute;

    return totalMinutes >= startMinutes && totalMinutes < endMinutes;
  });
}

export function generateTimeSlots(
  date: string,
  timezone: string,
  shifts?: Array<{ start: string; end: string }>
): Date[] {
  const slots: Date[] = [];
  const slotIntervalMinutes = 15;

  if (!shifts || shifts.length === 0) {
    const startOfDay = dayjs.tz(`${date}T00:00`, timezone);
    const endOfDay = dayjs.tz(`${date}T23:59`, timezone);

    let current = startOfDay;
    while (current.isBefore(endOfDay)) {
      slots.push(current.toDate());
      current = current.add(slotIntervalMinutes, "minute");
    }
    return slots;
  }

  for (const shift of shifts) {
    const shiftStart = dayjs.tz(`${date}T${shift.start}`, timezone);
    const shiftEnd = dayjs.tz(`${date}T${shift.end}`, timezone);

    let current = shiftStart;
    while (current.isBefore(shiftEnd)) {
      slots.push(current.toDate());
      current = current.add(slotIntervalMinutes, "minute");
    }
  }

  return slots;
}

export function doIntervalsOverlap(
  start1: Date,
  end1: Date,
  start2: Date,
  end2: Date
): boolean {
  // [start, end) intervals
  return start1 < end2 && start2 < end1;
}