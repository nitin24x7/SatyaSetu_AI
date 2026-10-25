import dotenv from 'dotenv';
import { app } from './api/app';

dotenv.config();

const PORT = parseInt(process.env.PORT || '4000', 10);
const HOST = process.env.HOST || '0.0.0.0';

const server = app.listen(PORT, HOST, () => {
  console.log(`================================================================`);
  console.log(`🛡️  SatyaSetu AI — Core Microservices Gateway`);
  console.log(`🚀 Gateway URL:      http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}`);
  console.log(`📖 Swagger OpenAPI:  http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}/api-docs`);
  console.log(`⚡ GraphQL Gateway:  http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}/graphql`);
  console.log(`🏥 Health Probe:     http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}/health`);
  console.log(`================================================================`);
});

// Graceful Shutdown Handler
function handleGracefulShutdown(signal: string) {
  console.log(`\n[Shutdown] Received ${signal}. Closing server gracefully...`);
  server.close(() => {
    console.log('[Shutdown] HTTP Gateway closed.');
    process.exit(0);
  });

  // Force close if ongoing requests hang
  setTimeout(() => {
    console.error('[Shutdown] Forceful termination timeout reached.');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));
process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));

