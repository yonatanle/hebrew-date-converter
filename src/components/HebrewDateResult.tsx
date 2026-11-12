import type { ConversionState } from '../hooks/useHebrewDate'
import { formatDMY } from '../utils/date'

interface HebrewDateResultProps {
  state: ConversionState
  onRetry: () => void
}

export function HebrewDateResult({ state, onRetry }: HebrewDateResultProps) {
  if (state.status === 'idle') return null

  const { date, afterSunset } = state.request
  const gregorian = formatDMY(date) + (afterSunset ? ' (אחרי השקיעה)' : '')

  return (
    <section className="result" aria-live="polite" aria-busy={state.status === 'loading'}>
      <p className="gregorian">{gregorian}</p>

      {state.status === 'loading' && <p className="muted">ממיר…</p>}

      {state.status === 'error' && (
        <>
          <p className="error" role="alert">
            {state.message}
          </p>
          <button type="button" className="retry" onClick={onRetry}>
            נסו שוב
          </button>
        </>
      )}

      {state.status === 'success' && (
        <>
          <p className="hebrew" data-testid="hebrew-date">
            {state.result.hebrew}
          </p>
          <p className="transliterated">
            {state.result.hd} {state.result.hm} {state.result.hy}
          </p>
          {state.result.events && state.result.events.length > 0 && (
            <ul className="events">
              {state.result.events.map((event) => (
                <li key={event}>{event}</li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  )
}
