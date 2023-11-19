import { createWriteStream } from 'node:fs'
import { Readable } from 'readable-stream'
import response from './response.js'

async function put (url, { body }) {
  if (body === undefined || body === null) {
    return response(400)
  }

  if (typeof body === 'string') {
    body = Readable.from([body])
  }

  return new Promise(resolve => {
    body.pipe(createWriteStream(url))
      .on('finish', () => resolve(response(201)))
      .on('error', err => resolve(response(500, {}, err)))
  })
}

export default put
