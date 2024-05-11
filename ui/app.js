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
});

function invokeFunction() {
    const functionName = document.getElementById('functionSelect').value;
    const functionParams = document.getElementById('functionParams').value;

     // Convert JSON input to an object
     const params = JSON.parse(functionParams);
    // Generate query string from the params object
    const queryParams = new URLSearchParams(params).toString();

    fetch(`http://host.docker.internal:3000/api/${functionName}?${queryParams}`, {
        method: 'GET',
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('result').innerText = `Result: ${JSON.stringify(data, null, 2)}`;
    })
    .catch(error => {
        document.getElementById('result').innerText = `Error: ${error.toString()}`;
    });
}
