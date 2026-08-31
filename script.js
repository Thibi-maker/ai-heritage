// ---------- NAVIGATION ----------
const header = document.getElementById('header');
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');

// Scroll effect
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        if (header) header.classList.add('scrolled');
    } else {
        if (header) header.classList.remove('scrolled');
    }
});

// Mobile menu toggle
if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });
}

// Close menu on link click (mobile)
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
        if (navMenu) navMenu.classList.remove('active');
    });
});

// ---------- SMOOTH SCROLL ----------
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            e.preventDefault();
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ---------- COUNTER ANIMATION (for stats) ----------
const statNumbers = document.querySelectorAll('.stat-item .number');
const statSection = document.querySelector('.statistics');

let animated = false;

function animateNumbers() {
    statNumbers.forEach(stat => {
        const text = stat.textContent;
        const num = parseInt(text.replace(/[^0-9]/g, ''));
        if (!isNaN(num)) {
            let current = 0;
            const increment = Math.ceil(num / 60);
            const interval = setInterval(() => {
                current += increment;
                if (current >= num) {
                    current = num;
                    clearInterval(interval);
                }
                stat.textContent = current + (text.includes('+') ? '+' : '');
            }, 30);
        }
    });
}

// Intersection Observer for stats
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !animated) {
            animated = true;
            animateNumbers();
        }
    });
});

if (statSection) {
    observer.observe(statSection);
}

// ---------- INTERSECTION OBSERVER FOR ANIMATIONS ----------
const animateElements = (entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in-up');
            entry.target.style.opacity = '1';
        }
    });
};

const animationObserver = new IntersectionObserver(animateElements, {
    threshold: 0.1
});

// Observe elements for animation
document.querySelectorAll('.feature-card, .step, .stat-item, .gallery-card, .testimonial-card, .database-card, .security-card, .about-grid > *').forEach(el => {
    el.style.opacity = '0';
    animationObserver.observe(el);
});

// ---------- CONSOLE WELCOME ----------
console.log('🏛️ AI Heritage - Preserving Legacy with AI');
console.log('🚀 Built with ❤️ for cultural preservation');
console.log('✨ Clean & Modern Design with Smooth Animations');

// ---------- FEATURE CARD CLICK ----------
document.querySelectorAll('.feature-card, .gallery-card').forEach(card => {
    card.addEventListener('click', function() {
        this.style.transition = 'all 0.15s ease';
        this.style.transform = 'scale(0.97)';
        setTimeout(() => {
            this.style.transform = '';
        }, 150);
    });
});

// ---------- KEYBOARD SHORTCUTS ----------
document.addEventListener('keydown', (e) => {
    if (e.altKey && e.key === 'h') {
        window.location.href = 'index.html';
    }
    if (e.altKey && e.key === 'u') {
        window.location.href = 'upload.html';
    }
    if (e.altKey && e.key === 'd') {
        window.location.href = 'dashboard.html';
    }
    if (e.key === 'Escape' && navMenu && navMenu.classList.contains('active')) {
        navMenu.classList.remove('active');
    }
});

console.log('⌨️ Keyboard Shortcuts: Alt+H (Home), Alt+U (Upload), Alt+D (Dashboard)');

// ---------- PREVENT DEFAULT FOR EMPTY LINKS ----------
document.querySelectorAll('a[href="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
    });
});

// ---------- HOVER PARALLAX EFFECT ----------
document.querySelectorAll('.hero-image-container, .gallery-image').forEach(el => {
    el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;
        el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });
    
    el.addEventListener('mouseleave', () => {
        el.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
    });
});

// ---------- GALLERY IMAGE PLACEHOLDER COLORS ----------
document.querySelectorAll('.gallery-image').forEach((el, index) => {
    const colors = [
        'linear-gradient(145deg, #8B7355, #6B5340)',
        'linear-gradient(145deg, #A0522D, #8B4513)',
        'linear-gradient(145deg, #C4A882, #B8956A)',
        'linear-gradient(145deg, #7B6B5A, #5C4E3A)',
        'linear-gradient(145deg, #8B7D6B, #6B5D4B)',
        'linear-gradient(145deg, #7B6B5A, #5C4E3A)'
    ];
    if (colors[index]) {
        el.style.background = colors[index];
    }
});

// ---------- TYPING EFFECT FOR HERO SUBTITLE ----------
document.addEventListener('DOMContentLoaded', () => {
    const heroP = document.querySelector('.hero-content p');
    if (heroP) {
        const text = heroP.textContent;
        heroP.textContent = '';
        let i = 0;
        const typeInterval = setInterval(() => {
            if (i < text.length) {
                heroP.textContent += text.charAt(i);
                i++;
            } else {
                clearInterval(typeInterval);
            }
        }, 30);
    }
});

