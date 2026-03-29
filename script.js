document.addEventListener('DOMContentLoaded', () => {
    // 1. Loading Screen
    setTimeout(() => {
        const loader = document.getElementById('loader');
        if(loader) {
            loader.style.opacity = '0';
            setTimeout(() => loader.style.display = 'none', 500);
        }
    }, 1000);

    // 2. Load Header & Footer dynamically
    Promise.all([
        fetch('header.html').then(res => res.text()),
        fetch('footer.html').then(res => res.text())
    ]).then(([headerHtml, footerHtml]) => {
        document.getElementById('header-placeholder').innerHTML = headerHtml;
        document.getElementById('footer-placeholder').innerHTML = footerHtml;
        initAppFeatures();
    });

    // 3. Canvas Background (Falling particles)
    const canvas = document.getElementById('bg-canvas');
    if(canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        
        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        window.addEventListener('resize', resize);
        resize();

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2 + 0.5;
                this.speedY = Math.random() * 0.5 + 0.1;
                this.speedX = (Math.random() - 0.5) * 0.3;
                this.opacity = Math.random() * 0.5 + 0.1;
            }
            update() {
                this.y += this.speedY;
                this.x += this.speedX;
                if (this.y > canvas.height) { this.y = 0; this.x = Math.random() * canvas.width; }
            }
            draw() {
                ctx.fillStyle = `rgba(150, 150, 150, ${this.opacity})`;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        for (let i = 0; i < 50; i++) particles.push(new Particle());

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => { p.update(); p.draw(); });
            requestAnimationFrame(animate);
        }
        animate();
    }
});

function initAppFeatures() {
    // 4. Dark Mode Toggle
    const themeToggle = document.getElementById('theme-toggle');
    const currentTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    themeToggle.textContent = currentTheme === 'dark' ? '☀️' : '🌓';

    themeToggle.addEventListener('click', () => {
        let theme = document.documentElement.getAttribute('data-theme');
        let newTheme = theme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        themeToggle.textContent = newTheme === 'dark' ? '☀️' : '🌓';
    });

    // 5. Scroll Reveal
    const reveals = document.querySelectorAll('.reveal');
    function reveal() {
        let windowHeight = window.innerHeight;
        let elementVisible = 100;
        reveals.forEach(rev => {
            let elementTop = rev.getBoundingClientRect().top;
            if (elementTop < windowHeight - elementVisible) {
                rev.classList.add('active');
            }
        });
    }
    window.addEventListener('scroll', reveal);
    reveal();

    // 6. Highlight Active Nav
    const currentPage = window.location.pathname.split("/").pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
    });

    // 7. Lightbox for Images
    const lightbox = document.createElement('div');
    lightbox.id = 'lightbox';
    lightbox.innerHTML = `<span id="lightbox-close">&times;</span><img src="" alt="Zoomed Image">`;
    document.body.appendChild(lightbox);
    
    const images = document.querySelectorAll('.gallery-img');
    const lightboxImg = lightbox.querySelector('img');
    
    images.forEach(img => {
        img.addEventListener('click', () => {
            lightbox.classList.add('active');
            lightboxImg.src = img.src;
        });
    });
    
    lightbox.addEventListener('click', (e) => {
        if(e.target !== lightboxImg) lightbox.classList.remove('active');
    });

    // 8. Search Functionality
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const paragraphs = document.querySelectorAll('.content-section p');
        paragraphs.forEach(p => {
            const text = p.textContent.toLowerCase();
            p.style.display = text.includes(term) ? 'block' : 'none';
            // Optional: highlight logic can be added here
        });
    });

    // 9. Typing Effect (for Index page only)
    const typingElement = document.getElementById('typing-text');
    if (typingElement) {
        const text = "Hành trình tìm đường cứu nước (1890 - 1920)";
        let i = 0;
        function typeWriter() {
            if (i < text.length) {
                typingElement.innerHTML += text.charAt(i);
                i++;
                setTimeout(typeWriter, 100);
            }
        }
        setTimeout(typeWriter, 1000);
    }
}
