const servious = require('../dist/index'); // "servious" in production"

servious.configure();

// Register this service as a responder
servious.registerResponder({
  name: 'my-service', // The name of your service
  namespace: 'custom-namespace' // Optional namespace
});

servious.on('generate-number', async (req) => {
  console.log(`Received request ${JSON.stringify(req)}`);
  return Math.random();
});
