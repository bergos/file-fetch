const fs = require('fs')
const path = require('path')
const { promisify } = require('util')
const { URL } = require('url')
const { Readable } = require('stream')
const concatStream = require('concat-stream')
const contentTypeLookup = require('mime-types').contentType
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

function text (stream) {
  return new Promise((resolve, reject) => {
    stream.pipe(concatStream({
      encoding: 'string'
    }, resolve))
    stream.on('error', reject)
  })
}

async function json (stream) {
  const txt = await text(stream)
  return JSON.parse(txt)
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

async function fetch (iri, options) {
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
  } else if (options.method === 'HEAD') {
    try {
      await access(pathname, R_OK)
    } catch (error) {
      return response(404, new ReadableError(new Error('File not found')))
    }
    const stream = new Readable({ read () {} })
    stream.push(null)
    return response(200, stream, {
      'content-type': options.contentTypeLookup(path.extname(pathname))
    })
  } else if (options.method === 'PUT') {
    if (!options.body) {
      return response(406, new ReadableError(new Error('body required')))
    }
    return new Promise((resolve) => {
      options.body.pipe(fs.createWriteStream(pathname)).on('finish', () => {
        resolve(response(201))
      }).on('error', (err) => {
        resolve(response(500, new ReadableError(err)))
      })
    })
  } else {
    return response(405, new ReadableError(new Error('method not allowed')))
  }
}

fetch.Headers = Headers

module.exports = fetch
