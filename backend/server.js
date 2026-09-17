require('dotenv').config();
const app=require('./app'); const pool=require('./config/db');
const PORT=process.env.PORT||5000;
(async()=>{try{await pool.query('SELECT NOW()');console.log('PostgreSQL Connected');app.listen(PORT,()=>console.log(`Server running on http://localhost:${PORT}`));}catch(e){console.error('Database connection failed:',e.message);process.exit(1);}})();
