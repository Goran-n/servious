const Servious = require('../dist/index.js'); // "servious" in production"
const service = new Servious();

let stats = require('measured-core').createCollection();

service.addLink('queue-service', {
  namespace: 'local',
  requests: [ 'generate-number' ]
});

const sendRequest = async () => {
  const req = await service.send('queue-service', 'generate-number', { payload: {} });

  stats.meter('requestsPerSecond').mark();
};

setInterval(() => {
  console.log(stats.toJSON());
}, 100);

setInterval(sendRequest, 1);
setInterval(sendRequest, 1);
