const https = require('https');

/**
 * Fetch posts from JSONPlaceholder and calculate the average title length.
 */
function main(params) {
    return new Promise((resolve, reject) => {
        const url = 'https://jsonplaceholder.typicode.com/posts';

        https.get(url, (resp) => {
            let data = '';

            // A chunk of data has been received.
            resp.on('data', (chunk) => {
                data += chunk;
            });

            // The whole response has been received. Process the result.
            resp.on('end', () => {
                try {
                    const posts = JSON.parse(data);
                    if (Array.isArray(posts)) {
                        const totalLength = posts.reduce((sum, post) => sum + post.title.length, 0);
                        const avgTitleLength = (totalLength / posts.length).toFixed(2);
                        resolve({ average_title_length: avgTitleLength });
                    } else {
                        reject({ error: 'Invalid API response: ' + JSON.stringify(posts) });
                    }
                } catch (e) {
                    reject({ error: 'Error parsing API response: ' + e.message });
                }
            });

        }).on("error", (err) => {
            reject({ error: 'Error fetching data from API: ' + err.message });
        });
    });
}
