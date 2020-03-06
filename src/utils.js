
/**
 * Slice helper.
 *
 * @api private
 * @param {IArguments} args
 * @return {Array}
 */

export const slice = (args) => {
  let len = args.length;
  let ret = new Array(len);

  for (let i = 0; i < len; i++) {
    ret[ i ] = args[ i ];
  }

  return ret;
};
