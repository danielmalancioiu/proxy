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
document.addEventListener('DOMContentLoaded', function() {
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
        document.getElementById('result').innerText = `Result: ${JSON.stringify(data, null, 2)}`;
        document.getElementById('timeTaken').innerText = `Time Taken: ${timeTaken.toFixed(2)} ms`;
    })
    .catch(error => {
        document.getElementById('result').innerText = `Error: ${error.toString()}`;
        document.getElementById('timeTaken').innerText = ''; // Clear time on error
    });
}

function toggleTheme() {
    document.body.classList.toggle('dark-theme');
}



