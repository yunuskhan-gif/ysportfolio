export const toISTDate = (date: Date | string | number): Date => {
  const safeDateString = (typeof date === 'string' && date.includes('T') && !date.includes('Z') && !date.includes('+')) 
    ? date + 'Z' 
    : date;

  const d = new Date(safeDateString);
  if (isNaN(d.getTime())) return new Date();

  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hourCycle: "h23",
  });

  const parts = formatter.formatToParts(d);
  const getPart = (type: string) =>
    parseInt(parts.find((p) => p.type === type)?.value || "0");

  return new Date(
    getPart("year"),
    getPart("month") - 1,
    getPart("day"),
    getPart("hour"),
    getPart("minute"),
    getPart("second")
  );
};

export const toYYYYMMDD = (date: Date | string | number): string => {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export const apiDateToYYYYMMDD = (date: Date | string | number): string => {
  const istDate = toISTDate(date)
  const year = istDate.getFullYear()
  const month = String(istDate.getMonth() + 1).padStart(2, "0")
  const day = String(istDate.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export const getTime24 = (date: Date | string | number): string => {
  const d = new Date(date)
  const hh = String(d.getHours()).padStart(2, "0")
  const mm = String(d.getMinutes()).padStart(2, "0")
  return `${hh}:${mm}`
}

export function formatDate(day: number, month: number, year: number): string {
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  })
}

export const DayDataTimeFormat = (isoString: string): string => {
  if (!isoString) return "N/A"
  const date = new Date(isoString)
  if (isNaN(date.getTime())) return "Invalid Date"
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const formatter = new Intl.DateTimeFormat("en-IN", {
    timeZone: timezone,
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })
  const parts = formatter.formatToParts(date)
  const dayName = parts.find(p => p.type === "weekday")?.value
  const day = parts.find(p => p.type === "day")?.value
  const month = parts.find(p => p.type === "month")?.value
  const yearPart = parts.find(p => p.type === "year")?.value
  const hour = parts.find(p => p.type === "hour")?.value
  const minute = parts.find(p => p.type === "minute")?.value
  const second = parts.find(p => p.type === "second")?.value
  return `${dayName}, ${day} ${month} ${yearPart} at ${hour}:${minute}:${second}`
}


export function LocalTimeToUtc(input: Date | string, timeZone: string): Date {
  let baseDate: Date;
  if (typeof input === 'string') {
    const normalizedString = input.endsWith('Z') ? input : `${input}Z`;
    baseDate = new Date(normalizedString);
  } else {
    baseDate = new Date(Date.UTC(
      input.getFullYear(),
      input.getMonth(),
      input.getDate(),
      input.getHours(),
      input.getMinutes(),
      input.getSeconds(),
      input.getMilliseconds()
    ));
  }

  if (isNaN(baseDate.getTime())) {
    throw new Error(`Invalid date provided: ${input}`);
  }
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric', month: 'numeric', day: 'numeric',
    hour: 'numeric', minute: 'numeric', second: 'numeric',
    hourCycle: 'h23',
    fractionalSecondDigits: 3
  });
  const parts = formatter.formatToParts(baseDate);
  const getPart = (type: string) => {
    const part = parts.find(p => p.type === type);
    return part ? parseInt(part.value, 10) : 0;
  };

  const shiftedUtcTime = Date.UTC(
    getPart('year'),
    getPart('month') - 1,
    getPart('day'),
    getPart('hour'),
    getPart('minute'),
    getPart('second'),
    getPart('fractionalSecond')
  );

  const offsetDiff = baseDate.getTime() - shiftedUtcTime;
  return new Date(baseDate.getTime() + offsetDiff);
}

const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

export function getDaysInMonth(month: number, year: number): number {
  if (month === 2 && isLeapYear(year)) {
    return 29;
  }
  else return daysInMonth[month - 1];
}