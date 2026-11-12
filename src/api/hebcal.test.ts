import { afterEach, describe, expect, it, vi } from 'vitest'
import { buildConverterUrl, convertToHebrew, HebcalError } from './hebcal'

const date = { year: 2026, month: 11, day: 12 }

function mockFetch(body: unknown, init: { status?: number } = {}) {
  const fetchMock = vi.fn().mockResolvedValue(
    new Response(JSON.stringify(body), { status: init.status ?? 200 }),
  )
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('buildConverterUrl', () => {
  it('builds a Gregorian → Hebrew JSON request', () => {
    const url = new URL(buildConverterUrl(date))
    expect(url.origin + url.pathname).toBe('https://www.hebcal.com/converter')
    expect(Object.fromEntries(url.searchParams)).toEqual({
      cfg: 'json',
      gy: '2026',
      gm: '11',
      gd: '12',
      g2h: '1',
    })
  })

  it('adds gs=on for after sunset', () => {
    expect(new URL(buildConverterUrl(date, true)).searchParams.get('gs')).toBe('on')
  })
})

describe('convertToHebrew', () => {
  it('returns the parsed Hebcal response', async () => {
    const body = {
      gy: 2026,
      gm: 11,
      gd: 12,
      afterSunset: false,
      hy: 5787,
      hm: 'Kislev',
      hd: 2,
      hebrew: 'ב׳ בְּכִסְלֵו תשפ״ז',
      heDateParts: { y: 'תשפ״ז', m: 'כסלו', d: 'ב׳' },
      events: ['Parashat Toldot'],
    }
    const fetchMock = mockFetch(body)

    await expect(convertToHebrew(date)).resolves.toEqual(body)
    expect(fetchMock).toHaveBeenCalledWith(buildConverterUrl(date), { signal: undefined })
  })

  it('throws on an HTTP error', async () => {
    mockFetch({}, { status: 500 })
    await expect(convertToHebrew(date)).rejects.toThrow(HebcalError)
  })

  it('throws when Hebcal reports an error', async () => {
    mockFetch({ error: 'Gregorian year cannot be less than 1' })
    await expect(convertToHebrew(date)).rejects.toThrow('Gregorian year cannot be less than 1')
  })
})
