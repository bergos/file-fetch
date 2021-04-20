const path = require('path')
const assert = require('assert')
const { describe, it } = require('mocha')
const fileFetch = require('..')

describe('create', () => {
  it('should be a function', () => {
    assert.strictEqual(typeof fileFetch.create, 'function')
  })

  it('should read the file content with relative path and method GET', async () => {
    const fetch = fileFetch.create('test')
    const res = await fetch('./support/file.txt', {
      method: 'GET'
    })
    return new Promise((resolve) => {
      let content = ''

      res.body.on('data', (chunk) => {
        content += chunk
      })

      res.body.on('end', () => {
        assert.strictEqual(content, 'test')

        resolve()
      })
    })
  })

  it('should return a response with a readable stream', async () => {
    const fetch = fileFetch.create('test')
    const res = await fetch('file://' + path.join(__dirname, 'support/file.txt'))
    assert(res.body.readable)
    assert.strictEqual(typeof res.body.pipe, 'function')
    assert.strictEqual(typeof res.body.read, 'function')
  })

  it('should read the file content with relative URL and method GET', async () => {
    const fetch = fileFetch.create('test')
    const res = await fetch('file:./support/file.txt', {
      method: 'GET'
    })
    return new Promise((resolve) => {
      let content = ''

      res.body.on('data', (chunk) => {
        content += chunk
      })

      res.body.on('end', () => {
        assert.strictEqual(content, 'test')

        resolve()
      })
    })
  })
})
