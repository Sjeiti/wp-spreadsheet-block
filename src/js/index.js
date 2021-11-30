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

  const map = Object.entries(workbook.Sheets)
      .map(([sheetName, sheet])=>{
        console.log('sheet',sheet) // todo: remove log
        return Object.entries(sheet)
            .filter(([key])=>key[0]!=='!')
            .map(([cellName, wbvalue])=>{
              const {t:type,n:number,v:value,f:fnc} = wbvalue
              const fullName = sheetName+'.'+cellName
              const formula = fnc&&parseFormula(fnc)
              return {type,number,value,fnc,sheetName,cellName,fullName,formula}
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


function onClickOutput(workbook, map, e) {
  const {target, target: {id, dataset: {t:type, v:value}}} = e
  if (type==='n') {
    const wrapper = target.closest('[data-sheet]')
    const sheetName = wrapper.dataset.sheet
    const cellName = id.split(/\-/).pop()
    const fullName = sheetName+'.'+cellName
    // const sheet = workbook.Sheets[sheetName]
    // const cell = sheet[cellName]
    // const formulae = XLSX.utils.sheet_to_formulae(sheet)
    //
    // const obj = formulae.map(parseFormula)
    // const obj = formulae.reduce((acc, cellFormula)=>{
    //   const cellObj = parseFormula(cellFormula)
    //   acc[cellObj.cell] = cellObj
    //   return acc
    // },{})
    //
    console.log('click',fullName,map[fullName])//{sheetName,cell,sheet,formulae,obj}) // todo: remove log
    //
    // const formula = formulae.filter(s=>new RegExp('^'+cellName).test(s))
    //
    // cell.v = cell.v + 1
    // const formula = formulae.filter(s=>new RegExp('^'+cellName).test(s))
    // const formulaIndex = formulae.indexOf(formula)
    // formulae[formulaIndex] = cellName +' = '+ cell.v
    // console.log('cell',cell.v,formulae[formulaIndex]) // todo: remove log
    // wrapper.innerHTML = getHTML(workbook, sheetName)
  }
}

function parseFormula(formulaValue){
  console.log('formulaValue',formulaValue) // todo: remove log
  const [, func, paramses] = formulaValue.match(/^([^(]+)\(([^)]*)\)$/)||[,,]
  const params = paramses?.split(/,/g)
  const paramValues = params?.map(parseParam)
  //
  return {formula:formulaValue,func,params,paramValues}
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
  const [,fromX,fromY,toX,toY] = paramValue.match(/^([A-Z]+)(\d+):([A-Z]+)(\d+)$/)
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
