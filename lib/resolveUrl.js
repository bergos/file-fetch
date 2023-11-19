import { pathToFileURL } from 'node:url'

function resolveUrl (url, baseURL = pathToFileURL(`${process.cwd()}/`)) {
  const schemaMatch = url.match(/^([a-z]+):/)

  // non-file URIs
  if (schemaMatch && schemaMatch[1] !== 'file') {
    throw new Error(`unknown schema: ${url}`)
  }

  // path
  if (!schemaMatch) {
    return new URL(url, baseURL)
  }

  // URLs
  if (url.startsWith('file:///')) {
    return new URL(url)
  }

  // URIs
  return new URL(url.slice(5), baseURL)
}

export default resolveUrl
