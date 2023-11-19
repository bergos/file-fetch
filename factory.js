import fetch from './fetch.js'

function factory ({ baseURL, contentType } = {}) {
  return (uri, options) => {
    return fetch(uri, { baseURL, contentType, ...options })
  }
}

export default factory
