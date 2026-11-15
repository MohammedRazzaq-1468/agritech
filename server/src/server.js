import app from './app.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';

const PORT = env.PORT || 5000;

const server = app.listen(PORT, () => {
  logger.info(`AgriSmart AI Backend running in [${env.NODE_ENV}] mode on port ${PORT}`);
  logger.info(`Base API URL: http://localhost:${PORT}/api/v1`);
  logger.info(`Health check: http://localhost:${PORT}/api/v1/health`);
});

// Graceful shutdown handling
function gracefulShutdown(signal) {
  logger.info(`${signal} received. Initiating graceful shutdown...`);
  server.close(() => {
    logger.info('HTTP server closed cleanly. Exiting process.');
    process.exit(0);
  });

  setTimeout(() => {
    logger.error('Forceful shutdown triggered after timeout.');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

export default server;

