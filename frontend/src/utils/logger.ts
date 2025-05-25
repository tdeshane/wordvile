type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: Date
  data?: any
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'
  private logs: LogEntry[] = []

  private log(level: LogLevel, message: string, data?: any) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      data
    }

    this.logs.push(entry)

    if (this.isDevelopment) {
      const style = this.getStyle(level)
      const prefix = `[${level.toUpperCase()}] ${entry.timestamp.toISOString()}`
      
      if (data) {
        console[level](`%c${prefix} ${message}`, style, data)
      } else {
        console[level](`%c${prefix} ${message}`, style)
      }
    }
  }

  private getStyle(level: LogLevel): string {
    switch (level) {
      case 'debug':
        return 'color: #888'
      case 'info':
        return 'color: #2196F3'
      case 'warn':
        return 'color: #FF9800'
      case 'error':
        return 'color: #F44336; font-weight: bold'
    }
  }

  debug(message: string, data?: any) {
    this.log('debug', message, data)
  }

  info(message: string, data?: any) {
    this.log('info', message, data)
  }

  warn(message: string, data?: any) {
    this.log('warn', message, data)
  }

  error(message: string, data?: any) {
    this.log('error', message, data)
  }

  getLogs(): LogEntry[] {
    return [...this.logs]
  }

  clearLogs() {
    this.logs = []
  }
}

export const logger = new Logger()
export default logger