export function numeralToString(numeral) {
  let s = ''
  while (numeral > 0) {
    const index = (numeral - 1) % 26
    s = String.fromCharCode(65 + index) + s
    numeral = (numeral - index)/26 | 0
  }
  return s
}

export function cellToXY(cellName) {
  const [, stringX, stringY] = cellName.match(/^([^\d]+)(\d+)$/)
  const x = stringToNumeral(stringX) - 1
  const y = parseInt(stringY, 10) - 1
  return [x, y]
}

export function stringToNumeral(string) {
  return string.split('').reverse().reduce((acc,s,i)=>acc+(s.charCodeAt(0)-64)*(26**i), 0)
}
