"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var Hoek = require('@hapi/hoek');

var Config = require('../config');

var internals = {
  methodNameRx: /^[_$a-zA-Z][$\w]*(?:\.[_$a-zA-Z][$\w]*)*$/
};

exports = module.exports =
/*#__PURE__*/
function () {
  function _class(core) {
    (0, _classCallCheck2["default"])(this, _class);
    this.core = core;
    this.methods = {};
  }

  (0, _createClass2["default"])(_class, [{
    key: "add",
    value: function add(name, method, options, realm) {
      if ((0, _typeof2["default"])(name) !== 'object') {
        return this._add(name, method, options, realm);
      } // {} or [{}, {}]


      var items = [].concat(name);
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = items[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var item = _step.value;
          item = Config.apply('methodObject', item);

          this._add(item.name, item.method, item.options || {}, realm);
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator["return"] != null) {
            _iterator["return"]();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    }
  }, {
    key: "_add",
    value: function _add(name, method, options, realm) {
      Hoek.assert(typeof method === 'function', 'method must be a function');
      Hoek.assert(typeof name === 'string', 'name must be a string');
      Hoek.assert(name.match(internals.methodNameRx), 'Invalid name:', name);
      Hoek.assert(!Hoek.reach(this.methods, name, {
        functions: false
      }), 'Server method function name already exists:', name);
      options = Config.apply('method', options, name);
      var settings = Hoek.clone(options, {
        shallow: ['bind']
      });
      settings.generateKey = settings.generateKey || internals.generateKey; // Not cached

      if (!settings.cache) {
        return this._assign(name, method);
      } // Cached


      Hoek.assert(!settings.cache.generateFunc, 'Cannot set generateFunc with method caching:', name);
      Hoek.assert(settings.cache.generateTimeout !== undefined, 'Method caching requires a timeout value in generateTimeout:', name);

      settings.cache.generateFunc = function (id, flags) {
        return bound.apply(void 0, (0, _toConsumableArray2["default"])(id.args).concat([flags]));
      };

      var cache = this.core._cachePolicy(settings.cache, "#".concat(name));

      var func = function func() {
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        var key = settings.generateKey.apply(bind, args);

        if (typeof key !== 'string') {
          return Promise.reject("Invalid Method key when invoking ".concat(name, " - ").concat(args));
        }

        return cache.get({
          id: key,
          args: args
        });
      };

      func.cache = {
        drop: function drop() {
          for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            args[_key2] = arguments[_key2];
          }

          var key = settings.generateKey.apply(bind, args);

          if (typeof key !== 'string') {
            return Promise.reject("Invalid Method key when invoking ".concat(name, " - ").concat(args));
          }

          return cache.drop(key);
        },
        stats: cache.stats
      };

      this._assign(name, func, func);
    }
  }, {
    key: "_assign",
    value: function _assign(name, method) {
      var path = name.split('.');
      var ref = this.methods;

      for (var i = 0; i < path.length; ++i) {
        if (!ref[path[i]]) {
          ref[path[i]] = i + 1 === path.length ? method : {};
        }

        ref = ref[path[i]];
      }
    }
  }]);
  return _class;
}();

internals.supportedArgs = ['string', 'number', 'boolean'];

internals.generateKey = function () {
  var key = '';

  for (var i = 0; i < arguments.length; ++i) {
    var arg = i < 0 || arguments.length <= i ? undefined : arguments[i];

    if (!internals.supportedArgs.includes((0, _typeof2["default"])(arg))) {
      return null;
    }

    key = key + (i ? ':' : '') + encodeURIComponent(arg.toString());
  }

  return key;
};