const count = 1
// var count = 1

const User = {
    count: 2,
    agent: {
        // count:100
        hi:() => {
            return this.count
        }
    }
}
const agent = User.agent
const getAgent = User.agent.hi
Promise.resolve().then(() => {
    setTimeout(() => {
        console.log('15====', agent.hi())
    })
})
setTimeout(() => {
    console.log('19====', User.agent.hi())
})
console.log('21====', getAgent())


class Scheduler {
  constructor(maxJobs) {
    this.maxJobs = maxJobs
    this.currentJobs = 0
    this.queue = []
  }

  async add(callback) {
    if (this.currentJobs >= this.maxJobs) {
      await new Promise((resolve) => this.queue.push(resolve))
    }
    this.currentJobs++
    const result = await callback()
    this.currentJobs--
    if (this.queue.length) {
      const resolveFunc = this.queue.shift()
      resolveFunc()
    }
    return result
  }
}

function convert(list) {
  const res = []
  const map = {}
  for (let item of list) {
    const cachedItem = map[item.id]
    if (cachedItem) {
      cachedItem.name = item.name
      cachedItem.parentId = item.parentId
      item = cachedItem
    } else {
      map[item.id] = item
    }
    if (item.parentId === 0) {
      res.push(item)
    } else {
      let parent = map[item.parentId]
      if (!parent) {
        parent = {
          id: item.parentId
        }
        map[item.parentId] = parent
      }
      parent.children = parent.children || []
      parent.children.push(item)
    }
  }
  return res
}

function convert(list) {
  const res = [] // const map = list.reduce((prev, item) => { //     prev[item.id] = item //     return prev // }, {})
  const map = {}

  for (const item of list) {
    if (item.parentId === 0) {
      res.push(item)
      map[item.id] = item
    } else {
      const cacheItem = map[item.id]
      if (!cacheItem) {
        map[item.id] = cacheItem
      } else {
        cacheItem.name = map[item.id].name
      }
      let parent = map[item.parentId]
      if (!parent) {
        parent = { id: item.parentId }
        map[item.parentId] = parent
      }
      parent.children = parent.children || []
      parent.children.push(item)
    }
  }
  return res
}

const requestAnimatioFrame =
  window.requestAnimationFrame ||
  function (callback) {
    window.setTimeout(callback, 1000 / 60)
  }

let st = Date.now()
let tt
let fps = 0
let frame = 0

const calcFps = () => {
  const loop = () => {
    tt = Date.now()
    if (tt > st + 1000) {
      fps = Math.round((frame * 1000) / (tt - st))
      st = Date.now()
      frame = 0
    }
    frame++
    requestAnimatioFrame(loop)
  }
  loop()
}
