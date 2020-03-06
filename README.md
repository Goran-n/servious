![Depencies](https://img.shields.io/david/goran-n/servious) ![Issues](https://img.shields.io/github/issues-raw/goran-n/servious) ![License](https://img.shields.io/npm/l/servious) ![NPM Version](https://img.shields.io/npm/v/servious)
![Servious](https://i.ibb.co/vZSVPb6/Selection-005.png)

Servious - Node.js zero-configuration microservices made easy
===

** Servious is a modern zero configuration microservice library. Absolutely no _third party_ libraries required.**

Servious is still in early beta. Help us out by reporting any bugs.


Your first microservice in 30 seconds.
----

Installation
```
npm install servious --save
```

Example requester.js
```js
import servious from 'servious'

servious.configure(); // Any global config here

// Link this instance with any other services to whom requests will be made
servious.addLink({
  name: 'my-service',
  service: 'my-service', // The service you wish to target with this link
  options: {
    namespace: 'custom-namespace', // Optional namespace
  }
});

// Send a test request to my-service
const req = await servious.send('my-service', 'generate-number', { payload: { 1: Math.round(Math.random(), 2) } });

console.log(req)
```

Example responder.js
```js
import servious from 'servious'

servious.configure(); // Any global config here

// Register this service as a responder
servious.registerResponder({
  name: 'my-service', // The name of your service
  namespace: 'custom-namespace' // Optional namespace
});

// Add a handler for function "generate-number"
servious.on('generate-number', async (req) => {
  console.log(`Received request ${JSON.stringify(req)}`);
  return Math.random();
});
```

Further documentation pending
