// document.addEventListener('DOMContentLoaded', function() {
//     fetch('http://host.docker.internal:3000/api/functions')
//         .then(response => response.json())
//         .then(functionNames => {
//             const select = document.getElementById('functionSelect');
//             functionNames.forEach(name => {
//                 const option = document.createElement('option');
//                 option.value = name;
//                 option.textContent = name;
//                 select.appendChild(option);
//             });
//         })
//         .catch(error => console.error('Error loading function names:', error));
// });

// function invokeFunction() {
//     const functionName = document.getElementById('functionSelect').value;
//     const functionParams = document.getElementById('functionParams').value;

//      // Convert JSON input to an object
//      const params = JSON.parse(functionParams);
//     // Generate query string from the params object
//     const queryParams = new URLSearchParams(params).toString();

//     fetch(`http://host.docker.internal:3000/api/${functionName}?${queryParams}`, {
//         method: 'GET',
//     })
//     .then(response => response.json())
//     .then(data => {
//         document.getElementById('result').innerText = `Result: ${JSON.stringify(data, null, 2)}`;
//     })
//     .catch(error => {
//         document.getElementById('result').innerText = `Error: ${error.toString()}`;
//     });
// }
document.addEventListener('DOMContentLoaded', function() {  // Wait for the DOM to load         
    fetch('http://host.docker.internal:3000/api/functions')
        .then(response => response.json())
        .then(functionNames => {
            const select = document.getElementById('functionSelect');
            functionNames.forEach(name => {
                const option = document.createElement('option');
                option.value = name;
                option.textContent = name;
                select.appendChild(option);
            });
        })
        .catch(error => console.error('Error loading function names:', error));

    addParameter();  // Initialize with one parameter input
});

function addParameter() {
    const container = document.getElementById('parameterContainer');
    const inputGroup = document.createElement('div');
    inputGroup.className = 'input-group';

    inputGroup.innerHTML = `
        <input type="text" placeholder="Parameter Name" class="param-name">
        <input type="text" placeholder="Value" class="param-value">
        <button type="button" onclick="removeParameter(this)" class="remove-btn"><i class="fas fa-trash"></i></button>
    `;

    container.appendChild(inputGroup);
}

function removeParameter(element) {
    // The element is the button, its parent is the input group div
    element.parentElement.remove();
}

function invokeFunction() {
    const functionName = document.getElementById('functionSelect').value;
    const paramNames = document.querySelectorAll('.param-name');
    const paramValues = document.querySelectorAll('.param-value');
    const params = {};

    paramNames.forEach((paramName, index) => {
        if (paramName.value && paramValues[index].value) {
            params[paramName.value] = paramValues[index].value;
        }
    });

    const queryParams = new URLSearchParams(params).toString();
    const startTime = performance.now();  // Start timing before request

    fetch(`http://host.docker.internal:3000/api/${functionName}?${queryParams}`, {
        method: 'GET',
    })
    .then(response => response.json())
    .then(data => {
        const endTime = performance.now();  // End timing after response
        const timeTaken = endTime - startTime;
        document.getElementById('result').innerText = `Result: ${JSON.stringify(data.result, null, 2)}`;
        document.getElementById('timeTaken').innerText = `Time Taken: ${timeTaken.toFixed(2)} ms`;
        const cacheIndicator = document.getElementById('cacheStatus');
        if (data.cacheHit) {
            cacheIndicator.style.backgroundColor = 'green'; // Green for cache hit
            cacheIndicator.style.color = 'white'; // White text for better visibility
            cacheIndicator.innerText = 'Cache Hit';
        } else {
            cacheIndicator.style.backgroundColor = 'red'; // Red for cache miss
            cacheIndicator.style.color = 'white';
            cacheIndicator.innerText = 'Cache Miss';
        }
    })
    .catch(error => {
        document.getElementById('result').innerText = `Error: ${error.toString()}`;
        document.getElementById('timeTaken').innerText = ''; 
        document.getElementById('cacheStatus').style.backgroundColor = '';
    });
}

function toggleTheme() {
    document.body.classList.toggle('dark-theme');
}

function openSettings() {
    const selectedFunction = document.getElementById('functionSelect').value;

    fetch(`http://host.docker.internal:3000/api/settings?path=/api/${selectedFunction}`)
        .then(response => response.json())
        .then(settings => {
            document.getElementById('ttlInput').value = settings.ttl;
            document.getElementById('cacheableInput').checked = settings.cacheable;
            document.getElementById('settingsModal').style.display = 'block';
        })
        .catch(error => {
            console.error('Error fetching settings:', error);
            alert('Failed to load settings.');
        });
}
function closeSettings() {
    document.getElementById('settingsModal').style.display = 'none';
}

function saveConfiguration() {
    const selectedFunction = document.getElementById('functionSelect').value;
    const ttl = parseInt(document.getElementById('ttlInput').value, 10);
    const cacheable = document.getElementById('cacheableInput').checked;

    if (!selectedFunction || isNaN(ttl)) {
        alert('Please provide valid TTL and select a function.');
        return;
    }

    const config = {
        path: `/api/${selectedFunction}`,
        ttl,
        cacheable
    };

    fetch('http://host.docker.internal:3000/api/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(config)
    })
    .then(response => {
        if (response.ok) {
            alert('Configuration saved successfully!');
            closeSettings();
        } else {
            alert('Failed to save configuration.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while saving configuration.');
    });
}
