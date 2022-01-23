import XLSX from 'xlsx'
import HyperFormula from 'hyperformula'
import {overwriteLog} from './utils/overwriteLog'
import {nextFrame, createElement} from './utils'
import '../scss/style.scss'
import {cellToXY} from './utils/spreadsheet'
import symbolDefs from '!!raw-loader!../assets/symbol-defs.svg'

export const spreadsheetEvent = 'spreadsheetEvent'

const className = {
  editable: 'editable',
  admin: 'admin',
  nav: 'nav',
  addingEditable: 'adding-editable',
  addingHead: 'adding-head',
  visuallyHidden: 'visually-hidden',
  hideLabel: 'hide-label',
  cellEdit: 'cell-edit',
  formula: 'formula'
}
const command = {
  hide: 'hide',
  editable: 'editable',
  head: 'head'
}
const cellOptions = [command.editable, command.head]

nextFrame(init, 3)

export function init(){
  Array.from(document.querySelectorAll('[data-spreadsheet-block]')).forEach(element=>{
    const isTest = element.matches('[data-test]')
    const {spreadsheetBlock} = element.dataset
    const data = spreadsheetBlock&&JSON.parse(spreadsheetBlock)||{}
    const {admin} = data
    admin&&element.classList.add(className.admin)
    if (!isTest) {
      fetch(data.spreadsheetURI)
        .then(response => response.ok?response.arrayBuffer():(()=>{throw new Error(response.status)})())
        .then(buffer=>loadedResultToSpreadsheetTable(element, buffer, data))
        .catch(console.error.bind(console))
    } else {
      location.hostname==='localhost'&&overwriteLog()
      const inputFile = document.getElementById('file')
      inputFile.addEventListener('change', onInputFileChange.bind(null, data))
      inputFile.value && inputFile.dispatchEvent(new Event('change'))
    }
  })
  document.querySelector('#symbol-defs')||document.body.insertAdjacentHTML('afterbegin', symbolDefs)
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
  target.appendChild(getSpreadsheetFragment(hfInstance, spreadSheetData, data))
  //
  target.addEventListener('click', onClickOutput.bind(null, hfInstance))
  target.addEventListener('change', onChangeOutput.bind(null, hfInstance))
  target.addEventListener('input', onCellInput.bind(null, hfInstance))

  hfInstance.on('valuesUpdated', onHyperFormulaValuesUpdated.bind(null, hfInstance, target))
  //
  return hfInstance
}

/**
 * Get spreadsheet data
 * @param {WorkBook} workbook
 * @return {[string, (*|Array)[]][]}
 */
