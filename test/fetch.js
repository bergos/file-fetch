const fs = require('fs')
const path = require('path')
const assert = require('assert')
const Readable = require('stream').Readable
const { describe, it } = require('mocha')
const fileFetch = require('..')

describe('fileFetch', () => {
  it('should be a function', () => {
    assert.strictEqual(typeof fileFetch, 'function')
  })

  it('should return a response with a readable stream', () => {
    return fileFetch('file://' + path.join(__dirname, 'support/file.txt')).then((res) => {
      assert(res.body.readable)
      assert.strictEqual(typeof res.body.pipe, 'function')
      assert.strictEqual(typeof res.body.read, 'function')
    })
  })

  it('should read the file content if now method is given', () => {
    return fileFetch('file://' + path.join(__dirname, 'support/file.txt')).then((res) => {
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

  it('should set the content-type header based on the file extension', () => {
    return fileFetch('file://' + path.join(__dirname, 'support/file.txt')).then((res) => {
      assert.strictEqual(res.headers.get('content-type').split(';').shift(), 'text/plain')
    })
  })

  it('should read the file content with method GET', () => {
    return fileFetch('file://' + path.join(__dirname, 'support/file.txt'), {
      method: 'GET'
    }).then((res) => {
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

  it('should read the file content with relative path and method GET', () => {
    return fileFetch('./test/support/file.txt', {
      method: 'GET'
    }).then((res) => {
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

  it('should read the file content with relative URL and method GET', () => {
    return fileFetch('file:./test/support/file.txt', {
      method: 'GET'
    }).then((res) => {
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

  it('should give a 404 path to non-existent file (method GET)', () => {
    return fileFetch('./test/support/nonexistent-file.txt', {
      method: 'GET'
    }).then((res) => {
      assert.strictEqual(res.status, 404)

      return new Promise((resolve) => {
        res.body.on('error', resolve)

        res.body.resume()
      })
    })
  })

  it('should return a 200 status but no body with method HEAD and existing file', () => {
    const pathname = path.join(__dirname, 'support/file.txt')

    return fileFetch('file://' + pathname, {
      method: 'HEAD'
    }).then((res) => {
      assert.strictEqual(res.status, 200)
      res.body.on('data', (chunk) => {
        assert(false);
      })
      return new Promise((resolve) => {
        res.body.on('end', () => {
          resolve()
        })
      })
    })
  })

  it('should return a 404 status with method HEAD and non-existent file', () => {
    const pathname = path.join(__dirname, 'support/missing.txt')

    return fileFetch('file://' + pathname, {
      method: 'HEAD'
    }).then((res) => {
      assert.strictEqual(res.status, 404)
    })
  })

  it('should write the file content with method PUT', () => {
    const pathname = path.join(__dirname, 'support/tmp.txt')

    const body = new Readable({
      read: () => {
        body.push('test')
        body.push(null)
      }
    })

    return fileFetch('file://' + pathname, {
      method: 'PUT',
      body: body
    }).then((res) => {
      assert.strictEqual(fs.readFileSync(pathname), 'test')

      fs.unlinkSync(pathname)
    }).catch(() => {
      fs.unlinkSync(pathname)
    })
  })

  it('should throw an error if the method is PUT, but no body is given', () => {
    return fileFetch('file://' + path.join(__dirname, 'support/file.txt'), {
      method: 'PUT'
    }).then((res) => {
      assert.strictEqual(res.status, 406)

      return new Promise((resolve) => {
        res.body.on('error', resolve)

        res.body.resume()
      })
    })
  })

  it('should throw an error if the given method is unknown', () => {
    return fileFetch('file://' + path.join(__dirname, 'support/file.txt'), {
      method: 'OPTIONS'
    }).then((res) => {
      assert.strictEqual(res.status, 405)

      return new Promise((resolve) => {
        res.body.on('error', resolve)

        res.body.resume()
      })
    })
  })

  it('should support encoded URLs', () => {
    const pathname = path.join(__dirname, 'support/Ümlaut?.txt')
    const url = 'file://' + path.join(__dirname, 'support/') + encodeURIComponent('Ümlaut?.txt')

    const body = new Readable({
      read: () => {
        body.push('test')
        body.push(null)
      }
    })

    return fileFetch(url, {
      method: 'PUT',
      body: body
    }).then((res) => {
      assert.strictEqual(fs.readFileSync(pathname), 'test')

      fs.unlinkSync(pathname)
    }).catch(() => {
      fs.unlinkSync(pathname)
    })
  })

  it('should return a response with headers', () => {
    return fileFetch('file://' + path.join(__dirname, 'support/file.txt')).then((res) => {
      assert(res.headers)
      assert.strictEqual(typeof res.headers.has, 'function')
      assert.strictEqual(typeof res.headers.get, 'function')
    })
  })

  describe('.text', () => {
    it('should be a method', () => {
      return fileFetch('file://' + path.join(__dirname, 'support/file.txt')).then((res) => {
        assert.strictEqual(typeof res.text, 'function')
      })
    })

    it('should return the content using a Promise', () => {
      return fileFetch('file://' + path.join(__dirname, 'support/file.txt')).then(res => res.text()).then((text) => {
        assert.strictEqual(text, 'test')
      })
    })
  })

  describe('.json', () => {
    it('should be a method', () => {
      return fileFetch('file://' + path.join(__dirname, 'support/json.json')).then((res) => {
        assert.strictEqual(typeof res.json, 'function')
      })
    })

    it('should return the content using a Promise', () => {
      return fileFetch('file://' + path.join(__dirname, 'support/json.json')).then(res => res.json()).then((json) => {
        assert.deepStrictEqual(json, {
          key: 'value'
        })
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
