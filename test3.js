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
