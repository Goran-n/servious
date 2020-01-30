"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _get2 = _interopRequireDefault(require("@babel/runtime/helpers/get"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var axon = require('@dashersw/axon');

module.exports = function (Base) {
  return (
    /*#__PURE__*/
    function (_Base) {
      (0, _inherits2["default"])(Monitorable, _Base);

      function Monitorable() {
        (0, _classCallCheck2["default"])(this, Monitorable);
        return (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(Monitorable).apply(this, arguments));
      }

      (0, _createClass2["default"])(Monitorable, [{
        key: "startExplorer",
        value: function startExplorer() {
          var _this = this;

          (0, _get2["default"])((0, _getPrototypeOf2["default"])(Monitorable.prototype), "startExplorer", this).call(this);
          this.explorer.on('added', function (obj) {
            var adv = obj.advertisement;

            if (adv.type != 'monitor' || !_this.advertisement.key.startsWith(adv.key)) {
              return;
            }

            _this.onMonitorAdded(obj);
          });
        }
      }, {
        key: "onMonitorAdded",
        value: function onMonitorAdded(obj) {
          var _this2 = this;

          if (!this.monitorStatusPublisher) {
            this.monitorStatusPublisher = new axon.PubEmitterSocket();
            this.monitorStatusPublisher.sock.set('retry timeout', 0);
            var statusInterval = this.explorerOptions.statusInterval || 5000;
            this.monitorInterval = setInterval(function () {
              return _this2.onMonitorInterval();
            }, statusInterval);
          }

          var address = obj.address;

          if (this.constructor.useHostNames) {
            address = obj.hostName;
          }

          this.monitorStatusPublisher.connect(obj.advertisement.port, address);
        }
      }, {
        key: "onMonitorInterval",
        value: function onMonitorInterval() {
          var _this3 = this;

          if (!this.monitorStatusPublisher.sock.socks.length) {
            return;
          }

          var nodes = (this.sock.socks || this.sock.sock.socks).map(function (s) {
            if (s.id) {
              return s.id;
            }

            for (var id in _this3.explorer.nodes) {
              var node = _this3.explorer.nodes[id];

              if ((_this3.constructor.useHostNames ? s._host == node.hostName : s.remoteAddress == node.address) && s.remotePort == node.broadcast.port) {
                s.id = node.id;
                return s.id;
              }
            }
          });
          this.monitorStatusPublisher.emit('status', {
            id: this.explorer.me.id,
            nodes: nodes
          });
        }
      }]);
      return Monitorable;
    }(Base)
  );
};