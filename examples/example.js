import fetch, { factory as fetchFactory } from '../index.js'

async function readFileAbsoluteUrl () {
  const res = await fetch(new URL('example.js', import.meta.url))
  const text = await res.text()

  console.log(`read ${text.length} chars from file with absolute url`)
}

async function readFileBaseUrl () {
  const fetch = fetchFactory({ baseURL: import.meta.url })
  const res = await fetch('example.js')
  const text = await res.text()

  console.log(`read ${text.length} chars from file with baseURL`)
}

async function readFilePipe () {
  const res = await fetch(new URL('example.js', import.meta.url))

  console.log('read pipe content to stdout')

  res.body.pipe(process.stdout)
}

await readFileAbsoluteUrl()
await readFileBaseUrl()
await readFilePipe()
