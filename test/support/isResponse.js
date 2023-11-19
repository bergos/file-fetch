import { strictEqual } from 'node:assert'
import { isReadableStream } from 'is-stream'

function isResponse (res) {
  strictEqual(typeof res, 'object')
  strictEqual(typeof res.status, 'number')
  strictEqual(typeof res.ok, 'boolean')
  strictEqual(typeof res.headers, 'object')
}

function isResponseWithBody (res) {
  isResponse(res)

  strictEqual(isReadableStream(res.body), true)
  strictEqual(typeof res.text, 'function')
  strictEqual(typeof res.json, 'function')
}

export {
  isResponse,
  isResponseWithBody
}
