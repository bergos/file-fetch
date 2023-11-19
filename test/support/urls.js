const urls = {
  fileTxtRelative: 'file.txt',
  fileTxt: new URL('file.txt', import.meta.url),
  supportDir: new URL('.', import.meta.url)
}

export default urls
