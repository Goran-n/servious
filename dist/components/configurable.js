"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

module.exports = function (Base) {
  return (
    /*#__PURE__*/
    function (_Base) {
      (0, _inherits2["default"])(Configurable, _Base);

      function Configurable() {
        (0, _classCallCheck2["default"])(this, Configurable);
        return (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(Configurable).apply(this, arguments));
      }

      (0, _createClass2["default"])(Configurable, null, [{
        key: "setEnvironment",
        value: function setEnvironment(environment) {
          if (!environment) {
            return;
          }

          this.constructor._environment = "".concat(environment, ":");
        }
      }, {
        key: "setUseHostNames",
        value: function setUseHostNames(useHostNames) {
          this.constructor._useHostNames = useHostNames;
        }
      }, {
        key: "environment",
        get: function get() {
          return this.constructor._environment || '';
        }
      }, {
        key: "useHostNames",
        get: function get() {
          return this.constructor._useHostNames || false;
        }
      }]);
      return Configurable;
    }(Base)
  );
};