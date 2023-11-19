import { deepStrictEqual, strictEqual } from 'node:assert'
import { describe, it } from 'mocha'
import { Readable } from 'readable-stream'
import { decode } from 'stream-chunks'
import response from '../lib/response.js'
import { isResponse } from './support/isResponse.js'

describe('response', () => {
  it('should be a function', () => {
    strictEqual(typeof response, 'function')
  })

  it('should return a response object', () => {
    isResponse(response(200))
  })

  it('should assign the given status', () => {
    const res = response(200)

    strictEqual(res.status, 200)
  })

  it('should set the statusText matching the 200 status', () => {
    const res = response(200)

    strictEqual(res.statusText, 'OK')
  })

  it('should set the statusText matching the 201 status', () => {
    const res = response(201)

    strictEqual(res.statusText, 'Created')
  })

  it('should set the statusText matching the 400 status', () => {
    const res = response(400)

    strictEqual(res.statusText, 'Bad Request')
  })

  it('should set the statusText matching the 404 status', () => {
    const res = response(405)

    strictEqual(res.statusText, 'Method Not Allowed')
  })

  it('should set the statusText matching the 404 status', () => {
    const res = response(404)

    strictEqual(res.statusText, 'Not Found')
  })

  it('should set the statusText matching the 500 status', () => {
    const res = response(500)

    strictEqual(res.statusText, 'Internal Server Error')
  })

  it('should set ok to true for a 200 status', () => {
    const res = response(200)

    strictEqual(res.ok, true)
  })

  it('should set ok to false for a 400 status', () => {
    const res = response(400)

    strictEqual(res.ok, false)
  })

  it('should assign the given headers', () => {
    const res = response(200, { a: 'b', c: 'd' })

    strictEqual(res.headers.get('a'), 'b')
    strictEqual(res.headers.get('c'), 'd')
  })

  it('should assign the given body', async () => {
    const res = response(200, {}, Readable.from(['test']))

    const result = await decode(res.body)

    strictEqual(result, 'test')
  })

  it('should convert and assign an error object', async () => {
    const res = response(500, {}, new Error('test'))

    const contentType = res.headers.get('content-type')
    const body = await decode(res.body)

    strictEqual(contentType, 'application/json')
    strictEqual(body, JSON.stringify({ title: 'test' }))
  })

  it('should assign the json method if a body is given', async () => {
    const res = response(200, {}, Readable.from(['{}']))

    strictEqual(typeof res.json, 'function')
  })

  it('should parse and return a given json body', async () => {
    const res = response(200, {}, Readable.from(['{}']))

    const result = await res.json()

    deepStrictEqual(result, {})
  })

  it('should assign the text method if a body is given', async () => {
    const res = response(200, {}, Readable.from(['test']))

    strictEqual(typeof res.text, 'function')
  })

  it('should return a given body as string', async () => {
    const res = response(200, {}, Readable.from(['test']))

    const result = await res.text()

    deepStrictEqual(result, 'test')
  })
})
