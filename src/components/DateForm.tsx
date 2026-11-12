import { useId, useRef, useState, type FormEvent } from 'react'
import {
  formatDMY,
  fromISODate,
  maskDMY,
  parseDMY,
  toISODate,
  type GregorianDate,
} from '../utils/date'
import type { ConversionRequest } from '../hooks/useHebrewDate'

interface DateFormProps {
  initialDate: GregorianDate
  loading: boolean
  onSubmit: (request: ConversionRequest) => void
}

export function DateForm({ initialDate, loading, onSubmit }: DateFormProps) {
  const [text, setText] = useState(() => formatDMY(initialDate))
  const [afterSunset, setAfterSunset] = useState(false)
  const [invalid, setInvalid] = useState(false)
  const pickerRef = useRef<HTMLInputElement>(null)
  const inputId = useId()
  const errorId = useId()

  function submit(date: GregorianDate | null, sunset = afterSunset) {
    if (!date) {
      setInvalid(true)
      return
    }
    setInvalid(false)
    onSubmit({ date, afterSunset: sunset })
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    submit(parseDMY(text))
  }

  function openPicker() {
    const picker = pickerRef.current
    if (!picker) return
    const current = parseDMY(text)
    if (current) picker.value = toISODate(current)
    try {
      picker.showPicker()
    } catch {
      picker.click() // Older browsers without showPicker()
    }
  }

  function handlePicked(value: string) {
    const date = fromISODate(value)
    if (!date) return
    setText(formatDMY(date))
    submit(date)
  }

  return (
    <form className="date-form" onSubmit={handleSubmit} noValidate>
      <label htmlFor={inputId}>תאריך לועזי</label>
      <div className="date-row">
        <input
          id={inputId}
          className="date-input"
          type="text"
          inputMode="numeric"
          placeholder="dd/mm/yyyy"
          maxLength={10}
          autoComplete="off"
          value={text}
          aria-invalid={invalid}
          aria-describedby={invalid ? errorId : undefined}
          onChange={(e) => {
            setText(maskDMY(e.target.value))
            setInvalid(false)
          }}
        />
        <button
          type="button"
          className="picker-button"
          onClick={openPicker}
          aria-label="בחירה מלוח שנה"
          title="בחירה מלוח שנה"
        >
          📅
        </button>
        <input
          ref={pickerRef}
          type="date"
          className="native-picker"
          tabIndex={-1}
          aria-hidden="true"
          onChange={(e) => handlePicked(e.target.value)}
        />
      </div>
      {invalid && (
        <p id={errorId} className="field-error" role="alert">
          יש להזין תאריך תקין בתבנית dd/mm/yyyy
        </p>
      )}

      <label className="checkbox">
        <input
          type="checkbox"
          checked={afterSunset}
          onChange={(e) => setAfterSunset(e.target.checked)}
        />
        אחרי השקיעה (היום העברי מתחיל בערב)
      </label>

      <button type="submit" className="submit" disabled={loading}>
        {loading ? 'ממיר…' : 'המר'}
      </button>
    </form>
  )
}
