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
  console.log('workbook',workbook) // todo: remove log

  // sjs-F11
  // sjs-

  const map = Object.entries(workbook.Sheets)
      .map(([sheetName, sheet])=>{
        console.log('sheet',sheet) // todo: remove log
        return Object.entries(sheet)
            .filter(([key])=>key[0]!=='!')
            .map(([cellName, wbvalue])=>{
              const {t:type,n:number,v:value,f:fnc} = wbvalue
              const fullName = sheetName+'.'+cellName
              const formula = fnc&&parseFormula(fnc)||{formula:fnc}
              return {type,number,value,sheetName,cellName,fullName,...formula}
            })
      })
      .reduce((acc, entries)=>{
        entries.forEach(cell=>acc[cell.fullName]=cell)
        return acc
      }, {})

  output.innerHTML = workbook.SheetNames
    .map(sheet => `<div data-sheet="${sheet}">${getHTML(workbook, sheet)}</div>`)
    .join('')

  output.addEventListener('click', onClickOutput.bind(null, workbook, map))

  //////////////////////////////////////////////////////
  //////////////////////////////////////////////////////

  console.log('cellToXY',cellToXY('AA1')) // todo: remove log

  const hfSheets = Object.entries(workbook.Sheets, {})
      .map(([sheetName, sheet])=>{
        console.log('sheet',sheet) // todo: remove log
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
        return [sheetName, colRows]
      })
      .reduce((acc, [sheetName, entries])=>((acc[sheetName] = entries), acc), {})

  console.log('hfSheets', hfSheets) // todo: remove log
  const hfInstance = HyperFormula.buildFromSheets(hfSheets, {licenseKey: 'gpl-v3'}) // MIT
  console.log('hfInstance',hfInstance) // todo: remove log
  console.log(' ',hfInstance.getCellValue({ col: 2, row: 5, sheet: 0 }))
}

function cellToXY(cellName) {
  const [, stringX, stringY] = cellName.match(/^([^\d]+)(\d+)$/)
  const x = stringToNumeral(stringX)
  const y = parseInt(stringY, 10) - 1
  return [x, y]
}

function stringToNumeral(string) {
  return string.split('').reverse().reduce((acc,s,i)=>acc+s.charCodeAt(0)-65+i*26,0)
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
  window.onerror = console.log.bind(console)
}


function onClickOutput(workbook, map, e) {
  const {target, target: {id, dataset: {t:type, v:value}}} = e
  if (type==='n') {
    const wrapper = target.closest('[data-sheet]')
    const sheetName = wrapper.dataset.sheet
    const cellName = id.split(/\-/).pop()
    const fullName = sheetName+'.'+cellName
    //
    console.log('click',fullName,map[fullName])//{sheetName,cell,sheet,formulae,obj}) // todo: remove log
    //
  }
}

function parseFormula(formula){
  console.log('formulaValue',formula) // todo: remove log
  const [, func, paramses] = formula.match(/^([A-Z^(]+)\(([^)]*)\)$/)||[,,]
  const params = paramses?.split(/,/g)
  //console.log(func,paramses)
  const paramValues = params?.map(parseParam)
  //
  return {formula,func,params,paramValues}
}

// function parseFormula(cellFormula){
//   const [,cell,formulaValue] = cellFormula.match(/^([A-Z]+\d+)=(.*)$/)
//   const string = formulaValue.match(/\'.+/)&&formulaValue.replace(/^\'|\'$/g, '')
//   const number = parseNumber(formulaValue)
//   //
//   const [, func, paramses] = formulaValue.match(/^([^(]+)\(([^)]*)\)$/)||[,,]
//   const params = paramses?.split(/,/g)
//   const paramValues = params?.map(parseParam)
//   //
//   return {cell,formula:formulaValue,cellFormula,string,number,func,params,paramValues}
// }

function parseParam(paramValue){
  const [,fromX,fromY,toX,toY] = paramValue?.match(/^([A-Z]+)(\d+):([A-Z]+)(\d+)$/)
  const range = getRange(fromX,fromY,toX,toY)
  const number = parseNumber(paramValue)
  const isNumber = number!==undefined
  return isNumber?number:(range&&paramValue)
}

const undef = (()=>{})()
function parseNumber(string){
  const float = parseFloat(string)
  return float.toString()===string?float:undef
}

function getRange(fromX,fromY,toX,toY){
  const validParams = fromX&&fromY&&toX&&toY
  // todo make range
  return validParams?[]:undef
}

function getHTML(workbook, sheet){
  return XLSX.write(workbook, {
    sheet
    , type: 'string'
    , bookType: 'html'
    //, editable: true
  })
}
