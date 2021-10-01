Array.prototype.every =
  Array.prototype.every ||
  function(fn) {
    const arr = this
    let result = true
    for (let i = 0, len = arr.length; i < len; i++) {
      const val = arr[i]
      result = fn(val, i, arr)
      if (!result) {
        break
      }
    }
    return result
  }
