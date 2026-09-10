import { createApp } from './app.js';
import { config } from './config/index.js';

async function start() {
  try {
    const app = await createApp();
    
    await app.listen({
      port: config.port,
      host: config.host,
    });

    console.log(`
🚀 Repo Doctor Backend is running!
📡 API Server: http://${config.host}:${config.port}
🏥 Health Check: http://${config.host}:${config.port}/health
🌍 Environment: ${config.nodeEnv}
    `);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
