import get from './lib/get.js'
import put from './lib/put.js'
import resolveUrl from './lib/resolveUrl.js'
import response from './lib/response.js'

async function fetch (uri, { baseURL, body, contentType, method = 'GET' } = {}) {
  method = method.toUpperCase()

  const url = resolveUrl(uri.toString(), baseURL)

  if (method === 'GET') {
    return get(url, { contentType })
  }

  if (method === 'HEAD') {
    return get(url, { contentType, method: 'HEAD' })
  }

  if (method === 'PUT') {
    return put(url, { body })
  }

  return response(405)
}

export default fetch
