"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.slice = void 0;

/**
 * Slice helper.
 *
 * @api private
 * @param {IArguments} args
 * @return {Array}
 */
var slice = function slice(args) {
  var len = args.length;
  var ret = new Array(len);

  for (var i = 0; i < len; i++) {
    ret[i] = args[i];
  }

  return ret;
};

exports.slice = slice;