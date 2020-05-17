const log4js = require('log4js')

log4js.configure({
  appenders: {
    // fileErrorLogger: { type: 'file', filename: 'error.log' },
    // fileDebugLogger: { type: 'file', filename: 'debug.log' },
    fileErrorLogger: { type: 'console', filename: 'error.log' },
    fileDebugLogger: { type: 'console', filename: 'debug.log' },
    console: { type: 'console' }
  },
  categories: {
    default: { appenders: ['console'], level: 'debug' },
    fileErrorLogger: { appenders: ['fileErrorLogger', 'console'], level: 'error' },
    fileDebugLogger: { appenders: ['fileDebugLogger', 'console'], level: 'debug' }
  }
})

const fileErrorLogger = log4js.getLogger('fileErrorLogger')
const fileDebugLogger = log4js.getLogger('fileDebugLogger')
const consoleLogger = log4js.getLogger()

module.exports = {
  info: (...args) => consoleLogger.info(...args),
  error: (...args) => fileErrorLogger.error(...args),
  debug: (...args) => fileDebugLogger.error(...args)
}
