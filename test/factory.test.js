import { strictEqual } from 'node:assert'
import { describe, it } from 'mocha'
import factory from '../factory.js'
import urls from './support/urls.js'

describe('factory', () => {
  it('should be a function', () => {
    strictEqual(typeof factory, 'function')
  })

  it('should forward the baseURL argument', async () => {
    const fetch = factory({ baseURL: urls.supportDir })
    const res = await fetch(urls.fileTxtRelative)
    const result = await res.text()

    strictEqual(result, 'test')
  })

  it('should forward the contentType argument', async () => {
    const contentType = () => 'application/json'
    const fetch = factory({ contentType })
    const res = await fetch(urls.fileTxt)

    strictEqual(res.headers.get('content-type'), 'application/json')
  })
})
