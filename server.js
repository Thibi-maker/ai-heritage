require('dotenv').config();

const express = require('express');
const { Pool } = require('pg');
const crypto = require('crypto');
const path = require('path');

const PORT = process.env.PORT || 3000;
const DATABASE_URL = process.env.DATABASE_URL;

// ---------- DATABASE SETUP ----------
const pool = new Pool({ connectionString: DATABASE_URL });

async function query(text, params) {
    const client = await pool.connect();
    try {
        return await client.query(text, params);
    } finally {
        client.release();
    }
}

async function initDatabase() {
    await query(`
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            joined TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS sessions (
            token TEXT PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id),
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            remember BOOLEAN NOT NULL DEFAULT FALSE
        );

        CREATE TABLE IF NOT EXISTS activities (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id),
            action TEXT NOT NULL,
            details TEXT,
            timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS monuments (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            location TEXT,
            country TEXT,
            year_built TEXT,
            category TEXT NOT NULL DEFAULT 'other',
            status TEXT,
            unesco BOOLEAN NOT NULL DEFAULT FALSE,
            at_risk BOOLEAN NOT NULL DEFAULT FALSE,
            endangered BOOLEAN NOT NULL DEFAULT FALSE,
            conservation_status TEXT NOT NULL DEFAULT 'in_progress'
        );

        CREATE TABLE IF NOT EXISTS prevention_strategies (
            id SERIAL PRIMARY KEY,
            title TEXT NOT NULL,
            icon TEXT NOT NULL DEFAULT '🛡️',
            advice TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS prevention_methods (
            id SERIAL PRIMARY KEY,
            method TEXT NOT NULL
        );
    `);

    await seedDatabase();
    console.log('[db] Neon Postgres database ready');
}

