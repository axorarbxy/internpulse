const router = require('express').Router();

const module4BaseUrl = (process.env.MODULE4_API_URL || 'http://localhost:5004').replace(/\/$/, '');

router.use(async (req, res) => {
  try {
    let module4Path = req.originalUrl.replace(/^\/api\/realtime/, '') || '/';
    if (!module4Path.startsWith('/api') && !module4Path.startsWith('/health')) {
      module4Path = `/api${module4Path}`;
    }
    const headers = { Accept: req.headers.accept || 'application/json' };
    if (req.headers.authorization) {
      headers.Authorization = req.headers.authorization;
    }
    if (req.is('json')) {
      headers['Content-Type'] = 'application/json';
    }

    const hasBody = !['GET', 'HEAD'].includes(req.method) && req.body && Object.keys(req.body).length > 0;

    const response = await fetch(`${module4BaseUrl}${module4Path}`, {
      method: req.method,
      headers,
      body: hasBody ? JSON.stringify(req.body) : undefined,
    });

    const contentType = response.headers.get('content-type');
    if (contentType) {
      res.set('Content-Type', contentType);
    }
    res.status(response.status);
    res.send(Buffer.from(await response.arrayBuffer()));
  } catch (error) {
    res.status(502).json({ message: `Module 4 unavailable: ${error.message}` });
  }
});

module.exports = router;
