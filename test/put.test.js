import { strictEqual } from 'node:assert'
import { readFile, writeFile } from 'node:fs/promises'
import { describe, it } from 'mocha'
import { Readable } from 'readable-stream'
import temp from 'temp'
import put from '../lib/put.js'
import { isResponse } from './support/isResponse.js'

temp.track()

describe('put', () => {
  it('should be a function', () => {
    strictEqual(typeof put, 'function')
  })

  it('should return a response object', async () => {
    const res = await put(temp.path(), { body: '' })

    isResponse(res)
  })

  it('should write the content of the text body to the file', async () => {
    const path = temp.path()

    await put(path, { body: 'test' })
    const result = (await readFile(path)).toString()

    strictEqual(result, 'test')
  })

  it('should write the content of the stream body to the file', async () => {
    const path = temp.path()

    await put(path, { body: Readable.from(['test']) })
    const result = (await readFile(path)).toString()

    strictEqual(result, 'test')
  })

  it('should overwrite existing content', async () => {
    const path = temp.path()
    await writeFile(path, 'test')

    await put(path, { body: 'text' })
    const result = (await readFile(path)).toString()

    strictEqual(result, 'text')
  })

  it('should set the status to 400 no body was given', async () => {
    const res = await put(temp.path(), {})

    strictEqual(res.status, 400)
  })

  it('should set the status to 500 if the url points to a directory', async () => {
    const res = await put(await temp.mkdir(), { body: '' })

    strictEqual(res.status, 500)
  })
})
