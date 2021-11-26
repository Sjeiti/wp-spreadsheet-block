import XLSX from 'xlsx'

console.log('hello', 12334) // todo: remove log
overwriteLog()

const inputFile = document.getElementById('file')
inputFile.addEventListener('change', onInputFileChange)

console.log('inputFile.value',inputFile.value) // todo: remove log
inputFile.value && inputFile.dispatchEvent(new Event('change'))

const output = document.createElement('div')
document.body.appendChild(output)

function onInputFileChange(event){
  const [file] = event.target.files
  console.log('change',file,event) // todo: remove log
  const reader = new FileReader()
  reader.addEventListener('load', onFileReaderLoad)
  reader.readAsBinaryString(file)
  //
  getBase64(file)
}

function onFileReaderLoad(e) {
  console.log('loadReader') // todo: remove log
  const data = e.target.result
  const workbook = XLSX.read(data, {type: 'binary'})
  console.log('workbook',workbook) // todo: remove log

  // sjs-F11
  // sjs-B29

  output.innerHTML = workbook.SheetNames
    .map(sheet => XLSX.write(workbook, {
      sheet
      , type: 'string'
      , bookType: 'html'
      // , editable: true
    }))
    .join('')
  console.log('output.innerHTML',output.innerHTML) // todo: remove log

  console.log('sheets',Object.values(workbook.Sheets)) // todo: remove log
  console.log('formulae',Object.values(workbook.Sheets).map(XLSX.utils.sheet_to_formulae)) // todo: remove log
}

function getBase64(file) {
   const reader = new FileReader()
   reader.readAsDataURL(file)
   reader.addEventListener('load', console.log.bind(console, 'base64'))
   reader.addEventListener('error', console.log.bind(console))
}


function overwriteLog(){
  const {console} = window
  const logOld = console.log.bind(console)
  const pre = document.createElement('pre')
  pre.textContent = 'log'
  document.body.appendChild(pre)
  console.log = (...args) => {
    pre.textContent += '\n'+args.join(' ')
    logOld(...args)
  }
  console.log('init')
}
