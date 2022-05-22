function Fn(n) {
  if (n === 0) {
    return 0
  }
  if (n === 1) {
    return 1
  }
  return Fn(n - 1) + Fn(n - 2)
}
