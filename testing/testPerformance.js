const openwhisk = require('openwhisk');
const axios = require('axios');
const fs = require('fs');

const ow = openwhisk({
    api_key: '23bc46b1-71f6-4ed5-8c54-816aa4f8c502:123zO3xZCLrMN6v2BKK1dXYFpXlPkccOFqm12CdAsMgRU4VrNZ9lyGVCGuMDGIwP',
    apihost: 'http://host.docker.internal:3233' || 'http://localhost:3233',
})

async function invokeOpenWhisk(userId) {
    const startTime = Date.now();
    try {
        const result = await ow.actions.invoke({
            actionName: 'fetchUserProfile',
            params: { userId },
            blocking: true,
            result: true
        });
        const endTime = Date.now();
        const timeTaken = endTime - startTime;

        
        const isColdStart = timeTaken > 100; 
        const now = new Date();
        return { now, timeTaken, isColdStart };

    } catch (error) {
        console.error('Error invoking function:', error);
        return { timeTaken: null, result: null, isColdStart: false, error };
    }
}

async function invokeCacheService(userId) {
    const startTime = Date.now();
    const response = await axios.post('http://localhost:3000/api/fetchUserProfile', { userId });
    const endTime = Date.now();
    const timeTaken = endTime - startTime;
    const now = new Date();
    return { now, timeTaken, cacheHit: response.data.cacheHit };
}

async function runTest(userId, iterations, delayBetweenCalls) {
    const results = { openwhisk: [], cacheService: [] };

    for (let i = 0; i < iterations; i++) {
        console.log(`Iteration ${i + 1} - OpenWhisk`);
        results.openwhisk.push(await invokeOpenWhisk(userId));

        if (i === 0) {
            // Wait for the first iteration to complete before proceeding
            await new Promise(resolve => setTimeout(resolve, delayBetweenCalls));
        }

        console.log(`Iteration ${i + 1} - Cache Service`);
        results.cacheService.push(await invokeCacheService(userId));

        // Wait between calls to potentially trigger cold starts
        await new Promise(resolve => setTimeout(resolve, delayBetweenCalls));
    }

    // Write results to a file
    fs.writeFileSync('testResults-1.json', JSON.stringify(results, null, 2));
}

// Example usage: Test with 10 iterations and a 15-second delay
runTest('user1', 10, 15000);
