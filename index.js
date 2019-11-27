const fs = require('fs')
const path = require('path')
const { URL } = require('url')
const concatStream = require('concat-stream')
const contentTypeLookup = require('mime-types').contentType
const Headers = require('node-fetch').Headers
const ReadableError = require('readable-error')

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

function text (stream) {
  return new Promise((resolve, reject) => {
    stream.pipe(concatStream({
      encoding: 'string'
    }, resolve))
    stream.on('error', reject)
  })
}

function json (stream) {
  return text(stream).then(text => JSON.parse(text))
}

function response (status, body, headers) {
  return {
    status: status,
    ok: status >= 200 && status <= 299,
    headers: new Headers(headers),
    body: body,
    text: text.bind(null, body),
    json: json.bind(null, body)
  }
}

function fetch (iri, options) {
  options = options || {}
  options.method = (options.method || 'GET').toUpperCase()
  options.contentTypeLookup = options.contentTypeLookup || contentTypeLookup

  const pathname = decodeIRI(iri)

  if (options.method === 'GET') {
    return new Promise((resolve) => {
      const stream = fs.createReadStream(pathname)
      stream.on('error', () => {
        resolve(response(404, new ReadableError(new Error('File not found'))))
      })
      stream.on('open', () => {
        resolve(response(200, stream, {
          'content-type': options.contentTypeLookup(path.extname(pathname))
        }))
      })
    })
  } else if (options.method === 'PUT') {
    return new Promise((resolve) => {
      if (!options.body) {
        return resolve(response(406, new ReadableError(new Error('body required'))))
      }

      options.body.pipe(fs.createWriteStream(pathname)).on('finish', () => {
        resolve(response(201))
      }).on('error', (err) => {
        resolve(response(500, new ReadableError(err)))
      })
    })
  } else {
    return Promise.resolve(response(405, new ReadableError(new Error('method not allowed'))))
  }
}

fetch.Headers = Headers

module.exports = fetch
