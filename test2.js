function sayHi() {
  debugger
  const hi = 'hi'
  return function son() {
    debugger
    console.log(hi)
  }
}

const gSon = sayHi()

gSon()
