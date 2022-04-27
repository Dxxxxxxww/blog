/* @flow */

import { ASSET_TYPES } from 'shared/constants'
import { isPlainObject, validateComponentName } from '../util/index'

/**
 * 给component, directive, filter 三个全局api初始化，并增加前置判断
 */
export function initAssetRegisters (Vue: GlobalAPI) {
  /**
   * Create asset registration methods.
   * 遍历 ASSET_TYPES 数组，为 Vue 定义静态方法
   */
  // ASSET_TYPES：'component', 'directive', 'filter'
  ASSET_TYPES.forEach((type) => {
    Vue[type] = function (
      id: string,
      definition: Function | Object
    ): Function | Object | void {
      // 如果没传 definition，则表示是获取
      if (!definition) {
        return this.options[type + "s"][id];
      } else {
        /* istanbul ignore if */
        // 开发环境下验证名称是否合法
        if (process.env.NODE_ENV !== "production" && type === "component") {
          validateComponentName(id);
        }
        // 如果是组件，并且传入的是普通对象的话
        Vue.component('componentA', { template: '' })
        if (type === "component" && isPlainObject(definition)) {
          definition.name = definition.name || id;
          // this.options._base 就是 Vue
          // 这里就是调用 Vue.extend，将对象转为组件构造函数
          // 如果已经是构造函数了，直接走最后保存的逻辑
          definition = this.options._base.extend(definition);
        }
        // 如果是指令，并且是函数的话对其做对象转化处理
        if (type === "directive" && typeof definition === "function") {
          definition = { bind: definition, update: definition };
        }
        // 记录到对应的 Vue.components Vue.filters Vue.directives 中
        // filter 直接就走到这里了
        // 所以全局的东西都会从 Vue.options.xxx 中去获取
        this.options[type + "s"][id] = definition;
        return definition;
      }
    };
  });
}
