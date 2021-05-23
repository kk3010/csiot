import { createLogger as createWinston, transports, format } from 'winston'
import type { Logger } from 'winston'

let logger: Logger

/**
 * Get a logger instance.
 * @param service - The service name
 * @returns An instance of the logger that includes the name of the service
 */
export const useLogging = (service: string) => {
  return logger.child({ service })
}

/**
 * Initialize the logger for the app
 * @param level - The level to log
 */
export const createLogger = (level: string) => {
  logger = createWinston({
    level,
    format: format.combine(
      format.colorize(),
      format.timestamp(),
      format.align(),
      format.printf(({ timestamp, level, message, service, ...rest }) =>
        `${timestamp} ${service} ${level}: ${message} ${
          Object.keys(rest).length > 0 ? JSON.stringify(rest) : ''
        }`.trimEnd()
      )
    ),
    transports: [new transports.Console()],
  })
}
