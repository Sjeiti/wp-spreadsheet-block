import XLSX from 'xlsx'
import HyperFormula from 'hyperformula'
import {overwriteLog} from './utils/overwriteLog'
import {nextFrame} from './utils'
import '../scss/style.scss'

nextFrame(init, 3)

function init(){
  const element = document.querySelector('[data-spreadsheet-block]')
  const isTest = element.matches('[data-test]')
  const elements = document.querySelectorAll('[data-spreadsheet-block]')
  console.log('num',elements.length) // todo multiple
  if (!isTest) {
    const data = element.dataset.spreadsheetBlock
    const {spreadsheetURI} = JSON.parse(data)
    fetch(spreadsheetURI)
      .then(response => response.ok?response.arrayBuffer():(()=>{throw new Error(response.status)})())
      .then(loadedResultToSpreadsheetTable.bind(null, element))
      .catch(console.error.bind(console))
  } else {
    location.hostname==='localhost'&&overwriteLog()
    const inputFile = document.getElementById('file')
    inputFile.addEventListener('change', onInputFileChange)
    inputFile.value && inputFile.dispatchEvent(new Event('change'))
  }
}

function onInputFileChange(event){
  const [file] = event.target.files
  const reader = new FileReader()
  reader.addEventListener('load', onFileReaderLoad)
  reader.readAsBinaryString(file)
  getBase64(file)
}

function onFileReaderLoad(e) {
  const data = e.target.result

  const output = document.querySelector('[data-spreadsheet-block]')
  const hfInstance = loadedResultToSpreadsheetTable(output, data)

  output.addEventListener('click', onClickOutput.bind(null, hfInstance))
  hfInstance.on('valuesUpdated', onHyperFormulaValuesUpdated.bind(null, hfInstance, output))
}

function loadedResultToSpreadsheetTable(target, buffer) {
  const workbook = XLSX.read(buffer, {type: 'binary', bookDeps: true})
  const {SheetNames:sheetNames} = workbook
  const hfInstance = getHyperFormulaInstance(workbook)
  console.log('workbook', workbook) // todo: remove log
  console.log('hfInstance', hfInstance) // todo: remove log
  console.log('html', getHTML(workbook, sheetNames[0])) // todo: remove log
  const spreadsheetFragment = getSpreadsheetFragment(workbook)
  const sheets = sheetNames
    .map((sheet, i) => `
      ${sheetNames.length>1?`
        <input type="radio" name="foo" id="${getSheetID(sheet)}" ${i===0&&'checked'||''} class="visually-hidden" />
        <label for="${getSheetID(sheet)}">${sheet}</label>
      `:''}
      <div data-sheet="${sheet}">${getHTML(workbook, sheet)}</div>`)
    .join('')
  target.innerHTML = sheets
  return hfInstance
}

function getSheetID(name) {
  return 'sheet-'+name
}

function getSpreadsheetData(workbook) { 
  return Object.entries(workbook.Sheets, {}) 
      .map(([sheetName, sheet])=>{
        const colRows = []
        Object.entries(sheet)
            .filter(([key])=>key[0]!=='!')
            .map(([cellName, cell])=>{
              const {t:type,n:number,v:value,f:fnc} = cell
              const [x, y] = cellToXY(cellName)
              const formula = fnc&&'='+fnc||fnc
              const row = colRows[y]||(colRows[y] = [])
              row[x] = {x, y, type, formula, value}
              return row
            })
        for (var i=0,l=colRows.length;i<l;i++) {
        	if (!colRows[i]) colRows[i] = []
        }
        return [sheetName, colRows.map(a=>a||[])]
      })
}

function getSpreadsheetFragment(workbook) {
  //const createElement = document.createElement.bind(document)
  const elm = (name,parent,attr)=>{
    const element = document.createElement(name)
    Object.entries(([name,value])=>{
      element.seAttribute(name==='className'?'class':name,value)
    })
    parent?.appendChild(element)
    return element
  }
  const fragment = document.createDocumentFragment()
  const datalist = getSpreadsheetData(workbook)
  console.log('datalist',JSON.stringify(datalist)) // todo: remove log
  datalist.forEach(([name,rows],i)=>{
    if (i>1) {
      const id = getSheetID(sheet)
      elm('input',fragment,{
        type: 'radio'
        ,name: 'foo'
        ,id
        ,className: 'visually-hidden'
        ,...(i===0?{checked:true}:{})
      })
      elm('label',fragment,{
        for: id
      }).appendChild(document.createTextElement(sheet))
    }
    const table = elm('table',fragment)
    const tbody = elm('tbody',table)
    rows.forEach(row=>{
      const tr = elm('tr',tbody)
      rows.forEach(cell=>{
        elm('td',tr,{
          //todo
        })
      })
    })
  })
  return fragment
}

function getHyperFormulaInstance(workbook) {
  const hfSheets = getSpreadsheetData(workbook).reduce((acc,[name,cols])=>{
    acc[name] = cols.map(rows=>rows.map(({formula,value})=>formula||value))
    return acc
  },{})
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
