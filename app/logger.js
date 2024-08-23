// logger.js
const { createLogger, transports, format } = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');

// Define log format
const logFormat = format.combine(
  format.timestamp(),
  format.printf(({ timestamp, level, message }) => {
    return `${timestamp} [${level}]: ${message}`;
  })
);

// Create logger instance
const logger = createLogger({
  level: 'info', // default level
  format: logFormat,
  transports: [
    // new transports.Console(), // Log to console
    new DailyRotateFile({
      filename: 'adbr-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      dirname: './log/text',
      maxFiles: '30d'
    })
  ]
});

module.exports = logger;