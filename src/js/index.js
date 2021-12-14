import XLSX from 'xlsx'
import HyperFormula from 'hyperformula'
import {overwriteLog} from './utils/overwriteLog'
import {nextFrame, createElement} from './utils'
import '../scss/style.scss'
import {cellToXY} from './utils/spreadsheet'

console.log('spreadsheetblock',23) // todo: remove log

nextFrame(init, 3)

export function init(){
  const element = document.querySelector('[data-spreadsheet-block]')
  if (element) {
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
      // location.hostname==='localhost'&&overwriteLog()
      const inputFile = document.getElementById('file')
      inputFile.addEventListener('change', onInputFileChange)
      inputFile.value && inputFile.dispatchEvent(new Event('change'))
    }
  }
}

function onInputFileChange(event){
  const [file] = event.target.files
  const reader = new FileReader()
  reader.addEventListener('load', onFileReaderLoad)
  reader.readAsBinaryString(file)
  // getBase64(file)
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
  console.log('workbook',workbook) // todo: remove log
  const spreadSheetData = getSpreadsheetData(workbook)
  const hfInstance = getHyperFormulaInstance(spreadSheetData)
  while (target.children.length) target.removeChild(target.children[0])
  target.appendChild(getSpreadsheetFragment(spreadSheetData))
  return hfInstance
}

function getSpreadsheetData(workbook) {
  return Object.entries(workbook.Sheets, {})
      .map(([sheetName, sheet])=>{
        const colRows = []
        Object.entries(sheet)
            .filter(([key])=>key[0]!=='!')
            .map(([cellName, cell])=>{
              const {t:type,v:value,f:fnc/*,r:formatted*/,c:comments} = cell // t,v,r,h,f,w
              const [x, y] = cellToXY(cellName)
              const formula = fnc&&'='+fnc||fnc
              const row = colRows[y]||(colRows[y] = [])
              const comment = comments?.[0]?.t
              console.log('comment',comment) // todo: remove log
              //console.log('formatted',formatted,cell) // todo: remove log
              // const [,format] = formatted?.match(/<([^>]+)/)||[]
              row[x] = {x, y, type, formula, value/*, format*/, comment}
              return row
            })
        for (var i=0,l=colRows.length;i<l;i++) {
        	if (!colRows[i]) colRows[i] = []
        }
        return [sheetName, colRows.map(a=>a||[])]
      })
}

function getHyperFormulaInstance(spreadSheetData) {
  const hfSheets = spreadSheetData.reduce((acc,[name,cols])=>{
    acc[name] = cols.map(rows=>rows.map(({formula,value})=>formula||value))
    return acc
  },{})
  return HyperFormula.buildFromSheets(hfSheets, {licenseKey: 'gpl-v3'})
}

function getSpreadsheetFragment(spreadSheetData) {
  const createTextNode = document.createTextNode.bind(document)
  const fragment = document.createDocumentFragment()
  const numSheets = spreadSheetData.length
  const spreadSheetName = 'spreadsheet'+Date.now()+(Math.random()*1E9<<0)
  spreadSheetData.forEach(([name,rows],sheetIndex)=>{
    if (numSheets>1) {
      const id = getSheetID(name)
      createElement('input',fragment,{
        type: 'radio'
        ,name: spreadSheetName
        ,id
        ,className: 'visually-hidden'
        ,...(sheetIndex===0?{checked:true}:{})
      })
      createElement('label',fragment,{
        for: id
      }).appendChild(createTextNode(name))
    }
    const table = createElement('table',fragment)
    table.dataset.sheet = name
    const tbody = createElement('tbody',table)
    const maxLength = Math.max(...rows.map(row=>row.length))
    for (let i=0,l=rows.length;i<l;i++) {
    	const row = rows[i]
      const tr = createElement('tr',tbody)
      for (let j=0;j<maxLength;j++) {
        const cell = row[j]
        const {x, y, type, formula, value} = cell||{}
        const td = createElement('td',tr,cell?Object.entries({x,y,type}).reduce((acc,[name,value])=>(acc['data-'+name]=value,acc),{}):{})
        value&&td.appendChild(createTextNode(value))
      }
    }
  })
  return fragment
}

function onClickOutput(hfInstance, e) {
  const {target, target: {dataset: {x, y, type}}} = e
  if (type==='n') {
    const wrapper = target.closest('[data-sheet]')
    const sheetName = wrapper.dataset.sheet
    const sheet = hfInstance.getSheetId(sheetName)
    //
    const col = parseInt(x,10)
    const row = parseInt(y,10)
    const cellAddress = {col, row, sheet}
    //
    const cellValue = hfInstance.getCellValue(cellAddress)
    const cellFormula = hfInstance.getCellFormula(cellAddress)
    const canSetContents = hfInstance.isItPossibleToSetCellContents(cellAddress)
    //
    console.log('poepjes') // todo: remove log
    document.documentElement.dispatchEvent(new CustomEvent('what', {detail: {
        col, row, cellValue
      }}))
    //
    if (cellFormula===undefined&&canSetContents) {
      hfInstance.setCellContents(cellAddress, cellValue + 1)
    }
  }
}

function onHyperFormulaValuesUpdated(hfInstance, parent, changed){
  changed.forEach(change=>{
    const {address: {col, row, sheet}, newValue} = change
    const sheetName = hfInstance.getSheetName(sheet)
    const cellElment = parent.querySelector(`[data-sheet="${sheetName}"] [data-x="${col}"][data-y="${row}"]`)
    cellElment.textContent = newValue
  })
}

function getSheetID(name) {
  return 'sheet-'+name
}

function getBase64(file) {
  const reader = new FileReader()
  reader.readAsDataURL(file)
  reader.addEventListener('error', console.log.bind(console))
}
