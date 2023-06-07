# electrion 踩坑，技巧整理

## 前排提示

一定要仔细看文档！！！

## browserView 设置完后，在窗口不显示

```javascript
// 在主进程中.
const { app, BrowserView, BrowserWindow } = require('electron')

app.whenReady().then(() => {
  const win = new BrowserWindow({ width: 800, height: 600 })

  const view = new BrowserView()
  view.webContents.loadURL('https://electronjs.org')
  // 在多 browserView 的情况下，setBrowserView 会清空之前的 browserView，设置当前的。对性能有一定的影响。可以类比 v-if v-show
  // win.setBrowserView(view)
  win.addBrowserView(view)
  view.setBounds({ x: 0, y: 0, width: 300, height: 300 })
})
```

如上代码所示，当我们这样在 window 中设置 view 但不渲染时，可以对 win 进行位置（x，y），尺寸（width，height）的设置。

```javascript
// 在主进程中.
const { app, BrowserView, BrowserWindow } = require('electron')

app.whenReady().then(() => {
  const win = new BrowserWindow({ width: 800, height: 600 })

  const view = new BrowserView()
  // 在多 browserView 的情况下，setBrowserView 会清空之前的 browserView，设置当前的。对性能有一定的影响。可以类比 v-if v-show
  // win.setBrowserView(view)
  const { x, y, width, height } = win.getBounds()
  view.webContents.loadURL('https://electronjs.org')
  // 注意顺序，先 set 窗口，再 set view，这样可以让 browserView 更快的展示
  win.setBounds({ x, y })
  win.addBrowserView(view)·
  view.setBounds({ x: 0, y: 0, width: 300, height: 300 })
})
```

## ipcMain 与 窗口直接 loadURL/browserView/iframe 通信

方法如下：

1. 官网的进程间通信方式
2. node 开启 http 服务，websocket 服务，自定义协议等等。
