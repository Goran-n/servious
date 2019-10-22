'use strict';

const Requester = require('../').Requester;

const randomRequest = new Requester({
  name: 'core-service-req',
  // requests: ['randomRequest', 'promised request'],
});

let total = 0

function makeRequest() {
  total++
  const req = {
    type: 'randomRequest',
    val: total
  };
  console.log('sending request cb', req);
  randomRequest.send(req, function(res) {
  });

  const reqPromise = {
    type: 'promised request',
    val: total++,
  };

  randomRequest.send(reqPromise).then((res) => {
    console.log('request promise', reqPromise, 'answer', res);
  }).catch((e) => console.log('rejected', e));
}

makeRequest();

setInterval(makeRequest, 1);
