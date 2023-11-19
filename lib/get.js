import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import { extname } from 'node:path'
import { contentType as defaultContentType } from 'mime-types'
import response from './response.js'

async function fileSize (url) {
  try {
    return (await stat(url)).size
  } catch (error) {
    return null
  }
}

async function get (url, { contentType = defaultContentType, method = 'GET' } = {}) {
  const size = await fileSize(url)

  if (size === null) {
    return response(404, {}, new Error('Not Found'))
  }

  const extension = extname(url.pathname)

  if (typeof contentType === 'function') {
    contentType = contentType(extension)
  }

  if (!contentType) {
    contentType = 'application/octet-stream'
  }

  const ok = stream => {
    return response(200, {
      'content-length': size.toString(),
      'content-type': contentType
    }, stream)
  }

  if (method === 'GET') {
    return new Promise(resolve => {
      const stream = createReadStream(url)

      stream
        .on('open', () => resolve(ok(stream)))
        .on('error', err => resolve(response(500, {}, err)))
    })
  }

  if (method === 'HEAD') {
    return ok()
  }
}

export default get
