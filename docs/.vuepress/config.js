// const { vueAnalyseSidebar } = require('./utils/sidebar')
// const { requireSidebar} = require('./utils')

module.exports = {
  base: '/blog/',
  title: 'Dxx',
  description: '我的个人网站',
  themeConfig: {
    // sidebar: requireSidebar(),
    repo: 'https://github.com/Dxxxxxxww',
    repoLabel: 'Github',
    lastUpdated: true, // '最后更新时间',
    markdown: {
      // 显示代码块行号
      lineNumbers: true
    },
    nav: [
      {
        text: '前端框架',
        items: [
          {
            text: 'Vue 系列',
            items: [
              {
                text: 'Vue 模拟实现',
                link: '/vue/vue-write'
              },
              { text: 'Vue 源码解读', link: '/vue/vue-source' }
            ]
          },
          {
            text: 'React 系列',
            items: [
              {
                text: 'react hooks',
                link: '/react/react-hooks'
              },
              {
                text: 'react 逻辑复用发展史',
                link: '/react/react-逻辑复用发展历程'
              },
              {
                text: 'react 积累',
                link: '/react/react-积累'
              },
              {
                text: 'react 状态管理',
                link: '/react/react-状态管理'
              }
            ]
          }
        ]
      },
      {
        text: '三剑客plus',
        items: [
          {
            text: 'js 系列',
            items: [
              {
                text: 'js 手写',
                link: '/js/javascript/js-write'
              },
              {
                text: 'js 深入',
                link: '/js/javascript/js-deep'
              },
              {
                text: 'js 奇技淫巧',
                link: '/js/javascript/js-奇技淫巧'
              }
            ]
          },
          {
            text: 'ts 系列',
            items: [
              {
                text: '暂无',
                link: '/js/javascript/js-write'
              }
            ]
          },
          { text: 'css', items: [{ text: 'css 积累', link: '/css/css-积累' }] }
        ]
      },
      {
        text: '浏览器与网络',
        items: [
          { text: '浏览器系列' },
          {
            text: '网络系列'
          }
        ]
      },
      {
        text: '前端工程化',
        items: [
          {
            text: '浏览器系列',
            items: [
              {
                text: '暂无',
                link: '/js/javascript/js-write'
              }
            ]
          },
          {
            text: '网络系列',
            items: [
              {
                text: '暂无',
                link: '/js/javascript/js-write'
              }
            ]
          }
        ]
      },
      {
        text: '性能优化与兼容',
        items: [
          {
            text: '性能优化系列',
            items: [
              {
                text: '暂无',
                link: '/js/javascript/js-write'
              }
            ]
          },
          {
            text: '兼容系列',
            items: [
              {
                text: '暂无',
                link: '/js/javascript/js-write'
              }
            ]
          }
        ]
      },
      {
        text: '其他',
        items: [
          {
            text: '工作总结',
            items: [
              {
                text: '暂无',
                link: '/js/javascript/js-write'
              }
            ]
          },
          {
            text: 'git',
            items: [
              {
                text: '暂无',
                link: '/js/javascript/js-write'
              }
            ]
          },
          {
            text: '正则',
            items: [
              {
                text: '暂无',
                link: '/js/javascript/js-write'
              }
            ]
          },
          {
            text: '可视化',
            items: [
              {
                text: '暂无',
                link: '/js/javascript/js-write'
              }
            ]
          }
        ]
      }
      // { text: 'Home', link: '/' },
    ]
  }
}
