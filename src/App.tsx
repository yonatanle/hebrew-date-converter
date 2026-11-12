import { useEffect, useState } from 'react'
import { DateForm } from './components/DateForm'
import { HebrewDateResult } from './components/HebrewDateResult'
import { useHebrewDate } from './hooks/useHebrewDate'
import { today } from './utils/date'

export default function App() {
  const [initialDate] = useState(() => today())
  const { state, convert } = useHebrewDate()

  // Show today's Hebrew date as soon as the page opens.
  useEffect(() => {
    convert({ date: initialDate, afterSunset: false })
  }, [convert, initialDate])

  return (
    <main className="card">
      <h1>ממיר תאריך לועזי לעברי</h1>
      <p className="subtitle">בחרו תאריך לועזי וקבלו את התאריך העברי המקביל.</p>

      <DateForm
        initialDate={initialDate}
        loading={state.status === 'loading'}
        onSubmit={convert}
      />

      <HebrewDateResult
        state={state}
        onRetry={() => state.status !== 'idle' && convert(state.request)}
      />

      <footer className="credit">
        הנתונים מתקבלים מ־
        <a href="https://www.hebcal.com/home/219/hebrew-date-converter-rest-api" target="_blank" rel="noreferrer">
          Hebcal
        </a>
      </footer>
    </main>
  )
}
