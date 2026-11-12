import type { GregorianDate } from '../utils/date'

/**
 * Client for the Hebcal Hebrew Date Converter REST API.
 * Docs: https://www.hebcal.com/home/219/hebrew-date-converter-rest-api
 */
export const HEBCAL_CONVERTER_URL = 'https://www.hebcal.com/converter'

/** The JSON returned by the converter for a Gregorian → Hebrew request. */
export interface HebcalConversion {
  gy: number
  gm: number
  gd: number
  afterSunset: boolean
  hy: number
  /** Transliterated month name, e.g. "Kislev" or "Adar II". */
  hm: string
  hd: number
  /** Full Hebrew date with niqqud, e.g. "ב׳ בְּכִסְלֵו תשפ״ז". */
  hebrew: string
  heDateParts: { y: string; m: string; d: string }
  /** Parasha / holidays falling on this date, e.g. ["Parashat Toldot"]. */
  events?: string[]
}

export class HebcalError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'HebcalError'
  }
}

export function buildConverterUrl(date: GregorianDate, afterSunset = false): string {
  const params = new URLSearchParams({
    cfg: 'json',
    gy: String(date.year),
    gm: String(date.month),
    gd: String(date.day),
    g2h: '1',
  })
  // The Hebrew day starts at sunset; gs=on converts as the evening of the given day.
  if (afterSunset) params.set('gs', 'on')
  return `${HEBCAL_CONVERTER_URL}?${params}`
}

/** Converts a Gregorian date to a Hebrew date using Hebcal. */
export async function convertToHebrew(
  date: GregorianDate,
  options: { afterSunset?: boolean; signal?: AbortSignal } = {},
): Promise<HebcalConversion> {
  const response = await fetch(buildConverterUrl(date, options.afterSunset), {
    signal: options.signal,
  })
  if (!response.ok) {
    throw new HebcalError(`Hebcal responded with HTTP ${response.status}`)
  }

  const data = (await response.json()) as Partial<HebcalConversion> & { error?: string }
  if (data.error) throw new HebcalError(data.error)
  if (typeof data.hebrew !== 'string') {
    throw new HebcalError('Unexpected response from Hebcal')
  }
  return data as HebcalConversion
}
