import { describe, expect, it } from 'vitest'
import { formatDMY, fromISODate, maskDMY, parseDMY, toISODate, today } from './date'

describe('formatDMY', () => {
  it('pads day and month to two digits', () => {
    expect(formatDMY({ year: 2026, month: 3, day: 5 })).toBe('05/03/2026')
  })
})

describe('parseDMY', () => {
  it('parses a valid dd/mm/yyyy date', () => {
    expect(parseDMY('15/03/1997')).toEqual({ year: 1997, month: 3, day: 15 })
  })

  it('accepts single-digit day and month', () => {
    expect(parseDMY('1/2/2024')).toEqual({ year: 2024, month: 2, day: 1 })
  })

  it('accepts 29/02 in a leap year only', () => {
    expect(parseDMY('29/02/2024')).toEqual({ year: 2024, month: 2, day: 29 })
    expect(parseDMY('29/02/2023')).toBeNull()
  })

  it.each(['31/02/2024', '00/01/2024', '10/13/2024', '2024-03-15', '15/03/97', '', 'abc'])(
    'rejects %j',
    (value) => {
      expect(parseDMY(value)).toBeNull()
    },
  )
})

describe('ISO conversion for the native date picker', () => {
  it('round-trips through yyyy-mm-dd', () => {
    const date = { year: 1997, month: 3, day: 15 }
    expect(toISODate(date)).toBe('1997-03-15')
    expect(fromISODate('1997-03-15')).toEqual(date)
  })
})

describe('maskDMY', () => {
  it('inserts slashes while typing digits', () => {
    expect(maskDMY('1')).toBe('1')
    expect(maskDMY('150')).toBe('15/0')
    expect(maskDMY('15031997')).toBe('15/03/1997')
  })

  it('drops non-digits and extra digits', () => {
    expect(maskDMY('15-03-1997999')).toBe('15/03/1997')
  })
})

describe('today', () => {
  it('uses the local calendar date', () => {
    expect(today(new Date(2026, 10, 12, 23, 30))).toEqual({ year: 2026, month: 11, day: 12 })
  })
})
