const arr = [1, 2, 3, [4, 5, [6]]]
function flat4(array) {
  while (array.some(Array.isArray())) {
    array = [].concat(...array)
  }
  return array
}

console.log(flat4(arr))
