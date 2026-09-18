// ============================================
// AVATAR ONLY - Clean Circle Avatar
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Get user from session
    let user = null;
    try {
        const session = localStorage.getItem('aiHeritageSession') || sessionStorage.getItem('aiHeritageSession');
        user = session ? JSON.parse(session) : null;
    } catch(e) {}

    const loginBtn = document.querySelector('.btn-login');
    const registerBtn = document.querySelector('.btn-register');
    const navActions = document.querySelector('.nav-actions');

    if (user && navActions) {
        // Hide login/register buttons
        if (loginBtn) {
            loginBtn.style.display = 'none';
            loginBtn.style.visibility = 'hidden';
        }
        if (registerBtn) {
            registerBtn.style.display = 'none';
            registerBtn.style.visibility = 'hidden';
        }
        
        // Check if avatar already exists, if not create it
        let avatarDiv = document.getElementById('userAvatarDiv');
        if (!avatarDiv) {
            avatarDiv = document.createElement('div');
            avatarDiv.id = 'userAvatarDiv';
            avatarDiv.style.cssText = 'display:flex; align-items:center; gap:0.8rem;';
            
            // Get initials
            let initials = 'U';
            if (user.name) {
                const nameParts = user.name.trim().split(' ');
                if (nameParts.length >= 2) {
                    initials = (nameParts[0].charAt(0) + nameParts[1].charAt(0)).toUpperCase();
                } else {
                    initials = user.name.charAt(0).toUpperCase();
                }
            } else if (user.email) {
                initials = user.email.charAt(0).toUpperCase();
            }
            
            avatarDiv.innerHTML = `
                <div style="display:flex; flex-direction:column; align-items:center; gap:0.2rem;">
                    <div style="width:40px; height:40px; border-radius:50%; background:linear-gradient(135deg, #1a2e3f, #2c4a5f); color:#fff; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:1.1rem; border:2px solid #d4af37; box-shadow: 0 2px 8px rgba(0,0,0,0.15);">
                        ${initials}
                    </div>
                    <span style="font-size:0.65rem; color:#1a2e3f; font-weight:600; max-width:50px; text-align:center; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
                        ${user.name ? user.name.split(' ')[0] : 'User'}
                    </span>
                </div>
                <button onclick="logoutUser()" style="padding:0.35rem 1rem; background:transparent; color:#dc3545; border:2px solid #dc3545; border-radius:50px; font-weight:600; cursor:pointer; font-size:0.75rem; font-family:'Inter',sans-serif; transition:all 0.3s ease;" 
                        onmouseover="this.style.background='#dc3545'; this.style.color='#fff';" 
                        onmouseout="this.style.background='transparent'; this.style.color='#dc3545';">
                    <i class="fas fa-sign-out-alt"></i> Logout
                </button>
            `;
            navActions.appendChild(avatarDiv);
        }
    } else {
        // If no user, show login/register
        if (loginBtn) {
            loginBtn.style.display = 'inline-block';
            loginBtn.style.visibility = 'visible';
        }
        if (registerBtn) {
            registerBtn.style.display = 'inline-block';
            registerBtn.style.visibility = 'visible';
        }
    }
});

function logoutUser() {
    localStorage.removeItem('aiHeritageSession');
    sessionStorage.removeItem('aiHeritageSession');
    window.location.href = 'login.html';
}

console.log('✅ Avatar Only (No Email) loaded!');