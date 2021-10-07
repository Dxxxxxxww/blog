class Left {
  static of(value) {
    return new Left(value)
  }

  constructor(value) {
    this._value = value
  }

  map() {
    return this
  }
}

class Right {
  static of(value) {
    return new Right(value)
  }

  constructor(value) {
    this._value = value
  }

  map(fn) {
    return Right.of(fn(this._value))
  }
}

function paseJson(str) {
  try {
    return Right.of(JSON.parse(str))
  } catch (error) {
    return Left.of(error)
  }
}

const p = paseJson('{ "name": "wahaha" }')

console.log(p.map((x) => x.name.toUpperCase()))
