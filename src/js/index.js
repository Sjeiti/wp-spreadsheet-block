import fileReaderStream from 'filereader-stream'
import csv from 'csv-parser'
import XLSX from 'xlsx'

console.log('hello', 12334) // todo: remove log

const fileEl = document.getElementById("file")

const pre = document.createElement('pre')
pre.textContent = 'o'
document.body.appendChild(pre)

const logOld = window.console.log
window.console.log = (...args) => {
  pre.textContent += '\n'+args.join(' ')
}

console.log('hallo')

fileEl.addEventListener("change", event => {
  const files = event.target.files
  if (files.length === 0) return

  fileReaderStream(files[0])
    .pipe(csv())
    .on('data', data => console.log(data))
})


