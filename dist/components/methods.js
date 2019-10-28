"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Hoek = require("@hapi/hoek");

var Config = require("../config");

var internals = {
  "methodNameRx": /^[_$a-zA-Z][$\w]*(?:\.[_$a-zA-Z][$\w]*)*$/
};

exports = module.exports =
/*#__PURE__*/
function () {
  function _class(core) {
    _classCallCheck(this, _class);

    this.core = core;
    this.methods = {};
  }

  _createClass(_class, [{
    key: "add",
    value: function add(name, method, options, realm) {
      if (_typeof(name) !== "object") {
        return this._add(name, method, options, realm);
      } // {} or [{}, {}]


      var items = [].concat(name);
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = items[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var item = _step.value;
          item = Config.apply("methodObject", item);

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
      Hoek.assert(typeof method === "function", "method must be a function");
      Hoek.assert(typeof name === "string", "name must be a string");
      Hoek.assert(name.match(internals.methodNameRx), "Invalid name:", name);
      Hoek.assert(!Hoek.reach(this.methods, name, {
        "functions": false
      }), "Server method function name already exists:", name);
      options = Config.apply("method", options, name);
      var settings = Hoek.clone(options, {
        "shallow": ["bind"]
      });
      settings.generateKey = settings.generateKey || internals.generateKey; // Not cached

      if (!settings.cache) {
        return this._assign(name, method);
      } // Cached


      Hoek.assert(!settings.cache.generateFunc, "Cannot set generateFunc with method caching:", name);
      Hoek.assert(settings.cache.generateTimeout !== undefined, "Method caching requires a timeout value in generateTimeout:", name);

      settings.cache.generateFunc = function (id, flags) {
        return bound.apply(void 0, _toConsumableArray(id.args).concat([flags]));
      };

      var cache = this.core._cachePolicy(settings.cache, "#".concat(name));

      var func = function func() {
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        var key = settings.generateKey.apply(bind, args);

        if (typeof key !== "string") {
          return Promise.reject("Invalid Method key when invoking ".concat(name, " - ").concat(args));
        }

        return cache.get({
          "id": key,
          args: args
        });
      };

      func.cache = {
        "drop": function drop() {
          for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            args[_key2] = arguments[_key2];
          }

          var key = settings.generateKey.apply(bind, args);

          if (typeof key !== "string") {
            return Promise.reject("Invalid Method key when invoking ".concat(name, " - ").concat(args));
          }

          return cache.drop(key);
        },
        "stats": cache.stats
      };

      this._assign(name, func, func);
    }
  }, {
    key: "_assign",
    value: function _assign(name, method) {
      var path = name.split(".");
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

internals.supportedArgs = ["string", "number", "boolean"];

internals.generateKey = function () {
  var key = "";

  for (var i = 0; i < arguments.length; ++i) {
    var arg = i < 0 || arguments.length <= i ? undefined : arguments[i];

    if (!internals.supportedArgs.includes(_typeof(arg))) {
      return null;
    }

    key = key + (i ? ":" : "") + encodeURIComponent(arg.toString());
  }

  return key;
};