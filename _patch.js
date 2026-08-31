const fs = require('fs');
const path = require('path');

function patch(file, pattern, replacement, label) {
    const p = path.join(__dirname, file);
    const c = fs.readFileSync(p, 'utf8');
    const c2 = c.replace(pattern, replacement);
    if (c2 === c) {
        console.log('NO MATCH:', label);
    } else {
        fs.writeFileSync(p, c2);
        console.log('patched:', label);
    }
}

// ---------- profile.html ----------
const profileNew = `        document.addEventListener('DOMContentLoaded', function() {
            const session = JSON.parse(localStorage.getItem('aiHeritageSession')) ||
                           JSON.parse(sessionStorage.getItem('aiHeritageSession'));

            const guestContent = document.getElementById('guestContent');
            const userContent = document.getElementById('userContent');
            const activityContent = document.getElementById('activityContent');

            function showGuest() {
                guestContent.style.display = 'block';
                userContent.style.display = 'none';
                activityContent.style.display = 'none';
            }

            if (!session || !session.token || !session.user) {
                showGuest();
                return;
            }

            fetch('/api/me', { headers: { 'Authorization': 'Bearer ' + session.token } })
            .then(res => res.json())
            .then(data => {
                if (!data.success) throw new Error('invalid');
                const user = data.user;
                document.getElementById('profileName').textContent = user.name;
                document.getElementById('profileEmail').textContent = user.email;
                document.getElementById('profileJoined').textContent = user.joined ? new Date(user.joined).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '-';
                loadActivity(session.token, user.email);
                guestContent.style.display = 'none';
                userContent.style.display = 'block';
                activityContent.style.display = 'block';
            })
            .catch(() => showGuest());
        });

        function loadActivity(token, email) {
            fetch('/api/activity', { headers: { 'Authorization': 'Bearer ' + token } })
            .then(res => res.json())
            .then(data => {
                const userLogs = (data.success ? data.activities : []);
                const activityList = document.getElementById('activityList');
                document.getElementById('profileActions').textContent = userLogs.length;

                if (userLogs.length === 0) {
                    activityList.innerHTML = \`<p style="color:#999; text-align:center; padding:2rem 0;">
                        <i class="fas fa-inbox" style="font-size:2rem; display:block; margin-bottom:1rem;"></i>
                        No activity yet. Start by uploading an image!
                    </p>\`;
                    return;
                }

                const icons = {
                    login: 'fa-sign-in-alt',
                    register: 'fa-user-plus',
                    upload: 'fa-upload',
                    analyze: 'fa-robot',
                    report: 'fa-file-pdf',
                    database: 'fa-database',
                    dashboard: 'fa-home',
                    logout: 'fa-sign-out-alt'
                };

                let html = '';
                userLogs.forEach(log => {
                    const time = new Date(log.timestamp);
                    const timeStr = time.toLocaleString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
                    });
                    const icon = icons[log.action] || 'fa-circle';
                    html += \`<div class="activity-item">
                        <div class="icon"><i class="fas \${icon}"></i></div>
                        <div class="details">
                            <div class="action">\${log.details}</div>
                            <div class="time">\${timeStr}</div>
                        </div>
                        <span class="badge \${log.action}">\${log.action}</span>
                    </div>\`;
                });
                activityList.innerHTML = html;
            })
            .catch(() => {});
        }

        function logoutUser() {
            const session = JSON.parse(localStorage.getItem('aiHeritageSession')) ||
                           JSON.parse(sessionStorage.getItem('aiHeritageSession'));
            if (session && session.token) {
                fetch('/api/logout', { method: 'POST', headers: { 'Authorization': 'Bearer ' + session.token } }).catch(() => {});
            }
            localStorage.removeItem('aiHeritageSession');
            sessionStorage.removeItem('aiHeritageSession');
            window.location.href = 'login.html';
        }
`;
const profileRegex = /document\.addEventListener\('DOMContentLoaded', function\(\) \{[\s\S]*?\n        \}\n\n        console\.log/;
patch('profile.html', profileRegex, profileNew + '\n        console.log', 'profile.html');

// ---------- dashboard.html ----------
const dashboardNew = `        // ---------- CHECK SESSION ----------
        document.addEventListener('DOMContentLoaded', () => {
            const session = JSON.parse(localStorage.getItem('aiHeritageSession')) || 
                           JSON.parse(sessionStorage.getItem('aiHeritageSession'));

            if (!session || !session.token || !session.user) {
                window.location.href = 'login.html';
                return;
            }

            const user = session.user;

            document.getElementById('userNameDisplay').textContent = user.name;
            document.getElementById('userDisplayName').textContent = user.name;
            document.getElementById('userDisplayEmail').textContent = user.email;
            document.getElementById('userAvatar').textContent = user.name ? user.name.charAt(0).toUpperCase() : 'U';

            loadUserActivity(session.token);
            loadUserStats(session.token);

            logAction('dashboard', 'Viewed dashboard');
        });

        // ---------- LOAD USER ACTIVITY ----------
        function loadUserActivity(token) {
            fetch('/api/activity', { headers: { 'Authorization': 'Bearer ' + token } })
            .then(res => res.json())
            .then(data => {
                const userLogs = (data.success ? data.activities : []).slice().reverse();
                renderActivityList(userLogs);
                return userLogs;
            })
            .catch(() => renderActivityList([]));
        }

        function renderActivityList(userLogs) {
            const activityList = document.getElementById('activityList');

            if (userLogs.length === 0) {
                activityList.innerHTML = \`<p style="color:#999; text-align:center; padding:2rem 0;">
                    <i class="fas fa-inbox" style="font-size:2rem; display:block; margin-bottom:1rem;"></i>
                    No activity yet. Start by uploading an image!
                </p>\`;
                return;
            }

            const icons = {
                login: 'fa-sign-in-alt',
                register: 'fa-user-plus',
                upload: 'fa-upload',
                analyze: 'fa-robot',
                report: 'fa-file-pdf',
                database: 'fa-database',
                dashboard: 'fa-home',
                logout: 'fa-sign-out-alt'
            };

            let html = '';
            userLogs.forEach(log => {
                const time = new Date(log.timestamp);
                const timeStr = time.toLocaleString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
                });
                const icon = icons[log.action] || 'fa-circle';
                html += \`<div class="activity-item">
                    <div class="icon"><i class="fas \${icon}"></i></div>
                    <div class="details">
                        <div class="action">\${log.details}</div>
                        <div class="time">\${timeStr}</div>
                    </div>
                    <span class="badge \${log.action}">\${log.action}</span>
                </div>\`;
            });

            activityList.innerHTML = html;
        }

        // ---------- LOAD USER STATS ----------
        function loadUserStats(token) {
            fetch('/api/activity', { headers: { 'Authorization': 'Bearer ' + token } })
            .then(res => res.json())
            .then(data => {
                const logs = data.success ? data.activities : [];
                const total = logs.length;
                const uploads = logs.filter(l => l.action === 'upload').length;
                const analyses = logs.filter(l => l.action === 'analyze').length;
                const reports = logs.filter(l => l.action === 'report').length;

                document.getElementById('totalActions').textContent = total;
                document.getElementById('totalUploads').textContent = uploads;
                document.getElementById('totalAnalyses').textContent = analyses;
                document.getElementById('totalReports').textContent = reports;
            })
            .catch(() => {});
        }

        // ---------- LOG USER ACTION ----------
        function logAction(action, details) {
            const session = JSON.parse(localStorage.getItem('aiHeritageSession')) || 
                           JSON.parse(sessionStorage.getItem('aiHeritageSession'));
            if (!session || !session.token) return;
            fetch('/api/log', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + session.token },
                body: JSON.stringify({ action: action, details: details })
            })
            .then(() => {
                loadUserActivity(session.token);
                loadUserStats(session.token);
            })
            .catch(() => {});
        }

        // ---------- LOGOUT ----------
        function logout() {
            const session = JSON.parse(localStorage.getItem('aiHeritageSession')) || 
                           JSON.parse(sessionStorage.getItem('aiHeritageSession'));

            if (session && session.token) {
                fetch('/api/logout', { method: 'POST', headers: { 'Authorization': 'Bearer ' + session.token } })
                .catch(() => {});
            }

            localStorage.removeItem('aiHeritageSession');
            sessionStorage.removeItem('aiHeritageSession');
            
            window.location.href = 'login.html';
        }
`;
const dashRegex = /\/\/ ---------- CHECK SESSION ----------\r?\n[\s\S]*?\r?\n        \}\r?\n\r?\n        \/\/ ---------- NAVIGATION ----------/;
patch('dashboard.html', dashRegex, dashboardNew + '\n        // ---------- NAVIGATION ----------', 'dashboard.html');
