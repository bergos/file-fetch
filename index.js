const fs = require('fs')
const path = require('path')
const { promisify } = require('util')
const { URL } = require('url')
const { Readable } = require('stream')
const getStream = require('get-stream')
const { contentType } = require('mime-types')
const { Headers } = require('node-fetch')
const ReadableError = require('readable-error')

const access = promisify(fs.access)
const { R_OK } = fs.constants

function decodeIRI (iri) {
  // IRIs without file scheme are used directly
  if (!iri.startsWith('file:')) {
    return iri
  }

  const pathname = decodeURIComponent(new URL(iri).pathname)

  // remove the leading slash for IRIs with file scheme and relative path
  if (!iri.startsWith('file:/')) {
    return pathname.split('/').slice(1).join('/')
  }

  return pathname
}

function response (status, body, headers) {
  return {
    status: status,
    ok: status >= 200 && status <= 299,
    headers: new Headers(headers),
    body: body,
    text: async () => getStream(body),
    json: async () => JSON.parse(await getStream(body))
  }
}

async function fetch (iri, { body, contentTypeLookup = contentType, method = 'GET' } = {}) {
  method = method.toUpperCase()

  const pathname = decodeIRI(iri)

  if (method === 'GET') {
    return new Promise((resolve) => {
      const stream = fs.createReadStream(pathname)

      stream.on('error', () => {
        resolve(response(404, new ReadableError(new Error('File not found'))))
      })

      stream.on('open', () => {
        resolve(response(200, stream, {
          'content-type': contentTypeLookup(path.extname(pathname))
        }))
      })
    })
  }

  if (method === 'HEAD') {
    try {
      await access(pathname, R_OK)
    } catch (error) {
      return response(404, new ReadableError(new Error('File not found')))
    }

    const stream = new Readable()
    stream.push(null)

    return response(200, stream, {
      'content-type': contentTypeLookup(path.extname(pathname))
    })
  }

  if (method === 'PUT') {
    if (!body) {
      return response(406, new ReadableError(new Error('body required')))
    }

    return new Promise((resolve) => {
      body.pipe(fs.createWriteStream(pathname)).on('finish', () => {
        resolve(response(201))
      }).on('error', (err) => {
        resolve(response(500, new ReadableError(err)))
      })
    })
  }

  return response(405, new ReadableError(new Error('method not allowed')))
}

fetch.Headers = Headers

module.exports = fetch
