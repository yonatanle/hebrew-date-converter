# Hebrew Date Converter

A React app (Vite + TypeScript) that takes a Gregorian date in `dd/mm/yyyy` format and shows the matching Hebrew date,
using the [Hebcal Hebrew Date Converter REST API](https://www.hebcal.com/home/219/hebrew-date-converter-rest-api).

## Getting started

Requires Node.js 18 or later.

```bash
npm install      # install dependencies
npm run dev      # start the dev server at http://localhost:5173
npm test         # run the tests
npm run build    # production build into dist/
npm run preview  # serve the production build locally
```

## Features

- **Date input in `dd/mm/yyyy`:** slashes are added automatically while typing, and a date can also be picked from a calendar (📅).
- **Validation:** dates that don't exist (e.g. `31/02/2024`) are rejected before any request is sent.
- **"After sunset" option:** the Hebrew day begins at sunset, so this sends `gs=on` to the API.
- **Result:** the Hebrew date (e.g. "ב׳ בְּכִסְלֵו תשפ״ז"), its English transliteration, and the weekly Torah portion or holiday, if any.
- **Loading and error states:** an error message with a "Try again" button is shown when the service is unavailable.
- **Today by default:** today's date is converted as soon as the page opens.

## Project structure

```
src/
  api/hebcal.ts                    Hebcal client: URL building, response types, error handling
  utils/date.ts                    Parsing, formatting and validating dd/mm/yyyy dates
  hooks/useHebrewDate.ts           Conversion state (loading / success / error), cancels stale requests
  components/DateForm.tsx          The date form
  components/HebrewDateResult.tsx  Displays the result
  App.tsx                          Wires the components together
```

## API usage

```
GET https://www.hebcal.com/converter?cfg=json&gy=2026&gm=11&gd=12&g2h=1
```

| Parameter | Meaning |
|---|---|
| `cfg=json` | Return JSON |
| `gy`, `gm`, `gd` | Gregorian year, month and day |
| `g2h=1` | Convert Gregorian → Hebrew |
| `gs=on` | After sunset (sent only when the option is checked) |

Example response:

```json
{
  "gy": 2026, "gm": 11, "gd": 12, "afterSunset": false,
  "hy": 5787, "hm": "Kislev", "hd": 2,
  "hebrew": "ב׳ בְּכִסְלֵו תשפ״ז",
  "heDateParts": { "y": "תשפ״ז", "m": "כסלו", "d": "ב׳" },
  "events": ["Parashat Toldot"]
}
```

Hebcal allows requests directly from the browser (CORS), so no backend of our own is needed.

If the user submits a new date before the previous response arrives, the previous request is cancelled
(`AbortController`), so a slow response can never overwrite a newer result.

## Tests

Written with Vitest and React Testing Library. Requests to Hebcal are replaced with mocked responses, so the tests don't need network access.

- `utils/date.test.ts`: parsing and formatting, leap years, and invalid dates.
- `api/hebcal.test.ts`: URL building, HTTP errors, and errors returned by the API.
- `App.test.tsx`: end-to-end screen behavior, including typing a date, "after sunset", invalid input, and "Try again".
