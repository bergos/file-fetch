import { strictEqual } from 'node:assert'
import { describe, it } from 'mocha'
import fetch, { factory, Headers } from '../index.js'
import urls from './support/urls.js'

describe('fileFetch', () => {
  it('should export fetch as default', async () => {
    const res = await fetch(urls.fileTxt)
    const result = await res.text()

    strictEqual(result, 'test')
  })

  it('should export factory', async () => {
    const fetch = factory({ baseURL: urls.supportDir })
    const res = await fetch(urls.fileTxtRelative)
    const result = await res.text()

    strictEqual(result, 'test')
  })

  it('should export Headers', () => {
    const headers = new Headers({
      a: 'b',
      c: 'd'
    })

    headers.set('e', 'f')

    strictEqual(headers.get('a'), 'b')
    strictEqual(headers.get('c'), 'd')
    strictEqual(headers.get('e'), 'f')
  })
})
