const fs = require('fs')
const path = require('path')
const assert = require('assert')
const { Readable } = require('stream')
const { describe, it } = require('mocha')
const fileFetch = require('..')

describe('fileFetch', () => {
  it('should be a function', () => {
    assert.strictEqual(typeof fileFetch, 'function')
  })

  it('should return a response with a readable stream', async () => {
    const res = await fileFetch('file://' + path.join(__dirname, 'support/file.txt'))
    assert(res.body.readable)
    assert.strictEqual(typeof res.body.pipe, 'function')
    assert.strictEqual(typeof res.body.read, 'function')
  })

  it('should read the file content if now method is given', async () => {
    const res = await fileFetch('file://' + path.join(__dirname, 'support/file.txt'))
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

  it('should set the content-type header based on the file extension', async () => {
    const res = await fileFetch('file://' + path.join(__dirname, 'support/file.txt'))
    assert.strictEqual(res.headers.get('content-type').split(';').shift(), 'text/plain')
  })

  it('should call user content type lookup', async () => {
    function contentTypeLookup () {
      return 'application/ld+json'
    }

    const res = await fileFetch('file://' + path.join(__dirname, 'support/json.json'), {
      contentTypeLookup
    })

    assert.strictEqual(res.headers.get('content-type').split(';').shift(), 'application/ld+json')
  })

  it('uses default content type lookup when override does not return', async () => {
    function contentTypeLookup () {
      return undefined
    }

    const res = await fileFetch('file://' + path.join(__dirname, 'support/json.json'), {
      contentTypeLookup
    })

    assert.strictEqual(res.headers.get('content-type').split(';').shift(), 'application/json')
  })

  it('should read the file content with method GET', async () => {
    const res = await fileFetch('file://' + path.join(__dirname, 'support/file.txt'), {
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

  it('should read the file content with relative path and method GET', async () => {
    const res = await fileFetch('./test/support/file.txt', {
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

  it('should read the file content with relative URL and method GET', async () => {
    const res = await fileFetch('file:./test/support/file.txt', {
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

  it('should give a 404 path to non-existent file (method GET)', async () => {
    const res = await fileFetch('./test/support/nonexistent-file.txt', {
      method: 'GET'
    })
    assert.strictEqual(res.status, 404)

    return new Promise((resolve) => {
      res.body.on('error', resolve)

      res.body.resume()
    })
  })

  it('should return a 200 status but no body with method HEAD and existing file', async () => {
    const pathname = path.join(__dirname, 'support/file.txt')

    const res = await fileFetch('file://' + pathname, {
      method: 'HEAD'
    })
    assert.strictEqual(res.status, 200)
    res.body.on('data', (chunk) => {
      assert(false)
    })
    return new Promise((resolve) => {
      res.body.on('end', () => {
        resolve()
      })
    })
  })

  it('should return a 200 status but no body with method HEAD and existing file (fallback to contentType)', async () => {
    function contentTypeLookup () {
      return undefined
    }

    const pathname = path.join(__dirname, 'support/file.txt')

    const res = await fileFetch('file://' + pathname, {
      method: 'HEAD',
      contentTypeLookup
    })
    assert.strictEqual(res.status, 200)
    res.body.on('data', (chunk) => {
      assert(false)
    })
    return new Promise((resolve) => {
      res.body.on('end', () => {
        resolve()
      })
    })
  })

  it('should return a 404 status with method HEAD and non-existent file', async () => {
    const pathname = path.join(__dirname, 'support/missing.txt')

    const res = await fileFetch('file://' + pathname, {
      method: 'HEAD'
    })
    assert.strictEqual(res.status, 404)
  })

  it('should write the file content with method PUT', async () => {
    const pathname = path.join(__dirname, 'support/tmp.txt')

    const body = new Readable({
      read: () => {
        body.push('test')
        body.push(null)
      }
    })

    try {
      await fileFetch('file://' + pathname, {
        method: 'PUT',
        body: body
      })
      assert.strictEqual(fs.readFileSync(pathname, 'utf8'), 'test')
    } catch (err) {
      assert(false)
    }
    fs.unlinkSync(pathname)
  })

  it('should throw an error if the method is PUT, but no body is given', async () => {
    const res = await fileFetch('file://' + path.join(__dirname, 'support/file.txt'), {
      method: 'PUT'
    })
    assert.strictEqual(res.status, 406)

    return new Promise((resolve) => {
      res.body.on('error', resolve)

      res.body.resume()
    })
  })

  it('should throw an error if the method is PUT, but the "file" is a directory', async () => {
    const body = new Readable({
      read: () => {
        body.push('test')
        body.push(null)
      }
    })
    const res = await fileFetch('file://' + path.join(__dirname, 'support'), {
      method: 'PUT',
      body: body
    })
    assert.strictEqual(res.status, 500)

    return new Promise((resolve) => {
      res.body.on('error', resolve)

      res.body.resume()
    })
  })

  it('should throw an error if the given method is unknown', async () => {
    const res = await fileFetch('file://' + path.join(__dirname, 'support/file.txt'), {
      method: 'OPTIONS'
    })
    assert.strictEqual(res.status, 405)

    return new Promise((resolve) => {
      res.body.on('error', resolve)

      res.body.resume()
    })
  })

  it('should support encoded URLs', async () => {
    const pathname = path.join(__dirname, 'support/Ümlaut?.txt')
    const url = 'file://' + path.join(__dirname, 'support/') + encodeURIComponent('Ümlaut?.txt')

    const body = new Readable({
      read: () => {
        body.push('test')
        body.push(null)
      }
    })

    try {
      await fileFetch(url, {
        method: 'PUT',
        body: body
      })
      assert.strictEqual(fs.readFileSync(pathname, 'utf8'), 'test')
    } catch (error) {
      assert(false)
    }
    fs.unlinkSync(pathname)
  })

  it('should return a response with headers', async () => {
    const res = await fileFetch('file://' + path.join(__dirname, 'support/file.txt'))
    assert(res.headers)
    assert.strictEqual(typeof res.headers.has, 'function')
    assert.strictEqual(typeof res.headers.get, 'function')
  })

  describe('.text', () => {
    it('should be a method', async () => {
      const res = await fileFetch('file://' + path.join(__dirname, 'support/file.txt'))
      assert.strictEqual(typeof res.text, 'function')
    })

    it('should return the content using a Promise', async () => {
      const res = await fileFetch('file://' + path.join(__dirname, 'support/file.txt'))
      const text = await res.text()
      assert.strictEqual(text, 'test')
    })
  })

  describe('.json', () => {
    it('should be a method', async () => {
      const res = await fileFetch('file://' + path.join(__dirname, 'support/json.json'))
      assert.strictEqual(typeof res.json, 'function')
    })

    it('should return the content using a Promise', async () => {
      const res = await fileFetch('file://' + path.join(__dirname, 'support/json.json'))
      const json = await res.json()
      assert.deepStrictEqual(json, {
        key: 'value'
      })
    })
  })

  describe('.Headers', () => {
    it('should be a constructor', () => {
      assert.strictEqual(typeof fileFetch.Headers, 'function')
    })

    it('should have a .has method', () => {
      const headers = new fileFetch.Headers()

      assert.strictEqual(typeof headers.has, 'function')
    })

    it('should have a .get method', () => {
      const headers = new fileFetch.Headers()

      assert.strictEqual(typeof headers.get, 'function')
    })
  })
})
