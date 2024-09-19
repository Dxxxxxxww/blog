function abc(instance) {
  const res = {
    attrs: { ...instance.attrs, ...instance.$options.propsData },
    listeners: { ...instance.listeners }
  }

  if (instance.$children.length) {
    instance = instance.$children[0]
    res.children = abc(instance)
  }
  return res
}

function name(params) {
  
}