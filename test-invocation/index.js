const express = require('express');
const bodyParser = require('body-parser');
const openwhisk = require('openwhisk');

const cors = require('cors');
const app = express();
const port = 3001;

// Configure OpenWhisk client
const ow = openwhisk({
    api_key:
        '23bc46b1-71f6-4ed5-8c54-816aa4f8c502:123zO3xZCLrMN6v2BKK1dXYFpXlPkccOFqm12CdAsMgRU4VrNZ9lyGVCGuMDGIwP',
    apihost: process.env.OPENWHISK_API_HOST || 'http://localhost:3233',
})

// Middleware to parse JSON body
app.use(bodyParser.json());

// Endpoint to invoke OpenWhisk function
app.post('/invoke', (req, res) => {
  const { functionName, params } = req.body;

  // Invoke OpenWhisk function
  ow.actions.invoke({
    name: functionName,
    blocking: true,
    result: true,
    params: params
  })
  .then(result => {
    res.json(result);
  })
  .catch(error => {
    console.error('Error invoking OpenWhisk function:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
