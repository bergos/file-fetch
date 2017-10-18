# file-fetch

`file-fetch` is a [nodeify-fetch](https://www.npmjs.com/package/nodeify-fetch) compatible fetch for read and write access to the local file system using `file://` URLs.

## Usage

Only the URL is required to read a file:

```
const fileFetch = require('file-fetch')

fileFetch('file://etc/hosts').then((res) => {
  res.body.pipe(stdout)
})

```

To write files the method `PUT` must be used and readable stream must be given as body:

```
fileFetch('file://tmp/example.log', {
  method: 'PUT',
  body: stream
})
```
