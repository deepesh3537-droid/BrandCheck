import { app } from './app.js';
import { env } from './config/env.js';

app.listen(env.PORT, () => {
  console.log(`[BrandCheck Server] Listening on port ${env.PORT} (${env.NODE_ENV})`);
  console.log(`[BrandCheck Server] Healthcheck available at http://localhost:${env.PORT}/api/health`);
});
