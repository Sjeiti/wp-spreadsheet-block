import XLSX from 'xlsx'
import HyperFormula from 'hyperformula'

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
  const hfInstance = getHyperFormulaInstance(workbook)

  console.log('workbook', workbook) // todo: remove log
  console.log('hfInstance', hfInstance) // todo: remove log

  // sjs-F11

  output.innerHTML = workbook.SheetNames
    .map(sheet => `<div data-sheet="${sheet}">${getHTML(workbook, sheet)}</div>`)
    .join('')

  output.addEventListener('click', onClickOutput.bind(null, hfInstance))
  hfInstance.on('valuesUpdated', onHyperFormulaValuesUpdated.bind(null, hfInstance, output))
}

function getHyperFormulaInstance(workbook) {
  const hfSheets = Object.entries(workbook.Sheets, {})
      .map(([sheetName, sheet])=>{
        const colRows = []
        Object.entries(sheet)
            .filter(([key])=>key[0]!=='!')
            .map(([cellName, cell])=>{
              const {t:type,n:number,v:value,f:fnc} = cell
              const [x, y] = cellToXY(cellName)
              const formula = fnc&&'='+fnc||fnc
              const row = colRows[y]||(colRows[y] = [])
              row[x] = formula||value
              return row
            })
        for (var i=0,l=colRows.length;i<l;i++) {
        	if (!colRows[i]) colRows[i] = []
        }
        return [sheetName, colRows.map(a=>a||[])]
      })
      .reduce((acc, [sheetName, entries])=>((acc[sheetName] = entries), acc), {})
  console.log('hfSheets',hfSheets) // todo: remove log
  const hfInstance = HyperFormula.buildFromSheets(hfSheets, {licenseKey: 'gpl-v3'}) // MIT
  return hfInstance
}

function cellToXY(cellName) {
  const [, stringX, stringY] = cellName.match(/^([^\d]+)(\d+)$/)
  const x = stringToNumeral(stringX) - 1
  const y = parseInt(stringY, 10) - 1
  return [x, y]
}

function xyToCell(x, y) {
  return numeralToString(x)+y.toString()
}

function stringToNumeral(string) {
  return string.split('').reverse().reduce((acc,s,i)=>acc+(s.charCodeAt(0)-64)*(26**i), 0)
}

function numeralToString(numeral) {
  let s = ''
  while (numeral > 0) {
    const index = (numeral - 1) % 26
    s = String.fromCharCode(65 + index) + s
    numeral = (numeral - index)/26 | 0
  }
  return s
}
// [0,1, 25,26,27,28, 111, 259,260,261, 285,286,287, 1E4].forEach(i=>console.log(`numeralToString(${i})`,numeralToString(i),stringToNumeral(numeralToString(i)))) // todo: remove log
// console.log(Array.from(new Array(8E2)).map((o,i)=>stringToNumeral(numeralToString(i))+':'+numeralToString(i)).join('\n')) // todo: remove log // todo: remove log

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
  window.onerror = console.log.bind(console)
}

function onClickOutput(hfInstance, e) {
  const {target, target: {id, dataset: {t:type, v:value}}} = e
  if (type==='n') {
    const wrapper = target.closest('[data-sheet]')
    const sheetName = wrapper.dataset.sheet
    const cellName = id.split(/\-/).pop()
    //
    const sheet = hfInstance.getSheetId(sheetName)
    //
    const [col, row] = cellToXY(cellName)
    const cellAddress = {col, row, sheet}
    //
    const cellValue = hfInstance.getCellValue(cellAddress)
    const cellFormula = hfInstance.getCellFormula(cellAddress)
    const canSetContents = hfInstance.isItPossibleToSetCellContents(cellAddress)
    //
    if (cellFormula===undefined&&canSetContents) {
      hfInstance.setCellContents(cellAddress, cellValue + 1)
    }
  }
}

function onHyperFormulaValuesUpdated(hfInstance, parent, changed){
  changed.forEach(change=>{
    const {address: {col, row, sheet}, newValue} = change
    const cellName = xyToCell(col+1, row+1)
    const sheetName = hfInstance.getSheetName(sheet)
    const cellElment = parent.querySelector(`[data-sheet="${sheetName}"] [id="sjs-${cellName}"]`)
    cellElment.textContent = newValue
  })
}

function getHTML(workbook, sheet){
  return XLSX.write(workbook, {
    sheet
    , type: 'string'
    , bookType: 'html'
    //, editable: true
  })
}
