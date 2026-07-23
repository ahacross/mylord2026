import {
  add,
  sub,
  differenceInYears,
  differenceInMonths,
  differenceInWeeks,
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  differenceInSeconds,
  endOfYear,
  endOfMonth,
  endOfDay,
  format,
  parse,
  isValid,
  toDate,
  type Duration,
} from 'date-fns'
import { ko } from 'date-fns/locale'
export { ko }

export type DateUnit =
  | 'year'
  | 'years'
  | 'month'
  | 'months'
  | 'week'
  | 'weeks'
  | 'day'
  | 'days'
  | 'hour'
  | 'hours'
  | 'minute'
  | 'minutes'
  | 'second'
  | 'seconds'

const DATE = {
  COMPACT: 'yyyyMMdd',
  DASH: 'yyyy-MM-dd',
  DOT: 'yyyy.MM.dd',
}

const TIME = {
  COMPACT: 'HHmmss',
  COLON: 'HH:mm:ss',
}

export const DATE_TEMPLATE = {
  DATE: {
    ...DATE,
    DASH_DAY: `${DATE.DASH} (E)`,
    DOT_DAY: `${DATE.DOT} (E)`,
  },
  TIME,
  DATETIME: {
    COMPACT: `${DATE.COMPACT}T${TIME.COMPACT}`,
    DOT_COLON: `${DATE.DOT}T${TIME.COLON}`,
    DASH_COLON: `${DATE.DASH}T${TIME.COLON}`,
  },
}

const parseDate = (date?: string | Date | number | null, template?: string): Date => {
  if (!date) return new Date()
  if (date instanceof Date) return date
  if (typeof date === 'string') {
    const trimmed = date.trim()
    if (!trimmed) return new Date()
    if (template) {
      const parsed = parse(trimmed, template, new Date(), { locale: ko })
      if (isValid(parsed)) return parsed
    }
    if (trimmed.length === 8 && /^\d{8}$/.test(trimmed)) {
      const parsed = parse(trimmed, 'yyyyMMdd', new Date(), { locale: ko })
      if (isValid(parsed)) return parsed
    }
    if (trimmed.length === 14 && /^\d{14}$/.test(trimmed)) {
      const parsed = parse(trimmed, 'yyyyMMddHHmmss', new Date(), { locale: ko })
      if (isValid(parsed)) return parsed
    }
    if (trimmed.includes('-')) {
      const fmt = trimmed.includes(':') ? 'yyyy-MM-dd HH:mm:ss' : 'yyyy-MM-dd'
      const parsed = parse(trimmed, fmt, new Date(), { locale: ko })
      if (isValid(parsed)) return parsed
    }
  }
  const result = toDate(date as any)
  return isValid(result) ? result : new Date()
}

const mapUnitToDuration = (amount: number, unit: string): Duration => {
  const u = unit.toLowerCase().replace(/s$/, '')
  switch (u) {
    case 'year':
      return { years: amount }
    case 'month':
      return { months: amount }
    case 'week':
      return { weeks: amount }
    case 'day':
      return { days: amount }
    case 'hour':
      return { hours: amount }
    case 'minute':
      return { minutes: amount }
    case 'second':
      return { seconds: amount }
    default:
      return {}
  }
}

const getDifference = (dateLeft: Date, dateRight: Date, unit: string): number => {
  const u = unit.toLowerCase().replace(/s$/, '')
  switch (u) {
    case 'year':
      return differenceInYears(dateLeft, dateRight)
    case 'month':
      return differenceInMonths(dateLeft, dateRight)
    case 'week':
      return differenceInWeeks(dateLeft, dateRight)
    case 'day':
      return differenceInDays(dateLeft, dateRight)
    case 'hour':
      return differenceInHours(dateLeft, dateRight)
    case 'minute':
      return differenceInMinutes(dateLeft, dateRight)
    case 'second':
      return differenceInSeconds(dateLeft, dateRight)
    default:
      return 0
  }
}

const getEndOf = (date: string | Date | number, unit: string): Date => {
  const d = parseDate(date)
  const u = unit.toLowerCase().replace(/s$/, '')
  switch (u) {
    case 'year':
      return endOfYear(d)
    case 'month':
      return endOfMonth(d)
    case 'day':
      return endOfDay(d)
    default:
      return d
  }
}

export const useDate = {
  getDate: (date?: string | Date | number | null, temp?: string) => parseDate(date, temp),
  plus: (amount: number, unit: DateUnit, date?: string | Date | number | null) =>
    add(parseDate(date), mapUnitToDuration(amount, unit)),
  minus: (amount: number, unit: DateUnit, date?: string | Date | number | null) =>
    sub(parseDate(date), mapUnitToDuration(amount, unit)),
  diff: (date: string | Date | number, unit: DateUnit) =>
    getDifference(new Date(), parseDate(date), unit),
  diff2: (date1: string | Date | number, date2: string | Date | number, unit: DateUnit) =>
    getDifference(parseDate(date1), parseDate(date2), unit),
  endOf: (date: string | Date | number, unit: DateUnit) => getEndOf(date, unit),
  format: (date: string | Date | number | null, template: string) => {
    if (!date) return ''
    const parsed = parseDate(date)
    if (!isValid(parsed)) return ''
    return format(parsed, template, { locale: ko })
  },
}
