import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'

function hebcalResponse(url: string) {
  const params = new URL(url).searchParams
  const key = `${params.get('gd')}/${params.get('gm')}/${params.get('gy')}${params.get('gs') ? '+sunset' : ''}`
  const answers: Record<string, object> = {
    '12/11/2026': { hebrew: 'ב׳ בְּכִסְלֵו תשפ״ז', hd: 2, hm: 'Kislev', hy: 5787, events: ['Parashat Toldot'] },
    '15/3/1997': { hebrew: 'ו׳ בַּאֲדָר ב׳ תשנ״ז', hd: 6, hm: 'Adar II', hy: 5757 },
    '15/3/1997+sunset': { hebrew: 'ז׳ בַּאֲדָר ב׳ תשנ״ז', hd: 7, hm: 'Adar II', hy: 5757 },
  }
  return answers[key] ?? { error: 'unexpected date ' + key }
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date(2026, 10, 12, 10, 0))
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) => new Response(JSON.stringify(hebcalResponse(url)))),
  )
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('App', () => {
  it("shows today's date in dd/mm/yyyy and its Hebrew date on load", async () => {
    render(<App />)
    expect(screen.getByLabelText('תאריך לועזי')).toHaveValue('12/11/2026')
    expect(await screen.findByText('ב׳ בְּכִסְלֵו תשפ״ז')).toBeInTheDocument()
    expect(screen.getByText('Parashat Toldot')).toBeInTheDocument()
  })

  it('converts a typed date, with and without sunset', async () => {
    const user = userEvent.setup()
    render(<App />)
    await screen.findByText('ב׳ בְּכִסְלֵו תשפ״ז')

    const input = screen.getByLabelText('תאריך לועזי')
    await user.clear(input)
    await user.type(input, '15031997')
    expect(input).toHaveValue('15/03/1997')

    await user.click(screen.getByRole('button', { name: 'המר' }))
    expect(await screen.findByText('ו׳ בַּאֲדָר ב׳ תשנ״ז')).toBeInTheDocument()
    expect(screen.getByText('15/03/1997')).toBeInTheDocument()

    await user.click(screen.getByLabelText(/אחרי השקיעה/))
    await user.click(screen.getByRole('button', { name: 'המר' }))
    expect(await screen.findByText('ז׳ בַּאֲדָר ב׳ תשנ״ז')).toBeInTheDocument()
  })

  it('rejects an invalid date without calling Hebcal', async () => {
    const user = userEvent.setup()
    render(<App />)
    await screen.findByText('ב׳ בְּכִסְלֵו תשפ״ז')
    vi.mocked(fetch).mockClear()

    const input = screen.getByLabelText('תאריך לועזי')
    await user.clear(input)
    await user.type(input, '31022024')
    await user.click(screen.getByRole('button', { name: 'המר' }))

    expect(screen.getByRole('alert')).toHaveTextContent('dd/mm/yyyy')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(fetch).not.toHaveBeenCalled()
  })

  it('shows an error with a retry button when Hebcal is unreachable', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new TypeError('Failed to fetch'))
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const user = userEvent.setup()
    render(<App />)

    expect(await screen.findByText(/שירות Hebcal/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'נסו שוב' }))
    expect(await screen.findByText('ב׳ בְּכִסְלֵו תשפ״ז')).toBeInTheDocument()
  })
})
