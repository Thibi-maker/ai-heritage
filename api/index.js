const app = require('../server.js');

const ready = app.initDatabase().catch(err => {
    console.error('[db] Vercel database init failed (will retry on next cold start):', err.message);
});

module.exports = async function (req, res) {
    await ready;
    return app(req, res);
};