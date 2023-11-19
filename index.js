import factory from './factory.js'
import fetch from './fetch.js'

const Headers = globalThis.Headers

export {
  fetch as default,
  factory,
  Headers
}
