import log4js from 'log4js';

log4js.configure({
  appenders: {
    stdout: {
      type: 'stdout',
    },
  },
  categories: {
    default: { appenders: ['stdout'], level: 'debug' },
  },
});

export default log4js.getLogger();
