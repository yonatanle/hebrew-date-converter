/** A Gregorian calendar date. `month` is 1-based (1 = January). */
export interface GregorianDate {
  year: number
  month: number
  day: number
}

const pad2 = (n: number) => String(n).padStart(2, '0')

/** Formats a date as dd/mm/yyyy. */
export function formatDMY({ year, month, day }: GregorianDate): string {
  return `${pad2(day)}/${pad2(month)}/${year}`
}

/** Parses dd/mm/yyyy (day and month may be one digit). Returns null for malformed or non-existent dates. */
export function parseDMY(value: string): GregorianDate | null {
  const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(value.trim())
  if (!match) return null

  const day = Number(match[1])
  const month = Number(match[2])
  const year = Number(match[3])
  if (year < 1) return null

  // Round-trip through Date to reject things like 31/02 or 29/02 in a non-leap year.
  const probe = new Date(Date.UTC(2000, month - 1, day))
  probe.setUTCFullYear(year)
  if (
    probe.getUTCFullYear() !== year ||
    probe.getUTCMonth() !== month - 1 ||
    probe.getUTCDate() !== day
  ) {
    return null
  }
  return { year, month, day }
}

/** Formats a date as yyyy-mm-dd, the value format of <input type="date">. */
export function toISODate({ year, month, day }: GregorianDate): string {
  return `${String(year).padStart(4, '0')}-${pad2(month)}-${pad2(day)}`
}

/** Parses yyyy-mm-dd (from <input type="date">). */
export function fromISODate(value: string): GregorianDate | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return null
  return parseDMY(`${match[3]}/${match[2]}/${match[1]}`)
}

/**
 * Keeps only digits and inserts the slashes while the user types,
 * so typing "15031997" yields "15/03/1997".
 */
export function maskDMY(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 8)
  let out = digits.slice(0, 2)
  if (digits.length > 2) out += '/' + digits.slice(2, 4)
  if (digits.length > 4) out += '/' + digits.slice(4)
  return out
}

/** Today's date in the user's local time zone. */
export function today(now: Date = new Date()): GregorianDate {
  return { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() }
}
