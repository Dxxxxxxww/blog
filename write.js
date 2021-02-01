function filterAsyncRoutes(menus, parentAction = '') {
  const res = []

  menus.forEach((menu) => {
    // const component = parentAction
    //   ? () => import(`@/views/${parentAction}/${menu.popedomAction}/InfoMng`)
    //   : Layout
    const tmp = {
      path: menu.popedomAction,
      name: menu.popedomAction.slice(1),
      // component,
    }
    if (menu.children?.length) {
      tmp.children = filterAsyncRoutes(menu.children)
    }
    res.push(tmp)
  })

  return res
}

const asyncRoutes = [
  {
    popedomAction: '/systemManage', // 一级菜单
    popedomIconcls: 'xitong', //  一级菜单icon
    popedomId: '01',
    popedomName: '系统管理', // 一级菜单名称
    popedomPid: '0',
    children: [
      // 二级菜单
      {
        popedomAction: '/organization', // 二级菜单
        popedomId: '0101',
        popedomName: '机构信息管理', // 二级菜单名称
        popedomPid: '01',
        popedomButtons: ['010101', '010102'], //  当前用户拥有的按钮权限
      },
      {
        popedomAction: '/organization',
        popedomId: '0101',
        popedomName: '机构信息管理',
        popedomPid: '01',
        popedomButtons: [],
      },
    ],
  },
]

const abc = filterAsyncRoutes(asyncRoutes)
console.log(abc)
