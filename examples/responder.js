const Servious = require("../dist/index"); // "servious" in production"
const service = new Servious();

// Register this service as a responder
service.registerResponder({
  "name": "queue-service",
  "namespace": "local",
  "respondsTo": [ "generate-number" ]
});

service.on("generate-number", async (req) => {
  console.log(`Received request ${JSON.stringify(req)}`);
  return Math.random();
});
