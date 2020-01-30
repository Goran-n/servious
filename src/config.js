import Joi from '@hapi/joi';

const internals = {};

exports.apply = function (type, options, ...message) {

  const result = internals[ type ].validate(options);

  if (result.error) {
    throw new Error(`Invalid ${type} options ${message.length ? `(${ message.join(' ') })` : ''} ${result.error.annotate()}`);
  }

  return result.value;
};

internals.cachePolicy = Joi.object({
  cache: Joi.string().allow(null).allow(''),
  segment: Joi.string(),
  shared: Joi.boolean()
}).unknown();

internals.method = Joi.object({
  bind: Joi.object().allow(null),
  generateKey: Joi.function(),
  cache: internals.cachePolicy
});

internals.methodObject = Joi.object({
  name: Joi.string().required(),
  method: Joi.function().required(),
  options: Joi.object()
});

internals.linkObject = Joi.object({
  name: Joi.string().required(),
  options: Joi.object().optional()

});