// ---------- LOGIN FORM HANDLER ----------
function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (email && password) {
        alert('✅ Login successful! Welcome back, ' + email);
        window.location.href = 'dashboard.html';
    } else {
        alert('⚠️ Please fill in all fields');
    }
}

// ---------- REGISTER FORM HANDLER ----------
function handleRegister(event) {
    event.preventDefault();
    const fullname = document.getElementById('fullname').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirm = document.getElementById('confirmPassword').value;

    if (!fullname || !email || !password || !confirm) {
        alert('⚠️ Please fill in all fields');
        return;
    }

    if (password !== confirm) {
        alert('⚠️ Passwords do not match');
        return;
    }

    if (password.length < 8) {
        alert('⚠️ Password must be at least 8 characters');
        return;
    }

    alert('✅ Registration successful! Welcome, ' + fullname);
    window.location.href = 'dashboard.html';
}

// ---------- PASSWORD STRENGTH CHECKER ----------
function checkPasswordStrength(password) {
    const bar = document.getElementById('passwordBar');
    if (!bar) return;
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[^a-zA-Z0-9]/)) strength++;

    bar.className = 'bar';
    if (strength <= 1) {
        bar.classList.add('weak');
    } else if (strength === 2) {
        bar.classList.add('medium');
    } else if (strength >= 3) {
        bar.classList.add('strong');
    }
}

// ---------- UPLOAD FILE HANDLER ----------
function handleFileSelect(event) {
    const file = event.target.files[0] || document.getElementById('fileInput').files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        document.getElementById('previewImage').src = e.target.result;
        document.getElementById('fileName').textContent = file.name;
        
        const sizeKB = (file.size / 1024).toFixed(1);
        document.getElementById('fileSize').textContent = sizeKB > 1024 ? (sizeKB / 1024).toFixed(1) + ' MB' : sizeKB + ' KB';
        
        const img = new Image();
        img.onload = function() {
            document.getElementById('fileDimensions').textContent = img.width + ' x ' + img.height + ' px';
        };
        img.src = e.target.result;
        
        document.getElementById('previewContainer').classList.add('active');
        document.getElementById('analyzeBtn').disabled = false;
    };
    reader.readAsDataURL(file);
}

// ---------- ANALYZE IMAGE ----------
function analyzeImage() {
    const analyzeBtn = document.getElementById('analyzeBtn');
    const progressContainer = document.getElementById('progressContainer');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    
    analyzeBtn.disabled = true;
    progressContainer.classList.add('active');
    
    const statuses = [
        'Loading AI model...',
        'Scanning for damage patterns...',
        'Analyzing structural integrity...',
        'Detecting cracks and erosion...',
        'Generating comprehensive report...'
    ];
    
    let progress = 0;
    let statusIndex = 0;
    
    const interval = setInterval(() => {
        progress += Math.random() * 8 + 2;
        if (progress > 100) progress = 100;
        
        progressFill.style.width = progress + '%';
        
        if (statusIndex < statuses.length) {
            progressText.textContent = statuses[statusIndex];
            statusIndex++;
        }
        
        if (progress >= 100) {
            clearInterval(interval);
            progressText.textContent = '✅ Analysis complete! Redirecting to results...';
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
        }
    }, 400);
}

// ---------- GENERATE PDF REPORT ----------
function generatePDF() {
    const btn = document.querySelector('.btn-download');
    if (!btn) return;
    
    alert('✅ PDF Report is being generated!\n\nYour comprehensive preservation report will be downloaded shortly.');
    
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
    btn.disabled = true;
    
    setTimeout(() => {
        btn.innerHTML = '<i class="fas fa-check"></i> Report Downloaded!';
        btn.style.background = '#28a745';
        setTimeout(() => {
            btn.innerHTML = '<i class="fas fa-file-pdf"></i> Download PDF Report';
            btn.style.background = '';
            btn.disabled = false;
        }, 2000);
    }, 2000);
}

// ---------- DRAG AND DROP UPLOAD ----------
const uploadBox = document.getElementById('uploadBox');
if (uploadBox) {
    uploadBox.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadBox.classList.add('dragover');
    });

    uploadBox.addEventListener('dragleave', () => {
        uploadBox.classList.remove('dragover');
    });

    uploadBox.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadBox.classList.remove('dragover');
        if (e.dataTransfer.files.length) {
            const input = document.getElementById('fileInput');
            input.files = e.dataTransfer.files;
            handleFileSelect(e);
        }
    });
}

console.log('✅ AI Heritage fully loaded!');