const { fetchOpenWhiskFunctions } = require('./openwhisk-client')

let routeMappings = {}
async function configureRoutesAndTTLs() {
    const functions = await fetchOpenWhiskFunctions()
    functions.forEach((func) => {
        const routeKey = `/api/${func.name.replace('/', '_')}`
        routeMappings[routeKey] = `/${func.namespace}/${func.name}`
    })
    console.log(routeMappings)
}

async function startFunctionUpdateScheduler(updateInterval) {
    await configureRoutesAndTTLs() // Initial configuration on startup
    setInterval(async () => {
        console.log('Refreshing OpenWhisk function mappings...')
        await configureRoutesAndTTLs()
        console.log('OpenWhisk function mappings updated.')
    }, updateInterval)
}

module.exports = { startFunctionUpdateScheduler, routeMappings }
