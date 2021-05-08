Array.prototype.reduce =
  Array.prototype.reduce ||
  function r2(callback, initVal) {
    const arr = this
    const isHasInitVal = arguments.length > 1
    let base = isHasInitVal ? initVal : arr[0]
    const startIndex = isHasInitVal ? 0 : 1
    arr.slice(startIndex).forEach((val, index) => {
      base = callback(base, val, index + startIndex, arr)
    })
    return base
  }
// its a test