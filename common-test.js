var MinStack = function () {
  this.stack = []
  this._minStack = [Infinity]
}

/**
 * @param {number} val
 * @return {void}
 */
MinStack.prototype.push = function (val) {
  this.stack.push(val)
  const lastMinNum = this._minStack[this._minStack - 1]
  this._minStack.push(Math.min(lastMinNum, val))
}

/**
 * @return {void}
 */
MinStack.prototype.pop = function () {
  this.stack.pop()
  this._minStack.pop()
}

/**
 * @return {number}
 */
MinStack.prototype.top = function () {
  return this.stack[this.stack.length - 1]
}

/**
 * @return {number}
 */
MinStack.prototype.getMin = function () {
  return this._minStack[this._minStack.length - 1]
}

var obj = new MinStack()
obj.push(-3)
obj.pop()
var param_3 = obj.top()
var param_4 = obj.getMin()
