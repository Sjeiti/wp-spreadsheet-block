import XLSX from 'xlsx'

console.log('hello', 12334) // todo: remove log
overwriteLog()

const inputFile = document.getElementById('file')
inputFile.addEventListener('change', onInputFileChange)

const output = document.createElement('div')
document.body.appendChild(output)

function onInputFileChange(event){
  const [file] = event.target.files
  console.log('change',file) // todo: remove log
  const reader = new FileReader();
  reader.addEventListener('load', onFileReaderLoad)
  reader.readAsBinaryString(file)
}

function onFileReaderLoad(e) {
  console.log('loadReader') // todo: remove log
  const data = e.target.result;
  const workbook = XLSX.read(data, {type: 'binary'})
  console.log('workbook',workbook) // todo: remove log

  output.innerHTML = workbook.SheetNames
    .map(sheet => XLSX.write(workbook, {sheet, type:'string', bookType:'html'}))
    .join('')
  console.log('output.innerHTML',output.innerHTML) // todo: remove log
}

function overwriteLog(){
  const {console} = window
  const logOld = console.log.bind(console)
  const pre = document.createElement('pre')
  pre.textContent = 'o'
  document.body.appendChild(pre)
  console.log = (...args) => {
    pre.textContent += '\n'+args.join(' ')
    logOld(...args)
  }
  console.log('hallo')
}
