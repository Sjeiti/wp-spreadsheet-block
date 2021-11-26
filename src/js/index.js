import fileReaderStream from 'filereader-stream'
import csv from 'csv-parser'
import XLSX from 'xlsx'

const {console} = window
const logOld = console.log.bind(console)

console.log('hello', 12334) // todo: remove log

const inputFile = document.getElementById('file')

const pre = document.createElement('pre')
pre.textContent = 'o'
document.body.appendChild(pre)

console.log = (...args) => {
  pre.textContent += '\n'+args.join(' ')
  logOld(...args)
}

console.log('hallo')

inputFile.addEventListener('change', event => {
  const [file] = event.target.files
  if (files.length === 0) return

  console.log('loaded',file) // todo: remove log

  const data = new Uint8Array(req.response)
  const workbook = XLSX.read(data, {type: 'array'})
  console.log('workbook',workbook) // todo: remove log

  fileReaderStream(files[0])
    .pipe(csv())
    .on('data', data => console.log(data))
})


