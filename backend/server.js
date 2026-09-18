require('dotenv').config();
const app=require('./app'); const pool=require('./config/db');
const PORT=process.env.PORT||5000;

async function startServer(maxRetries = 5, delayMs = 3000) {
  let retries = maxRetries;
  while (retries > 0) {
    try {
      await pool.query('SELECT NOW()');
      console.log('PostgreSQL Connected');
      break;
    } catch (e) {
      retries -= 1;
      console.error(`Database connection failed: ${e.message}. Retries left: ${retries}`);
      if (retries === 0) {
        console.error('Could not connect to PostgreSQL. Exiting.');
        process.exit(1);
      }
      await new Promise((res) => setTimeout(res, delayMs));
    }
  }

  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}

startServer();
