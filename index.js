const fs = require('fs')
const { access } = require('fs/promises')
const path = require('path')
const { Readable } = require('stream')
const getStream = require('get-stream')
const { contentType } = require('mime-types')
const { Headers } = require('node-fetch')
const ReadableError = require('readable-error')

const { R_OK } = fs.constants

function decodeIRI (iri, baseDir, baseURL) {
  // IRIs without file scheme are used directly
  if (!iri.startsWith('file:') && !baseURL) {
    return path.join(baseDir, iri)
  }

  const pathname = decodeURIComponent(new URL(iri, baseURL).pathname)

  // remove the leading slash for IRIs with file scheme and relative path
  if (!iri.startsWith('file:/') &&
    (!baseURL || !pathname.startsWith('/'))) {
    return './' + (path.join(baseDir, '.' + pathname))
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

function create ({ baseDir = '', baseURL } = {}) {
  return async function fetch (iri, { body, contentTypeLookup = contentType, method = 'GET' } = {}) {
    method = method.toUpperCase()

    const pathname = decodeIRI(iri, baseDir, baseURL)
    const extension = path.extname(pathname)

    if (method === 'GET') {
      return new Promise((resolve) => {
        const stream = fs.createReadStream(pathname)

        stream.on('error', () => {
          resolve(response(404, new ReadableError(new Error('File not found'))))
        })

        stream.on('open', () => {
          resolve(response(200, stream, {
            'content-type': contentTypeLookup(extension) || contentType(extension)
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
        'content-type': contentTypeLookup(extension) || contentType(extension)
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
}

const fetch = create()

fetch.Headers = Headers

fetch.create = create

module.exports = fetch
