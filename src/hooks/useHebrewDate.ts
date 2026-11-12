import { useCallback, useEffect, useRef, useState } from 'react'
import { convertToHebrew, type HebcalConversion } from '../api/hebcal'
import type { GregorianDate } from '../utils/date'

export interface ConversionRequest {
  date: GregorianDate
  afterSunset: boolean
}

export type ConversionState =
  | { status: 'idle' }
  | { status: 'loading'; request: ConversionRequest }
  | { status: 'success'; request: ConversionRequest; result: HebcalConversion }
  | { status: 'error'; request: ConversionRequest; message: string }

/**
 * Runs Hebcal conversions and tracks loading / result / error.
 * A new conversion cancels the previous one, so a slow earlier response
 * can never overwrite a newer result.
 */
export function useHebrewDate() {
  const [state, setState] = useState<ConversionState>({ status: 'idle' })
  const inFlight = useRef<AbortController | null>(null)

  const convert = useCallback(async (request: ConversionRequest) => {
    inFlight.current?.abort()
    const controller = new AbortController()
    inFlight.current = controller

    setState({ status: 'loading', request })
    try {
      const result = await convertToHebrew(request.date, {
        afterSunset: request.afterSunset,
        signal: controller.signal,
      })
      setState({ status: 'success', request, result })
    } catch (err) {
      if (controller.signal.aborted) return
      console.error('Hebrew date conversion failed', err)
      setState({
        status: 'error',
        request,
        message: 'לא ניתן היה לקבל תשובה משירות Hebcal. בדקו את החיבור ונסו שוב.',
      })
    }
  }, [])

  // Cancel any pending request when the component using the hook unmounts.
  useEffect(() => () => inFlight.current?.abort(), [])

  return { state, convert }
}
