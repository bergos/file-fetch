import { strictEqual } from 'node:assert'
import { readFile } from 'node:fs/promises'
import { describe, it } from 'mocha'
import temp from 'temp'
import fetch from '../fetch.js'
import urls from './support/urls.js'

temp.track()

describe('fetch', () => {
  it('should be a function', () => {
    strictEqual(typeof fetch, 'function')
  })

  it('should use GET method if no method is given', async () => {
    const res = await fetch(urls.fileTxt)
    const result = await res.text()

    strictEqual(result, 'test')
  })

  it('should support GET method calls', async () => {
    const res = await fetch(urls.fileTxt, { method: 'GET' })
    const result = await res.text()

    strictEqual(result, 'test')
  })

  it('should support HEAD method calls', async () => {
    const res = await fetch(urls.fileTxt, { method: 'HEAD' })

    strictEqual(typeof res.body, 'undefined')
    strictEqual(res.headers.get('content-length'), '4')
  })

  it('should support PUT method calls', async () => {
    const path = temp.path()

    await fetch(path, { body: 'test', method: 'PUT' })
    const result = (await readFile(path)).toString()

    strictEqual(result, 'test')
  })

  it('should translate method values to upper case', async () => {
    const res = await fetch(urls.fileTxt, { method: 'hEAd' })

    strictEqual(typeof res.body, 'undefined')
    strictEqual(res.headers.get('content-length'), '4')
  })

  it('should use the baseURL to resolve URLs', async () => {
    const res = await fetch(urls.fileTxtRelative, { baseURL: urls.supportDir })
    const result = await res.text()

    strictEqual(result, 'test')
  })

  it('should return a response with a 405 status code if an unknown method is given', async () => {
    const res = await fetch(urls.fileTxt, { method: 'OPTION' })

    strictEqual(res.status, 405)
  })

  it('should forward the contentType argument', async () => {
    const contentType = () => 'application/json'
    const res = await fetch(urls.fileTxt, { contentType })

    strictEqual(res.headers.get('content-type'), 'application/json')
  })
})
