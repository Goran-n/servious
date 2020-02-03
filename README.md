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
import Servious from 'servious'
const service = new Servious();

service.addLink('queue-service', {
  namespace: 'local',
  requests: [ 'generate-number' ]
});

const sendRequest = async () => {
  const req = await service.send('queue-service', 'generate-number', { payload: {} });
  console.log(req)
};
```

Example responder.js
```js
import Servious from 'servious'
const service = new Servious();

// Register this service as a responder
service.registerResponder({
  name: 'queue-service',
  namespace: 'local',
  respondsTo: [ 'generate-number' ]
});

service.on('generate-number', async (req) => {
  console.log(`Received request ${JSON.stringify(req)}`);
  return Math.random();
});
```
