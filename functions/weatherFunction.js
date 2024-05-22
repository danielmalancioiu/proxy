//145703c40380e86dcb54cb7da4be9d91

const https = require('https');

/**
 * Fetch weather data from an external API and calculate the average temperature.
 */
function main(params) {
    return new Promise((resolve, reject) => {
        const lat = params.lat || 44.34;
        const lon = params.lon || 10.99;
        const apiKey = '5c5011c84695a8f095e2176667d84df5';
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`;

        https.get(url, (resp) => {
            let data = '';

            // A chunk of data has been received.
            resp.on('data', (chunk) => {
                data += chunk;
            });

            // The whole response has been received. Process the result.
            resp.on('end', () => {
                const weatherData = JSON.parse(data);
                if (weatherData.main && weatherData.main.temp) {
                    const temperature = weatherData.main.temp;
                    const avgTemp = (temperature - 273.15).toFixed(2); // Convert Kelvin to Celsius
                    resolve({ city: city, average_temperature: avgTemp });
                } else {
                    reject({ error: 'Unable to fetch temperature data' });
                }
            });

        }).on("error", (err) => {
            reject({ error: 'Error fetching data from API: ' + err.message });
        });
    });
}
