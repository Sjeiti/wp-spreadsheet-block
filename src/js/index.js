import fileReaderStream from 'filereader-stream'
import csv from 'csv-parser'

console.log('hello', 12334) // todo: remove log

const fileEl = document.getElementById("file")

fileEl.addEventListener("change", event => {
  const files = event.target.files
  if (files.length === 0) return

  fileReaderStream(files[0])
    .pipe(csv())
    .on('data', data => console.log(data))
})

