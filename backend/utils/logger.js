// ===================================================================
// FILE: backend/utils/logger.js
// ===================================================================

const fs = require('fs');
const path = require('path');

class Logger {
  constructor() {
    this.logDir = path.join(__dirname, '../logs');
    
    // Create logs directory if it doesn't exist
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }
  
  // Get log file path
  getLogFile(type = 'app') {
    const date = new Date().toISOString().split('T')[0];
    return path.join(this.logDir, `${type}-${date}.log`);
  }
  
  // Write log
  write(level, message, data = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      data,
    };
    
    const logString = JSON.stringify(logEntry) + '\n';
    
    // Console output
    console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`);
    
    // File output
    const logFile = this.getLogFile('app');
    fs.appendFileSync(logFile, logString);
  }
  
  // Log levels
  info(message, data) {
    this.write('info', message, data);
  }
  
  warn(message, data) {
    this.write('warn', message, data);
  }
  
  error(message, data) {
    this.write('error', message, data);
    
    // Also write to error log
    const errorFile = this.getLogFile('error');
    const logString = JSON.stringify({
      timestamp: new Date().toISOString(),
      message,
      data,
    }) + '\n';
    fs.appendFileSync(errorFile, logString);
  }
  
  debug(message, data) {
    if (process.env.NODE_ENV === 'development') {
      this.write('debug', message, data);
    }
  }
  
  // Log API request
  logRequest(req) {
    this.info('API Request', {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      farmerId: req.farmerId,
    });
  }
  
  // Log API response
  logResponse(req, res, duration) {
    this.info('API Response', {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      farmerId: req.farmerId,
    });
  }
}

module.exports = new Logger();