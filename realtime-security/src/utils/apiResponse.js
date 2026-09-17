// INTERNAL MODULE 4 FUNCTIONALITY — consistent API envelope
function ok(res, data = {}, status = 200) {
  return res.status(status).json({ success: true, data });
}

function fail(res, status, message, errorCode) {
  return res.status(status).json({ success: false, message, errorCode });
}

module.exports = { ok, fail };
