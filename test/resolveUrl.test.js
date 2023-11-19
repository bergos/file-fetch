import { strictEqual, throws } from 'node:assert'
import { describe, it } from 'mocha'
import resolveUrl from '../lib/resolveUrl.js'

describe('resolveUrl', () => {
  it('should be a function', () => {
    strictEqual(typeof resolveUrl, 'function')
  })

  it('should throw an error if a non-file URI is given', () => {
    throws(() => {
      resolveUrl('mailto:example@example.org')
    })
  })

  it('should throw an error if a non-file URL is given', () => {
    throws(() => {
      resolveUrl('http://example.org/')
    })
  })

  it('should extend a pathname with the default baseURL', () => {
    const expected = `file://${process.cwd()}/path/file.txt`
    const result = resolveUrl('path/file.txt')

    strictEqual(result.toString(), expected)
  })

  it('should extend a pathname with the given baseURL', () => {
    const expected = 'file:///root/path/file.txt'
    const result = resolveUrl('path/file.txt', 'file:///root/')

    strictEqual(result.toString(), expected)
  })

  it('should forward URLs without changes', () => {
    const expected = 'file:///root/file.txt'
    const result = resolveUrl(expected)

    strictEqual(result.toString(), expected)
  })

  it('should extend a URI with the default baseURL', () => {
    const expected = `file://${process.cwd()}/path/file.txt`
    const result = resolveUrl('file:path/file.txt')

    strictEqual(result.toString(), expected)
  })

  it('should extend a URI with the given baseURL', () => {
    const expected = 'file:///root/path/file.txt'
    const result = resolveUrl('file:path/file.txt', 'file:///root/')

    strictEqual(result.toString(), expected)
  })
})
