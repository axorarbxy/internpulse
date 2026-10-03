const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const companyRoutes = require('./routes/companyRoutes');
const institutionRoutes = require('./routes/institutionRoutes');
const internshipRoutes = require('./routes/internshipRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const certificateRoutes = require('./routes/certificateRoutes');
const intelligenceRoutes = require('./routes/intelligenceRoutes');
const module4Routes = require('./routes/module4Routes');
const integrationRoutes = require('./routes/integrationRoutes');
const systemRoutes = require('./routes/systemRoutes');

const app = express();
app.use(helmet());

const allowedOrigins = new Set([
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:4173',
  'http://127.0.0.1:4173',
]);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        return callback(null, true);
      }

      const url = new URL(origin);
      const isLocalhost = ['localhost', '127.0.0.1'].includes(url.hostname);
      const allowedPorts = ['5173', '5174', '5175', '3000', '3001', '4173', '8080'];

      if (isLocalhost && allowedPorts.includes(url.port)) {
        return callback(null, true);
      }

      return callback(new Error('CORS origin not allowed'));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '100kb' }));

app.get('/', (req, res) => {
  res.json({
    message: 'Smart Internship Management API is running',
  });
});

app.get('/health', async (req, res) => {
  try {
    await require('./config/db').query('SELECT 1');
    return res.json({
      status: 'ok',
      service: 'core-backend',
      dependencies: { postgresql: 'online' },
    });
  } catch {
    return res.status(503).json({
      status: 'degraded',
      service: 'core-backend',
      dependencies: { postgresql: 'offline' },
    });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/institutions', institutionRoutes);
app.use('/api/internships', internshipRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/intelligence', intelligenceRoutes);
app.use('/api/realtime', module4Routes);
app.use('/api/integration', integrationRoutes);
app.use('/api/admin', systemRoutes);

app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found',
  });
});

app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);

  res.status(error.status || 500).json({
    message: error.message || 'Internal server error',
  });
});

module.exports = app;