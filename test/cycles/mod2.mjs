import { mod1Fn, mod1Value } from './mod1.mjs'

export let mod2Value = 'mod2Value'
export function mod2Fn(from) {
  console.log(`${from} call mod1Fn\n`)
  console.log('log mod1Value in mod2Fn')
  console.log(mod1Value)
}

mod1Fn('mod2')

// mod2Fn('mod2') // 打开这行会报错
