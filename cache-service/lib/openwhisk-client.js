




// const ow = openwhisk({
//     api_key: '23bc46b1-71f6-4ed5-8c54-816aa4f8c502:123zO3xZCLrMN6v2BKK1dXYFpXlPkccOFqm12CdAsMgRU4VrNZ9lyGVCGuMDGIwP',
//     apihost: 'http://host.docker.internal:3233' || 'http://localhost:3233',
// })
const openwhisk = require('openwhisk')
const ow = openwhisk({
    api_key: `${process.env.OPENWHISK_API_KEY}`,
    apihost: `${process.env.OPENWHISK_API_HOST}`,
});


async function fetchOpenWhiskFunctions() {
    try {
        const functions = await ow.actions.list()
        return functions.map((func) => ({
            name: func.name,
            namespace: func.namespace,
        }))
    } catch (error) {
        console.error('Failed to fetch OpenWhisk functions:', error)
        return []
    }
}

module.exports = { fetchOpenWhiskFunctions, ow }
