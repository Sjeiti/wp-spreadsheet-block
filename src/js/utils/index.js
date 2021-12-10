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
