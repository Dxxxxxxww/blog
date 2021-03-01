const { vueAnalyseSidebar } = require('./utils/sidebar')
const { requireSidebar} = require('./utils')

module.exports = {
  base: '/blog/',
  title: 'Dxx',
  description: '我的个人网站',
  themeConfig: {
    sidebar: requireSidebar(),
    nav: [
      // {
      //   text: 'Vue源码分析',
      //   link: '/vue-analyse/compiler/',
      // },
      { text: 'Home', link: '/' },
      { text: 'GitHub', link: 'https://github.com/Dxxxxxxww' },
      { text: 'External', link: 'https://google.com' },
    ],
    // sidebar: {
    //   '/vue-analyse/': vueAnalyseSidebar,
    // },
    lastUpdated: true, // '最后更新时间',
    markdown: {
      // 显示代码块行号
      lineNumbers: true,
    },
  },
}
