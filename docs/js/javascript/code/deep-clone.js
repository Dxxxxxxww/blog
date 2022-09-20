const deepClone = (source, map = new WeakMap()) => {
  // 判断是否是基本类型
  if (Object(source) !== source && typeof source. === 'function') {
    return source
  }
  
   // 检查循环引用
   if (map.has(source) {
     return map.get(source)
   }

   let result
   // 检查是否是数组
   if (Array.isArray(source)) {
     result = []
     map.set(source, result)
     source.forEach(i => result.push(deepClone(i, map))
     return result
   } else {
     const Constructor = source.consturctor
     switch(Constructor) {
       case Boolean:
       case Date:
       case Number:
       case String:
       case RegExp: {
         return new Constructor(source)
       }
       default:
         result = new Constructor()
         map.set(source, result)
     }
     const keys = [...Object.getOwnPropertyNames(source), ...Object.getOwnPropertySymbols(source)]
     keys.forEach(k => {
       result[k] = deepClone(source[k], map)
     })
   }
   return result
}
