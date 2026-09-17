// INTERNAL MODULE 4 FUNCTIONALITY — Express app assembly
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const config = require('./config/env');
const routes = require('./routes');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');
const { generalLimiter } = require('./middleware/rateLimiter');

const app = express();

app.use(helmet());
app.use(cors({ origin: config.frontendUrl, credentials: true }));
app.use(express.json({ limit: '100kb' })); // request size limit
app.use(generalLimiter);

app.get('/health', (req, res) => res.json({ success: true, module: 'module-4', status: 'ok' }));

app.use('/api', routes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
