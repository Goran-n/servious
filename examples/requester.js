const servious = require('../dist/index.js'); // "servious" in production"

servious.configure();

servious.addLink({
  name: 'my-service',
  service: 'my-service', // The service you wish to target with this link
  options: {
    namespace: 'custom-namespace', // Optional namespace
  }
});

const sendRequest = async () => {

  console.log('Sending Request')

  const req = await servious.send('my-service', 'generate-number', { payload: { 1: Math.round(Math.random(), 2) } })
    .catch((err) => {
    console.log(err);
  });

  console.log(req);

  sendRequest();
};

sendRequest();
