/* @flow */

import config from '../config'
import { initUse } from './use'
import { initMixin } from './mixin'
import { initExtend } from './extend'
import { initAssetRegisters } from './assets'
import { set, del } from '../observer/index'
import { ASSET_TYPES } from 'shared/constants'
import builtInComponents from '../components/index'
import { observe } from 'core/observer/index'

import {
  warn,
  extend,
  nextTick,
  mergeOptions,
  defineReactive
} from '../util/index'
/**
 * 初始化Vue静态api。
 * set，delete，nextTick，observable
 * 执行其他 init 方法
 * initUse initMixin initExtend initAssetRegisters
 */
export function initGlobalAPI (Vue: GlobalAPI) {
  // config
  const configDef = {};
  // 给初始化的 config 的 getter 返回内置的 config 对象
  configDef.get = () => config;
  if (process.env.NODE_ENV !== "production") {
    configDef.set = () => {
      warn(
        "Do not replace the Vue.config object, set individual fields instead."
      );
    };
  }
  // 定义 Vue.config 静态对象
  Object.defineProperty(Vue, "config", configDef);

  // exposed util methods.
  // NOTE: these are not considered part of the public API - avoid relying on
  // them unless you are aware of the risk. 这些方法不能被视为全局api的一部分，
  // 除非你已经意识到风险，否则不要去依赖它们
  Vue.util = {
    warn,
    extend,
    mergeOptions,
    defineReactive,
  };
  // 定义静态方法
  Vue.set = set;
  Vue.delete = del;
  Vue.nextTick = nextTick;

  // 2.6 explicit observable API
  // 增加响应式方法，让一个对象变成可相响应的
  Vue.observable = <T>(obj: T): T => {
    observe(obj);
    return obj;
  };

  // 初始化 Vue.options 属性
  Vue.options = Object.create(null);
  // 初始化 'components', 'directives', 'filters'
  ASSET_TYPES.forEach((type) => {
    Vue.options[type + "s"] = Object.create(null);
  });

  // this is used to identify the "base" constructor to extend all plain-object
  // 它用于标识扩展所有普通对象的“基本”构造函数
  // components with in Weex's multi-instance scenarios.
  Vue.options._base = Vue;
  // 设置 keep-alive 组件
  extend(Vue.options.components, builtInComponents);

  // 初始化 Vue.use
  initUse(Vue);
  // 初始化 Vue.mixin，内部调用 mergeOptions
  initMixin(Vue);
  // 初始化 Vue.extend
  initExtend(Vue);
  // 初始化 Vue.component, directive, filter
  initAssetRegisters(Vue);
}
