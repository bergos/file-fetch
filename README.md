# file-fetch

[![build status](https://img.shields.io/github/actions/workflow/status/bergos/file-fetch/test.yaml?branch=master)](https://github.com/bergos/file-fetch/actions/workflows/test.yaml)
[![npm version](https://img.shields.io/npm/v/file-fetch.svg)](https://www.npmjs.com/package/file-fetch)

`file-fetch` is a [nodeify-fetch](https://www.npmjs.com/package/nodeify-fetch) compatible fetch for read and write access to the local file system using `file:` URLs and URIs (including
implicit ones using relative paths).

## Usage

### Read

Reading a file from the file system is as easy as fetching it on the Web.
Call `fetch` with the URL, and the content is provided as `Readable` stream in `res.body`.
The example below uses an absolute URL, but relative paths are also supported.
See the [Supported URLs and URIs](#supported-urls-and-uris) section for more details.

```js
import fetch from 'file-fetch'

const res = await fetch(new URL('example.js', import.meta.url))

res.body.pipe(process.stdout)
```

It's also possible to handle the content without streams.
The async `res.text()` method returns the whole content as a string.

```js
import fetch from 'file-fetch'

const res = await fetch(new URL('example.js', import.meta.url))

console.log(await res.text())
```

A similar method `res.json()` is available to parse JSON content and return the parsed result.

```js
import fetch from 'file-fetch'

const res = await fetch(new URL('example.js', import.meta.url))

console.log(await res.json())
```

### Write

Writing content to a file is done with the same function but with the `PUT` method.
The content must be provided as a `string` or a `Readable` stream object.

```js
import fetch from 'file-fetch'

await fetch('file:///tmp/example.log', {
  method: 'PUT',
  body: 'test'
})
```

```js
import fetch from 'file-fetch'
import { Readable } from 'readable-stream'

await fetch('file:///tmp/example.log', {
  method: 'PUT',
  body: Readable.from(['test'])
})
```

## Options

`file-fetch` supports the following non-standard options:

- `baseURL`: A `string` or `URL` used to resolve relative paths and URIs.
- `contentType`: A `string` or `function` to determine the media type based on the file extension or a fixed value.
  It can be useful if file extensions or media types not covered by [mime-db](https://www.npmjs.com/package/mime-db) are required.

## Custom fetch with fixed baseURL or contentType lookup

Custom fetch instances can be useful if requests should be processed with relative paths to a directory that is not the current working directory.
The `contentType` argument can also be predefined for the instance.
The example below shows how to set the `baseURL` to a relative path of the current script and how to use a custom `contentType` function: 

```js
import { factory as fetchFactory } from 'file-fetch'

const baseURL = new URL('examples', import.meta.url)
const contentType = ext => ext === 'json' ? 'application/ld+json' : 'application/octet-stream'

const fetch = fetchFactory({ baseURL, contentType })

const res = await fetch('example.js')
const text = await res.text()
```

## Supported URLs and URIs

Different styles of URLs and URIs are supported.

### Absolute URLs

An absolute URL for a `file` schema must start with `file:///`.
No further resolve logic is used.

Example:

```
file:///home/user/tmp/content.txt
```

### URIs

URIs are supported for use cases where a `file` scheme is required to distinguish identifiers by scheme and if relative paths are required.
The [relative paths](#relative-paths) logic is used to resolve the full URL.

Example:

```
file:tmp/content.txt
```

### Relative paths

Relative paths are resolved with the given `baseURL` or, if not given, with the working directory.

Example:

```
tmp/content.txt
```
