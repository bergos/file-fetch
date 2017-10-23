/* global describe, it */

const assert = require('assert')
const fileFetch = require('..')
const fs = require('fs')
const path = require('path')
const Readable = require('stream').Readable

describe('fileFetch', () => {
  it('should be a function', () => {
    assert.equal(typeof fileFetch, 'function')
  })

  it('should return a response with a readable stream', () => {
    return fileFetch('file://' + path.join(__dirname, 'support/file.txt')).then((res) => {
      assert(res.body.readable)
      assert.equal(typeof res.body.pipe, 'function')
      assert.equal(typeof res.body.read, 'function')
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
          assert.equal(content, 'test')

          resolve()
        })
      })
    })
  })

  it('should set the content-type header based on the file extension', () => {
    return fileFetch('file://' + path.join(__dirname, 'support/file.txt')).then((res) => {
      assert.equal(res.headers.get('content-type').split(';').shift(), 'text/plain')
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
          assert.equal(content, 'test')

          resolve()
        })
      })
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
      assert.equal(fs.readFileSync(pathname), 'test')

      fs.unlinkSync(pathname)
    }).catch(() => {
      fs.unlinkSync(pathname)
    })
  })

  it('should throw an error if the method is PUT, but no body is given', () => {
    return fileFetch('file://' + path.join(__dirname, 'support/file.txt'), {
      method: 'PUT'
    }).then((res) => {
      assert.equal(res.status, 406)

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
      assert.equal(res.status, 405)

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
      assert.equal(fs.readFileSync(pathname), 'test')

      fs.unlinkSync(pathname)
    }).catch(() => {
      fs.unlinkSync(pathname)
    })
  })

  it('should return a response with headers', () => {
    return fileFetch('file://' + path.join(__dirname, 'support/file.txt')).then((res) => {
      assert(res.headers)
      assert.equal(typeof res.headers.has, 'function')
      assert.equal(typeof res.headers.get, 'function')
    })
  })

  describe('.text', () => {
    it('should be a method', () => {
      return fileFetch('file://' + path.join(__dirname, 'support/file.txt')).then((res) => {
        assert.equal(typeof res.text, 'function')
      })
    })

    it('should return the content using a Promise', () => {
      return fileFetch('file://' + path.join(__dirname, 'support/file.txt')).then(res => res.text()).then((text) => {
        assert.equal(text, 'test')
      })
    })
  })

  describe('.json', () => {
    it('should be a method', () => {
      return fileFetch('file://' + path.join(__dirname, 'support/json.json')).then((res) => {
        assert.equal(typeof res.json, 'function')
      })
    })

    it('should return the content using a Promise', () => {
      return fileFetch('file://' + path.join(__dirname, 'support/json.json')).then(res => res.json()).then((json) => {
        assert.deepEqual(json, {
          key: 'value'
        })
      })
    })
  })

  describe('.Headers', () => {
    it('should be a constructor', () => {
      assert.equal(typeof fileFetch.Headers, 'function')
    })

    it('should have a .has method', () => {
      const headers = new fileFetch.Headers()

      assert.equal(typeof headers.has, 'function')
    })

    it('should have a .get method', () => {
      const headers = new fileFetch.Headers()

      assert.equal(typeof headers.get, 'function')
    })
  })
})
