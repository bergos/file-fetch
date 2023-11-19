import { strictEqual } from 'node:assert'
import { describe, it } from 'mocha'
import { decode } from 'stream-chunks'
import get from '../lib/get.js'
import { isResponseWithBody } from './support/isResponse.js'
import urls from './support/urls.js'

describe('get', () => {
  it('should be a function', () => {
    strictEqual(typeof get, 'function')
  })

  it('should return a response object', async () => {
    const res = await get(urls.fileTxt)

    isResponseWithBody(res)
  })

  it('should set the content-type header based on the file extension', async () => {
    const res = await get(urls.fileTxt)
    const result = res.headers.get('content-type').split(';')[0]

    strictEqual(result, 'text/plain')
  })

  it('should set the content-type header based on the given contentType string value', async () => {
    const res = await get(urls.fileTxt, { contentType: 'application/json' })
    const result = res.headers.get('content-type').split(';')[0]

    strictEqual(result, 'application/json')
  })

  it('should set the content-type header based on the result value of the contentType function', async () => {
    const contentType = () => 'application/ld+json'

    const res = await get(urls.fileTxt, { contentType })
    const result = res.headers.get('content-type').split(';')[0]

    strictEqual(result, 'application/ld+json')
  })

  it('should set the content-type header to the default value of no media type was found', async () => {
    const contentType = () => undefined

    const res = await get(urls.fileTxt, { contentType })
    const result = res.headers.get('content-type').split(';')[0]

    strictEqual(result, 'application/octet-stream')
  })

  it('should set the content-length header to the number of bytes in the file', async () => {
    const res = await get(urls.fileTxt)

    const result = res.headers.get('content-length')

    strictEqual(result, '4')
  })

  it('should have a readable stream as body that emits the file content if no method is given', async () => {
    const res = await get(urls.fileTxt)
    const result = await decode(res.body)

    strictEqual(result, 'test')
  })

  it('should not have a body if the method is HEAD', async () => {
    const res = await get(urls.fileTxt, { method: 'HEAD' })

    strictEqual(typeof res.body, 'undefined')
  })

  it('should set the status to 404 if the url points to a non-existent file', async () => {
    const res = await get(urls.missingTxt)

    strictEqual(res.status, 404)
  })
})