function getSpreadsheetData(workbook) {
  return Object.entries(workbook.Sheets, {})
      .map(([sheetName, sheet])=>{
        const colRows = []
        Object.entries(sheet)
            .filter(([key])=>key[0]!=='!')
            .map(([cellName, cell])=>{
              const {t:type,v:value,f:fnc/*,r:formatted*/,c:comments} = cell // t,v,r,h,f,w
              const [x, y] = cellToXY(cellName)
              const formula = fnc&&'='+fnc||fnc // weird high numbers for some xls function values
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

/**
 * Get the hyperFormula instance
 * @param {object} spreadSheetData
 * @return {HyperFormula}
 */
function getHyperFormulaInstance(spreadSheetData) {
  const hfSheets = spreadSheetData.reduce((acc,[name,cols])=>{
    acc[name] = cols.map(rows=>rows.map(({formula,value})=>formula||value))
    return acc
  },{})
  return HyperFormula.buildFromSheets(hfSheets, {licenseKey: 'gpl-v3'})
}

/**
 * Create a document fragment for the spreadsheet table
 * @param {HyperFormula} hfInstance
 * @param {object} spreadSheetData
 * @param {object} data
 * @return {DocumentFragment}
 */
function getSpreadsheetFragment(hfInstance, spreadSheetData, data) {
  const {admin=false, hide=[], editable=[], head=[], values={}} = data
  const createTextNode = document.createTextNode.bind(document)
  const fragment = document.createDocumentFragment()
  const spreadSheetName = getSpreadsheetName()
  //
  if (admin){
    const div = createElement('div',fragment,{className:className.nav})
    div.appendChild(createTextNode('cell options: '))
    cellOptions.forEach(name=>{
      const id = spreadSheetName+'cell'+name
      createElement('input',div,{
        id
        ,type: 'checkbox'
        ,name: getInputName(spreadSheetName,name)
        ,className: className.visuallyHidden
      })
      createElement('label',div,{for:id, className:className.cellEdit})
          .appendChild(createTextNode(name))
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
        ,className: className.visuallyHidden
        ,...(sheetIndex===0?{checked:true}:{})
      })
      const label = createElement('label',fragment,{ for: id })
      label.appendChild(createTextNode(name))
      if (admin){
        const hideName = getInputName(spreadSheetName,'hide',name)
        createElement('input',label,{
          type: 'checkbox'
          ,name: hideName
          ,id: hideName
          ,...(isSheetHidden?{checked:true}:{})
          ,className: className.visuallyHidden
        })
        createElement('label',label,{
          className: className.hideLabel
          ,for: hideName
        }).innerHTML = svg('eye')+svg('eye-disabled')
      }
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
        const hasCustomValue = values.hasOwnProperty(cellId)
        const cellValue = hasCustomValue?values[cellId]:value
        const cellAddress = getCellAddress(x, y, sheetIndex)
        hasCustomValue&&requestAnimationFrame(hfInstance.setCellContents.bind(hfInstance, cellAddress, cellValue))
        //
        const isFormula = x!==undefined&&y!==undefined&&(()=>{
          const cellFormula = hfInstance.getCellFormula(cellAddress)
          return cellFormula!==undefined
        })()
        //
        const classNames = `x${x} y${y}`
            +(isEditable?' '+className.editable:'')
            +(isFormula?' '+className.formula:'')
        const params = cell?Object.entries({x,y,type}).reduce((acc,[name,value])=>(acc['data-'+name]=value,acc),{className:classNames}):{className:classNames}
        isEditable&&(params['contenteditable'] = 'true')
        const tableCellType = isHead&&'th'||'td'
        const tx = createElement(tableCellType,tr,params)
        cellValue&&tx.appendChild(createTextNode(cellValue))
      }
    }
  })
  return fragment
}

/**
 * Event handler for change on cell
 * @param {HyperFormula} hfInstance
 * @param {Event} e
 */
function onChangeOutput(hfInstance, e) {
  const {currentTarget, target: {name, checked}} = e
  const [spreadsheet, commandFromName, param] = name.split(/_/g)
  if ([command.hide,...cellOptions].includes(commandFromName)) {
    if (commandFromName===command.head) {
      currentTarget.classList.toggle(className.addingHead, checked)
    } else if (commandFromName===command.editable) {
      currentTarget.classList.toggle(className.addingEditable, checked)
    }
    dispatchEvent(commandFromName, {spreadsheet, param, checked})
  }
}

/**
 * Event handler for click on cell
 * @param {HyperFormula} hfInstance
 * @param {Event} e
 */
function onClickOutput(hfInstance, e) {
  const {target, target: {dataset: {x, y, type}}} = e
  const table = target.closest('[data-sheet]')
  const isValidTarget = x&&y
  if (table&&isValidTarget) {
    const wrapper = table.parentNode
    const isAddingEditable = wrapper.classList.contains(className.addingEditable)
    const isAddingHead = wrapper.classList.contains(className.addingHead)
    //
    // toggle cell editable state
    if (isAddingEditable&&!target.classList.contains(className.formula)) {
      target.classList.toggle(className.editable)
      const isEditable = target.classList.contains(className.editable)
      isEditable
        &&target.setAttribute('contenteditable', 'true')
        &&target.removeAttribute('contenteditable')
    }
    // toggle cell heading
    if (isAddingHead) {
      const isTd = target.nodeName==='TD'
      const newNodeName = isTd?'th':'td'
      const {parentNode,childNodes} = target
      const newElement = document.createElement(newNodeName)
      Array.from(target.attributes).forEach(({name,value})=>newElement.setAttribute(name,value))
      while (childNodes.length) newElement.appendChild(childNodes[0])
      parentNode.insertBefore(newElement, target)
      parentNode.removeChild(target)
    }
    const sheetName = table.dataset.sheet
    const sheet = hfInstance.getSheetId(sheetName)
    //
    const col = parseInt(x,10)
    const row = parseInt(y,10)
    const cellAddress = getCellAddress(col, row, sheet)
    //
    const cellValue = hfInstance.getCellValue(cellAddress)
    //
    dispatchEvent('cell', {col, row, cellValue, sheetName})
  }
}

/**
 * Event handler for input on cell
 * @param {HyperFormula} hfInstance
 * @param {Event} e
 */
function onCellInput(hfInstance, e){
  console.log('onCellInput')
  const {target, target: {dataset: {x, y, type}}} = e
  const table = target.closest('[data-sheet]')
  const isValidTarget = x&&y
  if (table&&isValidTarget) {
    const wrapper = table.parentNode
    const isAddingEditable = wrapper.classList.contains(className.addingEditable)
    //
    const isEditable = target.classList.contains(className.editable)
    //
    const sheetName = table.dataset.sheet
    const cellPosition = getCellId(sheetName, x, y)
    //
    const sheet = hfInstance.getSheetId(sheetName)
    //
    const col = parseInt(x,10)
    const row = parseInt(y,10)
    const cellAddress = getCellAddress(col, row, sheet)
    //
    const cellFormula = hfInstance.getCellFormula(cellAddress)
    const canSetContents = hfInstance.isItPossibleToSetCellContents(cellAddress)
    //
    if (x&&y&&type==='n'&&isEditable&&!isAddingEditable) {
      if (cellFormula===undefined&&canSetContents) {
        const cellValue = parseFloat(target.textContent)
        hfInstance.setCellContents(cellAddress, cellValue)
        dispatchEvent('value', {col, row, cellValue, sheetName})
      }
    }
  }
}

/**
 * Event handler for hyperFormula valuesUpdated event
 * @param {HyperFormula} hfInstance
 * @param {HTMLElement} parent
 * @param {object[]} changed
 */
function onHyperFormulaValuesUpdated(hfInstance, parent, changed){
  changed.forEach(change=>{
    const {address: {col, row, sheet}, newValue} = change
    const sheetName = hfInstance.getSheetName(sheet)
    const cellElment = parent.querySelector(`[data-sheet="${sheetName}"] [data-x="${col}"][data-y="${row}"]`)
    cellElment.textContent = newValue
  })
}

/**
 * Dispatch a custom event with custom data from documentElement
 * @param {string} command
 * @param {object} data
 */
function dispatchEvent(command, data){
  document.documentElement.dispatchEvent(new CustomEvent(spreadsheetEvent, {detail: {
      command, ...data
    }}))
}

/**
 * Get the name for an input field
 * @param {string} sheet
 * @param {string[]} names
 * @return {string}
 */
function getInputName(sheet,...names) {
  return sheet+'_'+names.join('_')
}

/**
 * The cell ID string for use in data objects
 * @param {string} sheetName
 * @param {number} col
 * @param {number} row
 * @returns {string}
 */
export function getCellId(sheetName, col, row) {
  return `${sheetName}!${col}-${row}`
}

let spreadsheetIndex = 0

/**
 * Get the spreadsheet name by increasing an index
 * @return {string}
 */
function getSpreadsheetName() {
  return 'spreadsheet'+(spreadsheetIndex++)
}

/**
 * @typedef {Object} HyperFormulaAddress
 * @property {number} col
 * @property {number} row
 * @property {number} sheet
 */

/**
 * Get the cell address object for use with the HyperFormula instance
 * @param {number} colIndex
 * @param {number} rowIndex
 * @param {number} sheetIndex
 * @returns {HyperFormulaAddress}
 */
function getCellAddress(colIndex,rowIndex,sheetIndex){
  return {col: colIndex, row: rowIndex, sheet: sheetIndex}
}

/**
 * Generate an SVG <use> HTML string
 * @param {string} name
 * @returns {string}
 */
function svg(name){
  return `<svg data-icon="${name}" class="icon icon-${name}">
    <title>${name}</title>
    <use xlink:href="#${name}"></use>
  </svg>`
}
