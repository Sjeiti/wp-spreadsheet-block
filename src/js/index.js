import XLSX from 'xlsx'
import HyperFormula from 'hyperformula'
import {overwriteLog} from './utils/overwriteLog'
import {nextFrame, createElement} from './utils'
import '../scss/style.scss'
import {cellToXY} from './utils/spreadsheet'

console.log('spreadsheetblock',23) // todo: remove log

export const spreadsheetEvent = 'spreadsheetEvent'

const className = {
  editable: 'editable'
}

nextFrame(init, 3)

export function init(){
  Array.from(document.querySelectorAll('[data-spreadsheet-block]')).forEach(element=>{
    const isTest = element.matches('[data-test]')
    const {spreadsheetBlock} = element.dataset
    const data = spreadsheetBlock&&JSON.parse(spreadsheetBlock)||{}
    if (!isTest) {
      fetch(data.spreadsheetURI)
        .then(response => response.ok?response.arrayBuffer():(()=>{throw new Error(response.status)})())
        .then(buffer=>loadedResultToSpreadsheetTable(element, buffer, data))
        .catch(console.error.bind(console))
    } else {
      // location.hostname==='localhost'&&overwriteLog()
      const inputFile = document.getElementById('file')
      inputFile.addEventListener('change', onInputFileChange.bind(null, data))
      inputFile.value && inputFile.dispatchEvent(new Event('change'))
    }
  })
}

function onInputFileChange(data, event){
  const [file] = event.target.files
  const reader = new FileReader()
  reader.addEventListener('load', onFileReaderLoad.bind(null, data))
  reader.readAsBinaryString(file)
}

function onFileReaderLoad(data, e) {
  const output = document.querySelector('[data-spreadsheet-block]')
  const {result} = e.target
  loadedResultToSpreadsheetTable(output, result, data)
}

function loadedResultToSpreadsheetTable(target, buffer, data) {
  const workbook = XLSX.read(buffer, {type: 'binary', bookDeps: true})
  console.log('workbook',workbook) // todo: remove log
  const spreadSheetData = getSpreadsheetData(workbook)
  console.log('spreadSheetData',spreadSheetData) // todo: remove log
  const hfInstance = getHyperFormulaInstance(spreadSheetData)
  while (target.children.length) target.removeChild(target.children[0])
  target.appendChild(getSpreadsheetFragment(spreadSheetData, data))
  //
  console.log('foo',23,target) // todo: remove log
  target.addEventListener('click', onClickOutput.bind(null, hfInstance))
  target.addEventListener('change', onChangeOutput.bind(null, hfInstance))
  hfInstance.on('valuesUpdated', onHyperFormulaValuesUpdated.bind(null, hfInstance, target))
  //
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
              const formula = fnc&&'='+fnc||fnc // weird high numbrs for some xls function values
              const row = colRows[y]||(colRows[y] = [])
              const comment = comments?.[0]?.t
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

function getSpreadsheetFragment(spreadSheetData, data) {
  const {admin=false, hide=[], editable=[], head=[]} = data
  const createTextNode = document.createTextNode.bind(document)
  const fragment = document.createDocumentFragment()
  const spreadSheetName = getSpreadsheetName()
  //
  if (admin){
    const div = createElement('div',fragment,{className:'nav'})
    ;['editable','head'].forEach(name=>{
      const label = createElement('label',div,{})
      label.appendChild(createTextNode(name))
      createElement('input',label,{
        type: 'checkbox'
        ,name: getInputName(spreadSheetName,name)
      })
    })
  }
  //
  const spreadSheetDataVisible = admin&&spreadSheetData||spreadSheetData.filter(([name])=>!hide.includes(name))
  const numSheets = spreadSheetDataVisible.length
  //
  spreadSheetDataVisible.forEach(([name,rows],sheetIndex)=>{
    const isSheetHidden = hide.includes(name)
    if (numSheets>1) { // add tabs for multiple sheets
      const id = getInputName(spreadSheetName,'tab',name)
      createElement('input',fragment,{
        type: 'radio'
        ,name: getInputName(spreadSheetName,'tab')
        ,id
        ,className: 'visually-hidden'
        ,...(sheetIndex===0?{checked:true}:{})
      })
      const label = createElement('label',fragment,{ for: id })
      label.appendChild(createTextNode(name))
      admin&&createElement('input',label,{
        type: 'checkbox'
        ,name: getInputName(spreadSheetName,'hide',name)
        ,...(isSheetHidden?{checked:true}:{})
      })
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
        const cellId = getCellId(name, x, y)
        const isHead = head.includes(cellId)
        const isEditable = editable.includes(cellId)
        const className = `x${x} y${y}`+(isEditable?' editable':'')
        const params = cell?Object.entries({x,y,type}).reduce((acc,[name,value])=>(acc['data-'+name]=value,acc),{className}):{className}
        const tableCellType = isHead&&'th'||'td'
        const tx = createElement(tableCellType,tr,params)
        value&&tx.appendChild(createTextNode(value))
      }
    }
  })
  return fragment
}

function onChangeOutput(hfInstance, e) {
  const {target: {name, checked}} = e
  const [spreadsheet, command, param] = name.split(/_/g)
  if (['hide','editable','head'].includes(command)) {
    dispatchEvent(command, {spreadsheet, param, checked})
  }
}

function onClickOutput(hfInstance, e) {
  console.log('onClickOutput', e) // todo: remove log
  const {target, target: {dataset: {x, y, type}}} = e

  const wrapper = target.closest('[data-sheet]')
  if (wrapper) {
    const sheetName = wrapper.dataset.sheet
    const cellPosition = getCellId(sheetName, x, y)
    console.log('\t',cellPosition) // todo: remove log

    const sheet = hfInstance.getSheetId(sheetName)
    console.log('\t', x, y, type, sheetName) // todo: remove log
    //
    const col = parseInt(x,10)
    const row = parseInt(y,10)
    const cellAddress = {col, row, sheet}
    //
    const cellValue = hfInstance.getCellValue(cellAddress)
    const cellFormula = hfInstance.getCellFormula(cellAddress)
    const canSetContents = hfInstance.isItPossibleToSetCellContents(cellAddress)
    //
    dispatchEvent('cell', {col, row, cellValue, sheetName})
    //
    if (x&&y&&type==='n') {
      if (cellFormula===undefined&&canSetContents) {
        hfInstance.setCellContents(cellAddress, cellValue + 1)
      }
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

function dispatchEvent(command, data){
  document.documentElement.dispatchEvent(new CustomEvent(spreadsheetEvent, {detail: {
      command, ...data
    }}))
}

function getInputName(sheet,...names) {
  return sheet+'_'+names.join('_')
}


export function getCellId(sheetName, col, row) {
  return `${sheetName}!${col}-${row}`
}

let spreadsheetIndex = 0
function getSpreadsheetName() {
  return 'spreadsheet'+(spreadsheetIndex++)
  // return 'spreadsheet'+Date.now()+(Math.random()*1E9<<0)
}

function getBase64(file) {
  const reader = new FileReader()
  reader.readAsDataURL(file)
  reader.addEventListener('error', console.log.bind(console))
}
