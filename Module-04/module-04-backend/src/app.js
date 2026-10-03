// INTERNAL MODULE 4 FUNCTIONALITY — Express app assembly
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
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

app.get('/health', (req, res) => {
	const databaseReady = mongoose.connection.readyState === 1;
	return res.status(databaseReady ? 200 : 503).json({
		success: databaseReady,
		module: 'module-4',
		status: databaseReady ? 'ok' : 'degraded',
		dependencies: { mongodb: databaseReady ? 'online' : 'offline' },
	});
});

app.use('/api', routes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
