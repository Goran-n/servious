const info = (...args) => {
  if (process.env.SERVIOUS_LOG_INFO != 0) {
    console.info(args); // eslint-disable-line no-console
  }
};

const warn = (...args) => {
  if (process.env.SERVIOUS_LOG_WARN != 0) {
    console.warn(args); // eslint-disable-line no-console
  }
};

const error = (...args) => {
  if (process.env.SERVIOUS_LOG_ERROR != 0) {
    console.error(args); // eslint-disable-line no-console
  }
};

export default {
  info,
  warn,
  error
};
