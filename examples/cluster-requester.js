const servious = require('../src/index.js'); // "servious" in production"
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

servious.configure({
  exclusive: false // SET THIS TO TRUE ONLY FOR WINDOWS MACHINES
});

servious.addLink({
  name: 'my-service',
  service: 'my-service', // The service you wish to target with this link
  options: {
    namespace: 'custom-namespace', // Optional namespace
  }
});

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker) => {
    console.log(`worker ${worker.process.pid} died`);
  });

} else {
  servious.send('my-service', 'generate-number', { payload: { 1: Math.round(Math.random(), 2) } })
    .catch((err) => {
      console.log(err);
    }).then((resp) => {
      console.log(resp);
    });
}
