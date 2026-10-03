require('dotenv').config();

const app = require('./app');
const pool = require('./config/db');
const seedDemoPortal = require('./utils/seedDemoPortal');
const crypto = require('crypto');

const PORT = process.env.PORT || 5000;

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

if (process.env.NODE_ENV === 'production') {
  const productionSecrets = [
    ['JWT_SECRET', process.env.JWT_SECRET],
    ['INTERNAL_SERVICE_KEY', process.env.INTERNAL_SERVICE_KEY],
  ];
  const insecure = productionSecrets.filter(([, value]) => (
    typeof value !== 'string' || value.length < 32 || /development|local|change-me|your-production/i.test(value)
  ));
  if (insecure.length) {
    throw new Error(`Production requires strong secrets: ${insecure.map(([name]) => name).join(', ')}`);
  }
}

async function startServer(maxRetries = 5, delayMs = 3000) {
  let retries = maxRetries;

  while (retries > 0) {
    try {
      await pool.query('SELECT NOW()');
      await seedDemoPortal();
      console.log('PostgreSQL Connected');
      break;
    } catch (error) {
      retries -= 1;

      console.error(
        `Database connection failed: ${error.message}. Retries left: ${retries}`
      );

      if (retries === 0) {
        console.error('Could not connect to PostgreSQL. Exiting.');
        process.exit(1);
      }

      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();