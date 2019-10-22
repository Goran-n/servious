import Explorer from './components/explorer'
import Requester from './components/requester'
import Responder from './components/responder'

const optionsBuilder = require('./options-builder');

const Servious = (options = {}) => {
    options = optionsBuilder(options);

    Explorer.setDefaults(options);

    const components = [
        Requester,
        Responder
    ];

    components.forEach(function(component) {
        component.setEnvironment(options.environment);
        component.setUseHostNames && component.setUseHostNames(options.useHostNames);
    });

    return Servious;
};

Servious.Requester = Requester;
Servious.Responder = Responder

module.exports = Servious();
