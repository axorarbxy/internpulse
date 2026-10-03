const {Pool}=require('pg');
const poolConfig = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL }
  : {
      host: process.env.DB_HOST || '127.0.0.1',
      port: Number(process.env.DB_PORT || 5432),
      database: process.env.DB_NAME || 'smart_internship',
      user: process.env.DB_USER || 'internpulse',
      password: process.env.DB_PASSWORD || 'internpulse_local'
    };
const pool=new Pool(poolConfig);
pool.on('error',e=>console.error('PostgreSQL pool error:',e.message));
module.exports=pool;
