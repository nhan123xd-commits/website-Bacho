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
    }).catch(err => console.error("Error loading header/footer. Are you running on a local server?", err));

    // === 3. Canvas Background (CẬP NHẬT: Hiệu ứng đẹp hơn, màu Đỏ/Vàng) ===
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

        // Lấy màu từ CSS variables để đồng bộ
        const redColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim();
        const goldColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim();

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 3 + 1; // Kích thước hạt
                this.speedX = (Math.random() - 0.5) * 0.5; // Tốc độ ngang nhẹ
                this.speedY = Math.random() * 0.8 + 0.2; // Tốc độ rơi nhẹ
                
                // Ngẫu nhiên chọn màu đỏ hoặc vàng
                this.color = Math.random() > 0.5 ? redColor : goldColor;
                this.opacity = Math.random() * 0.4 + 0.1; // Độ mờ ngẫu nhiên
            }
            update() {
                this.y += this.speedY;
                this.x += this.speedX;
                
                // Nếu rơi hết màn hình, quay lại đỉnh
                if (this.y > canvas.height) { 
                    this.y = -10; 
                    this.x = Math.random() * canvas.width; 
                }
                
                // Giữ hạt trong biên ngang
                if (this.x > canvas.width || this.x < 0) {
                    this.speedX = -this.speedX;
                }
            }
            draw() {
                ctx.globalAlpha = this.opacity; // Thiết lập độ mờ
                ctx.fillStyle = this.color;
                ctx.beginPath();
                // Vẽ hình tròn
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1; // Reset độ mờ
            }
        }

        // Tạo 80 hạt trôi nổi
        for (let i = 0; i < 80; i++) particles.push(new Particle());

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
    updateThemeIcon(themeToggle, currentTheme);

    themeToggle.addEventListener('click', () => {
        let theme = document.documentElement.getAttribute('data-theme');
        let newTheme = theme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(themeToggle, newTheme);
    });

    function updateThemeIcon(btn, theme) {
        btn.textContent = theme === 'dark' ? '☀️' : '🌓';
    }

    // 5. Scroll Reveal
    const reveals = document.querySelectorAll('.reveal');
    function reveal() {
        let windowHeight = window.innerHeight;
        let elementVisible = 80; // Nhạy hơn
        reveals.forEach(rev => {
            let elementTop = rev.getBoundingClientRect().top;
            if (elementTop < windowHeight - elementVisible) {
                rev.classList.add('active');
            }
        });
    }
    window.addEventListener('scroll', reveal);
    reveal(); // Chạy ngay khi tải

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
    
    const images = document.querySelectorAll('.gallery-img, .milestone-img'); // Thêm milestone-img vào lightbox
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

    // 8. Search Functionality (Lọc các thẻ và đoạn văn)
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        
        // Lọc trong các đoạn văn của .content-section
        document.querySelectorAll('.content-section p').forEach(p => {
            p.style.display = p.textContent.toLowerCase().includes(term) ? 'block' : 'none';
        });

        // Lọc các thẻ cột mốc trên trang cotmoc.html
        document.querySelectorAll('.milestone-card').forEach(card => {
            const text = card.textContent.toLowerCase();
            card.style.display = text.includes(term) ? 'block' : 'none';
        });
    });

    // 9. Typing Effect (for Index page only)
    const typingElement = document.getElementById('typing-text');
    if (typingElement) {
        const textArray = ["Bắt đầu từ một người yêu nước...", "Trở thành chiến sĩ cộng sản vĩ đại.", "Người tìm ra con đường cứu nước."];
        let textIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        let typeSpeed = 100;

        function typeWriter() {
            const currentText = textArray[textIndex];
            
            if (isDeleting) {
                typingElement.innerHTML = currentText.substring(0, charIndex - 1);
                charIndex--;
                typeSpeed = 50;
            } else {
                typingElement.innerHTML = currentText.substring(0, charIndex + 1);
                charIndex++;
                typeSpeed = 100;
            }

            if (!isDeleting && charIndex === currentText.length) {
                isDeleting = true;
                typeSpeed = 2000; // Nghỉ khi gõ xong
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                textIndex = (textIndex + 1) % textArray.length;
                typeSpeed = 500; // Nghỉ trước khi gõ câu mới
            }

            setTimeout(typeWriter, typeSpeed);
        }
        setTimeout(typeWriter, 1500); // Khởi động
    }
}
