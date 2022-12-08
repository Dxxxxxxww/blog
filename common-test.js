function myNew(c) {
  // 建立原型链
  const obj = Object.create(c.prototype);
  // 绑定私有属性并获取返回值
  const res = c.call(obj)
  return typeof res === 'object' || typeof res === 'function' ? res : obj
}