async function seedDatabase() {
    const { rows } = await query('SELECT COUNT(*) c FROM monuments');
    if (parseInt(rows[0].c) > 0) return;

    const sites = [
        ['Taj Mahal', 'Agra', 'India', '1632', 'building', 'Preserved', true, false, false, 'completed'],
        ['Colosseum', 'Rome', 'Italy', '72 AD', 'building', 'Restoring', true, true, false, 'in_progress'],
        ['Machu Picchu', 'Cusco', 'Peru', '1450', 'archaeological', 'Monitored', true, true, false, 'in_progress'],
        ['Angkor Wat', 'Siem Reap', 'Cambodia', '1113', 'stone', 'Preserved', true, false, false, 'completed'],
        ['Great Wall', 'Northern China', 'China', '7th BC', 'building', 'Monitored', true, true, false, 'in_progress'],
        ['Pyramids of Giza', 'Giza', 'Egypt', '2560 BC', 'stone', 'Preserved', true, false, false, 'completed'],
        ['Petra', 'Ma\'an', 'Jordan', '312 BC', 'archaeological', 'Restoring', true, true, true, 'in_progress'],
        ['Chichen Itza', 'Yucatan', 'Mexico', '600 AD', 'archaeological', 'Preserved', true, false, false, 'completed'],
        ['Acropolis', 'Athens', 'Greece', '447 BC', 'stone', 'Restoring', true, true, false, 'in_progress'],
        ['Stonehenge', 'Wiltshire', 'United Kingdom', '3000 BC', 'stone', 'Monitored', true, false, false, 'planned'],
        ['Hagia Sophia', 'Istanbul', 'Turkey', '537', 'building', 'Preserved', true, false, false, 'completed'],
        ['Christ the Redeemer', 'Rio de Janeiro', 'Brazil', '1931', 'stone', 'Monitored', true, false, false, 'in_progress'],
        ['Alhambra', 'Granada', 'Spain', '889', 'building', 'Preserved', true, false, false, 'completed'],
        ['Colosseum of Pula', 'Pula', 'Croatia', '27 AD', 'archaeological', 'Restoring', false, true, false, 'in_progress'],
        ['Moai Statues', 'Easter Island', 'Chile', '1250', 'stone', 'At Risk', true, true, true, 'active'],
        ['Pompeii', 'Naples', 'Italy', '79 AD', 'archaeological', 'Restoring', true, true, false, 'active'],
        ['Borobudur', 'Magelang', 'Indonesia', '825', 'stone', 'Preserved', true, false, false, 'completed'],
        ['Karnak Temple', 'Luxor', 'Egypt', '2055 BC', 'stone', 'Monitored', true, false, false, 'planned'],
        ['Bagan Temples', 'Mandalay', 'Myanmar', '9th AD', 'stone', 'At Risk', false, true, true, 'active'],
        ['Notre-Dame', 'Paris', 'France', '1163', 'building', 'Restoring', true, true, false, 'active'],
        ['Mohenjo-daro', 'Sindh', 'Pakistan', '2500 BC', 'archaeological', 'At Risk', true, true, true, 'active'],
        ['Hampi', 'Karnataka', 'India', '1336', 'archaeological', 'Monitored', true, false, false, 'in_progress'],
        ['Sigiriya', 'Central', 'Sri Lanka', '477', 'stone', 'Preserved', true, false, false, 'completed'],
        ['Cappadocia', 'Nevsehir', 'Turkey', '5th BC', 'archaeological', 'Monitored', false, true, false, 'planned'],
        ['Valley of the Kings', 'Luxor', 'Egypt', '16th BC', 'archaeological', 'Monitored', true, false, false, 'in_progress']
    ];

    for (const s of sites) {
        await query(
            `INSERT INTO monuments (name, location, country, year_built, category, status, unesco, at_risk, endangered, conservation_status)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
            s
        );
    }

    const strategies = [
        ['Stone Monuments', '🏛️', 'Apply protective coatings, monitor erosion patterns, and control vegetation growth'],
        ['Historical Buildings', '🏰', 'Structural reinforcement, moisture control, and regular maintenance inspections'],
        ['Archaeological Sites', '🗿', 'Site stabilization, controlled access, and environmental monitoring systems']
    ];
    for (const s of strategies) {
        await query('INSERT INTO prevention_strategies (title, icon, advice) VALUES ($1,$2,$3)', s);
    }

    const methods = [
        'AI-powered damage detection',
        '3D scanning and modeling',
        'Environmental monitoring',
        'Controlled access management',
        'Advanced materials testing',
        'Documentation digitization'
    ];
    for (const m of methods) {
        await query('INSERT INTO prevention_methods (method) VALUES ($1)', [m]);
    }

    console.log('[db] Seeded monuments, strategies and methods');
}

// ---------- HELPERS ----------
function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.scryptSync(password, salt, 64).toString('hex');
    return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
    const [salt, hash] = stored.split(':');
    const test = crypto.scryptSync(password, salt, 64).toString('hex');
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(test, 'hex'));
}

function newToken() {
    return crypto.randomBytes(32).toString('hex');
}

// ---------- EXPRESS APP ----------
const app = express();
app.use(express.json({ limit: '10mb' }));

app.use((req, res, next) => {
    const origin = req.headers.origin;
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
});
app.use(express.static(path.join(__dirname, 'public')));

// ---------- AUTH MIDDLEWARE ----------
async function requireAuth(req, res, next) {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ success: false, error: 'Not authenticated' });

    const { rows } = await query(`
        SELECT u.id, u.name, u.email, u.joined, s.token
        FROM sessions s
        JOIN users u ON u.id = s.user_id
        WHERE s.token = $1
    `, [token]);

    if (!rows.length) return res.status(401).json({ success: false, error: 'Session expired' });

    const session = rows[0];
    req.user = { id: session.id, name: session.name, email: session.email, joined: session.joined };
    req.token = token;
    next();
}

// ---------- API ROUTES ----------
app.get('/api/health', async (req, res) => {
    const { rows: u } = await query('SELECT COUNT(*) c FROM users');
    const { rows: a } = await query('SELECT COUNT(*) c FROM activities');
    res.json({ ok: true, database: 'Neon Postgres', users: parseInt(u[0].c), activities: parseInt(a[0].c) });
});

app.post('/api/register', async (req, res) => {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password)
        return res.status(400).json({ success: false, error: 'name, email and password are required' });
    if (String(password).length < 6)
        return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });

    try {
        const { rows: exists } = await query('SELECT id FROM users WHERE email = $1', [email]);
        if (exists.length) return res.status(409).json({ success: false, error: 'An account with this email already exists' });

        const { rows } = await query(
            'INSERT INTO users (name, email, password_hash) VALUES ($1,$2,$3) RETURNING id',
            [name, email, hashPassword(password)]
        );
        await query('INSERT INTO activities (user_id, action, details) VALUES ($1,$2,$3)',
            [rows[0].id, 'register', 'User registered successfully']);

        res.json({ success: true, message: 'Registration successful' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.post('/api/login', async (req, res) => {
    const { email, password, rememberMe } = req.body || {};
    if (!email || !password)
        return res.status(400).json({ success: false, error: 'Email and password are required' });

    const { rows } = await query('SELECT id, name, email, password_hash, joined FROM users WHERE email = $1', [email]);
    if (!rows.length) return res.status(404).json({ success: false, error: 'No account found with this email' });

    const user = rows[0];
    if (!verifyPassword(password, user.password_hash))
        return res.status(401).json({ success: false, error: 'Incorrect password. Please try again.' });

    const token = newToken();
    await query('INSERT INTO sessions (token, user_id, remember) VALUES ($1,$2,$3)', [token, user.id, !!rememberMe]);
    await query('INSERT INTO activities (user_id, action, details) VALUES ($1,$2,$3)', [user.id, 'login', 'User logged in successfully']);

    res.json({ success: true, token, user: { id: user.id, name: user.name, email: user.email, joined: user.joined } });
});

app.post('/api/logout', requireAuth, async (req, res) => {
    await query('INSERT INTO activities (user_id, action, details) VALUES ($1,$2,$3)', [req.user.id, 'logout', 'User logged out']);
    await query('DELETE FROM sessions WHERE token = $1', [req.token]);
    res.json({ success: true });
});

app.get('/api/me', requireAuth, (req, res) => {
    res.json({ success: true, user: req.user });
});

app.get('/api/activity', requireAuth, async (req, res) => {
    const { rows } = await query(`
        SELECT action, details, timestamp FROM activities
        WHERE user_id = $1
        ORDER BY timestamp DESC, id DESC
    `, [req.user.id]);

    res.json({
        success: true,
        activities: rows.map(r => ({
            user: req.user.email,
            action: r.action,
            details: r.details,
            timestamp: r.timestamp
        }))
    });
});

app.post('/api/log', requireAuth, async (req, res) => {
    const { action, details } = req.body || {};
    await query('INSERT INTO activities (user_id, action, details) VALUES ($1,$2,$3)',
        [req.user.id, String(action || 'activity').slice(0, 50), String(details || '').slice(0, 500)]);
    res.json({ success: true });
});

// ---------- OAUTH ROUTES ----------

// Google OAuth 2.0
app.get('/auth/google', (req, res) => {
    const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID';
    const redirectUri = process.env.GOOGLE_OAUTH_REDIRECT_URI || 'http://localhost:3000/auth/google/callback';
    const scopes = 'profile email';
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', scopes);
    authUrl.searchParams.set('access_type', 'offline');
    authUrl.searchParams.set('prompt', 'select_account');
    authUrl.searchParams.set('state', 'login');
    res.redirect(authUrl.toString());
});

app.get('/auth/google/callback', async (req, res) => {
    const { code } = req.query || {};

    if (!code) {
        return res.status(400).send('Authorization code not received');
    }

    try {
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                code: code,
                client_id: process.env.GOOGLE_OAUTH_CLIENT_ID,
                client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
                redirect_uri: process.env.GOOGLE_OAUTH_REDIRECT_URI,
                grant_type: 'authorization_code'
            })
        });

        const tokenData = await tokenResponse.json();

        if (!tokenData.access_token) {
            console.error('Google token error:', tokenData);
            return res.status(400).send('Failed to get Google access token');
        }

        const userInfoResponse = await fetch(
            'https://www.googleapis.com/oauth2/v2/userinfo',
            {
                headers: {
                    Authorization: `Bearer ${tokenData.access_token}`
                }
            }
        );

        const userInfo = await userInfoResponse.json();

        const { rows: users } = await query(
            'SELECT id, name, email FROM users WHERE email = $1',
            [userInfo.email]
        );

        if (!users.length) {
            return res.redirect(
                '/login.html?error=' +
                encodeURIComponent(
                    'No account found with this email. Please register first.'
                )
            );
        }

        const user = users[0];

        const token = newToken();

        await query(
            'INSERT INTO sessions (token, user_id, remember) VALUES ($1,$2,$3)',
            [token, user.id, true]
        );

        const session = {
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            },
            token: token,
            loginTime: new Date().toISOString(),
            rememberMe: true
        };

        // Send the session to login.html temporarily.
        const sessionData = encodeURIComponent(JSON.stringify(session));

        res.redirect('/login.html?google_session=' + sessionData);

    } catch (err) {
        console.error('Google OAuth error:', err);

        res.redirect(
            '/login.html?error=' +
            encodeURIComponent('Google login failed. Please try again.')
        );
    }
});

// GitHub OAuth 2.0
app.get('/auth/github', (req, res) => {
    const clientId = process.env.GITHUB_OAUTH_CLIENT_ID || 'YOUR_GITHUB_CLIENT_ID';
    const redirectUri = process.env.GITHUB_OAUTH_REDIRECT_URI || 'http://localhost:3000/auth/github/callback';
    const authUrl = new URL('https://github.com/login/oauth/authorize');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('scope', 'read:user user:email');
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('state', 'login');
    res.redirect(authUrl.toString());
});

app.get('/auth/github/callback', async (req, res) => {
    const { code, state } = req.query || {};
    if (!code) return res.status(400).json({ success: false, error: 'Authorization code not received' });

    try {
        const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: { 'Accept': 'application/json' },
            body: new URLSearchParams({
                code: code,
                client_id: process.env.GITHUB_OAUTH_CLIENT_ID || 'YOUR_GITHUB_CLIENT_ID',
                client_secret: process.env.GITHUB_OAUTH_CLIENT_SECRET || 'YOUR_GITHUB_CLIENT_SECRET',
                redirect_uri: process.env.GITHUB_OAUTH_REDIRECT_URI || 'http://localhost:3000/auth/github/callback'
            })
        });
        const tokenData = await tokenResponse.json();
        // GitHub returns URL-encoded string, parse it
        const params = new URLSearchParams(tokenData);
        const accessToken = params.get('access_token');
        if (!accessToken) return res.status(400).json({ success: false, error: 'Failed to get access token' });

        const userInfoResponse = await fetch('https://api.github.com/user', {
            headers: { Authorization: `token ${accessToken}` }
        });
        const userInfo = await userInfoResponse.json();

        const { rows: users } = await query(
            'SELECT id, name, email FROM users WHERE email = $1',
            [userInfo.email]
        );

        if (users.length) {
            const token = newToken();
            await query('INSERT INTO sessions (token, user_id, remember) VALUES ($1,$2,$3)', [token, users[0].id, false]);
            res.json({ success: true, token, user: { id: users[0].id, name: users[0].name, email: users[0].email } });
        } else {
            res.json({ success: false, error: 'No account found with this email. Please register first.' });
        }
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.get('/api/database', requireAuth, async (req, res) => {
    const count = async (sql, params = []) => parseInt((await query(sql, params)).rows[0].c);

    const totalSites        = await count('SELECT COUNT(*) c FROM monuments');
    const countries         = await count('SELECT COUNT(DISTINCT country) c FROM monuments WHERE country IS NOT NULL');
    const unescoSites       = await count('SELECT COUNT(*) c FROM monuments WHERE unesco = TRUE');
    const atRiskSites       = await count('SELECT COUNT(*) c FROM monuments WHERE at_risk = TRUE');
    const endangered        = await count('SELECT COUNT(*) c FROM monuments WHERE endangered = TRUE');
    const preservationProjects = await count(`SELECT COUNT(*) c FROM monuments WHERE conservation_status IN ('active','in_progress')`);
    const activeProjects    = await count(`SELECT COUNT(*) c FROM monuments WHERE conservation_status = 'active'`);
    const inProgress        = await count(`SELECT COUNT(*) c FROM monuments WHERE conservation_status = 'in_progress'`);
    const completed         = await count(`SELECT COUNT(*) c FROM monuments WHERE conservation_status = 'completed'`);
    const planned           = await count(`SELECT COUNT(*) c FROM monuments WHERE conservation_status = 'planned'`);
    const cultural          = await count(`SELECT COUNT(*) c FROM monuments WHERE category IN ('building','stone')`);
    const endangeredCultural = await count(`SELECT COUNT(*) c FROM monuments WHERE category IN ('building','stone') AND endangered = TRUE`);

    const { rows: records } = await query(`SELECT name, year_built, status FROM monuments ORDER BY name`);
    const { rows: strategies } = await query('SELECT title, icon, advice FROM prevention_strategies');
    const { rows: methods } = await query('SELECT method FROM prevention_methods');

    res.json({
        success: true,
        stats: {
            totalSites, countries, unescoSites, atRiskSites, preservationProjects,
            conservation: { active: activeProjects, inProgress, completed, planned },
            heritage: { worldHeritage: unescoSites, cultural, natural: 0, mixed: 0, endangered }
        },
        records,
        strategies,
        methods
    });
});

app.get('/api/monuments', requireAuth, async (req, res) => {
    const { rows } = await query(`
        SELECT id, name, location, country, year_built, category, status,
               unesco, at_risk, endangered, conservation_status
        FROM monuments ORDER BY name
    `);
    res.json({ success: true, monuments: rows });
});

// ---------- START ----------
if (require.main === module) {
    initDatabase().then(() => {
        app.listen(PORT, () => {
            console.log('========================================');
            console.log('  AI Heritage server running');
            console.log(`  URL : http://localhost:${PORT}`);
            console.log('  DB  : Neon Postgres');
            console.log('========================================');
        });
    }).catch(err => {
        console.error('[db] Failed to initialize database:', err);
        process.exit(1);
    });
}

// ---------- EXPORT ----------
module.exports = app;
module.exports.initDatabase = initDatabase;