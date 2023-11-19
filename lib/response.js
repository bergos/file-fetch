import { Readable } from 'readable-stream'
import decode from 'stream-chunks/decode.js'

const statusTexts = new Map([
  [200, 'OK'],
  [201, 'Created'],
  [400, 'Bad Request'],
  [404, 'Not Found'],
  [405, 'Method Not Allowed'],
  [500, 'Internal Server Error']
])

function response (status, headers, body) {
  headers = new globalThis.Headers(headers || {})

  if (body instanceof Error) {
    const err = body

    headers.set('content-type', 'application/json')

    body = Readable.from([JSON.stringify({
      title: err.message
    })])
  }

  const statusText = statusTexts.get(status)
  const ok = status >= 200 && status <= 299
  const json = body && (async () => JSON.parse(await decode(body)))
  const text = body && (async () => decode(body))

  return {
    status,
    statusText,
    ok,
    headers,
    body,
    json,
    text
  }
}

export default response
