const router = require('express').Router();

const module4BaseUrl = (process.env.MODULE4_API_URL || 'http://localhost:5004').replace(/\/$/, '');

router.use(async (req, res) => {
  try {
    const module4Path = req.originalUrl.replace(/^\/api\/realtime/, '') || '/';
    const headers = { Accept: req.headers.accept || 'application/json' };
    if (req.headers.authorization) {
      headers.Authorization = req.headers.authorization;
    }
    if (req.is('json')) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${module4BaseUrl}${module4Path}`, {
      method: req.method,
      headers,
      body: ['GET', 'HEAD'].includes(req.method) ? undefined : JSON.stringify(req.body),
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
