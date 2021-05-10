const path = require('path')
const assert = require('assert')
const { describe, it } = require('mocha')
const fileFetch = require('..')

describe('create', () => {
  it('should be a function', () => {
    assert.strictEqual(typeof fileFetch.create, 'function')
  })

  describe('baseDir', function () {
    it('should read the file content with relative path and method GET', async () => {
      const fetch = fileFetch.create({ baseDir: 'test' })
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
      const fetch = fileFetch.create({ baseDir: 'ignoredForAbsolute' })
      const res = await fetch(
        'file://' + path.join(__dirname, 'support/file.txt')
      )
      assert(res.body.readable)
      assert.strictEqual(typeof res.body.pipe, 'function')
      assert.strictEqual(typeof res.body.read, 'function')

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

    it('should read the file content with relative URL and method GET', async () => {
      const fetch = fileFetch.create({ baseDir: 'test' })
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

  describe('baseURL', function () {
    it('should read the file content with relative path and method GET', async () => {
      const fetch = fileFetch.create({
        baseURL: 'file://' + __dirname + '/' // eslint-disable-line no-path-concat
      })
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
      const fetch = fileFetch.create({
        baseURL: 'file://' + path.join(__dirname, 'support/ignoredForAbsolute.txt')
      })
      const res = await fetch(
        'file://' + path.join(__dirname, 'support/file.txt')
      )
      assert(res.body.readable)
      assert.strictEqual(typeof res.body.pipe, 'function')
      assert.strictEqual(typeof res.body.read, 'function')

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

    it('should read the file content with relative URL and method GET', async () => {
      const fetch = fileFetch.create({
        baseURL: 'file://' + __dirname + '/' // eslint-disable-line no-path-concat
      })
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
})
