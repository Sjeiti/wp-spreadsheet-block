/**
 * Next tick
 * @param {function} fn
 * @returns {number}
 */
export function nextTick(fn){
  return requestAnimationFrame(fn)
}

/**
 * Tick delay helper method
 * @param {Function} fn
 * @param {number} num
 */
export function nextFrame(fn, num=1){
  const a = []
  a[num-1] = fn
  const down = ()=>{
    const fnc = a.shift()
    fnc?fnc():requestAnimationFrame(down)
  }
  requestAnimationFrame(down)
}

export function createElement(name,parent,attr){
  const element = document.createElement(name)
  attr&&Object.entries(attr).forEach(([name,value])=>{
    element.setAttribute(name==='className'?'class':name,value)
  })
  parent?.appendChild(element)
  return element
}

export function toggleEntry(array, entry, forceAdd) {
  return (array.includes(entry)&&!forceAdd)
      &&array.filter(s=>s!==entry)
      ||[...array, ...array.includes(entry)&&[]||[entry]]
}
// console.log('toggleEntry',toggleEntry([1],2)) // todo: remove log
// console.log('toggleEntry',toggleEntry([1],1)) // todo: remove log
// console.log('toggleEntry',toggleEntry([1,2],2)) // todo: remove log
// console.log('toggleEntry',toggleEntry([1,2],1)) // todo: remove log
// console.log('toggleEntry',toggleEntry([1,2],2,true)) // todo: remove log
// console.log('toggleEntry',toggleEntry([1,2],1,true)) // todo: remove log
// console.log('toggleEntry',toggleEntry([1],2,true)) // todo: remove log
// console.log('toggleEntry',toggleEntry([1],1,true)) // todo: remove log
