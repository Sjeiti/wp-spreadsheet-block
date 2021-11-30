import XLSX from 'xlsx'

console.log('XLSX',XLSX,XLSX.utils) // todo: remove log

// console.log('hello', 12334) // todo: remove log
overwriteLog()

const inputFile = document.getElementById('file')
inputFile.addEventListener('change', onInputFileChange)

inputFile.value && inputFile.dispatchEvent(new Event('change'))

const output = document.createElement('div')
document.body.appendChild(output)

function onInputFileChange(event){
  const [file] = event.target.files
  const reader = new FileReader()
  reader.addEventListener('load', onFileReaderLoad)
  reader.readAsBinaryString(file)
  //
  getBase64(file)
}

function onFileReaderLoad(e) {
  const data = e.target.result
  const workbook = XLSX.read(data, {type: 'binary', bookDeps: true})
  console.log('workbook',workbook) // todo: remove log

  // sjs-F11
  // sjs-B29

  output.innerHTML = workbook.SheetNames
    .map(sheet => `<div data-sheet="${sheet}">${getHTML(workbook, sheet)}</div>`)
    .join('')

  output.addEventListener('click', onClickOutput.bind(null, workbook))
}

function getBase64(file) {
   const reader = new FileReader()
   reader.readAsDataURL(file)
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


function onClickOutput(workbook, e) {
  const {target, target: {id, dataset: {t:type, v:value}}} = e
  if (type==='n') {
    const wrapper = target.closest('[data-sheet]')
    const sheetName = wrapper.dataset.sheet
    const cellName = id.split(/\-/).pop()
    const sheet = workbook.Sheets[sheetName]
    const cell = sheet[cellName]
    const formulae = XLSX.utils.sheet_to_formulae(sheet)
    console.log('click',{sheetName,cell,sheet,formulae}) // todo: remove log
    //
    const formula = formulae.filter(s=>new RegExp('^'+cellName).test(s))

    //
    // cell.v = cell.v + 1
    // const formula = formulae.filter(s=>new RegExp('^'+cellName).test(s))
    // const formulaIndex = formulae.indexOf(formula)
    // formulae[formulaIndex] = cellName +' = '+ cell.v
    // console.log('cell',cell.v,formulae[formulaIndex]) // todo: remove log
    // wrapper.innerHTML = getHTML(workbook, sheetName)
  }
}

function getHTML(workbook, sheet){
  return XLSX.write(workbook, {
    sheet
    , type: 'string'
    , bookType: 'html'
    //, editable: true
  })
}
