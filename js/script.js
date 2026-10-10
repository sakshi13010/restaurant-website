/**
 * La Belle Vie - COMPLETE ENHANCED JAVASCRIPT
 * Premium Animations + 3D Effects + Image Zoom + Loader + More
 */

document.addEventListener('DOMContentLoaded', function() {
    'use strict';

    // ========================================
    // 1. PAGE LOADER
    // ========================================
    const loader = document.createElement('div');
    loader.className = 'page-loader';
    loader.innerHTML = '<div class="loader-spinner"></div>';
    document.body.prepend(loader);

    setTimeout(() => {
        loader.classList.add('hidden');
    }, 1500);

    // ========================================
    // 2. NAVIGATION TOGGLE
    // ========================================
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('show');
        });
    }

    // ========================================
    // 3. NAVBAR SCROLL EFFECT
    // ========================================
    const navbar = document.getElementById('navbar');
    let lastScroll = 0;

    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        lastScroll = currentScroll;
    });

    // ========================================
    // 4. ENHANCED 3D SCROLL ANIMATIONS
    // ========================================
    const scrollElements = document.querySelectorAll(
        '.scroll-3d, .scroll-3d-left, .scroll-3d-right, .scroll-3d-scale, .scroll-3d-float, .scroll-3d-blur'
    );

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -30px 0px'
        });

        scrollElements.forEach(el => observer.observe(el));
    } else {
        scrollElements.forEach(el => el.classList.add('visible'));
    }

    // ========================================
    // 5. ADVANCED 3D TILT EFFECT (NO ROTATION ON IMAGES)
    // ========================================
    const tiltCards = document.querySelectorAll('.hover-3d, .country-card, .feature-card, .testimonial-card, .card, .dessert-card');

    tiltCards.forEach(card => {
        card.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;
            
            this.style.transition = 'none';
            this.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-12px) scale(1.04)`;
        });

        card.addEventListener('mouseleave', function() {
            this.style.transition = 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
            this.style.transform = 'perspective(1200px) rotateX(0) rotateY(0) translateY(0) scale(1)';
        });
    });

    // ========================================
    // 6. ENHANCED ANIMATED COUNTERS
    // ========================================
    const counters = document.querySelectorAll('.stat-number');

    const animateCounter = (element) => {
        const target = parseInt(element.getAttribute('data-count'), 10);
        const duration = 2500;
        const startTime = performance.now();

        const updateCounter = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(eased * target);

            element.textContent = current.toLocaleString();

            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = target.toLocaleString();
                element.style.animation = 'counterPulse 0.5s ease';
                setTimeout(() => {
                    element.style.animation = '';
                }, 500);
            }
        };

        requestAnimationFrame(updateCounter);
    };

    // Counter pulse animation
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
        @keyframes counterPulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.15); }
        }
    `;
    document.head.appendChild(styleSheet);

    if ('IntersectionObserver' in window) {
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    counterObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });

        counters.forEach(el => counterObserver.observe(el));
    } else {
        counters.forEach(el => animateCounter(el));
    }

    // ========================================
    // 7. GOOGLE TRANSLATE
    // ========================================
    function googleTranslateElementInit() {
        new google.translate.TranslateElement({
            pageLanguage: 'en',
            includedLanguages: 'en,es,fr,de,it,pt,ru,ja,zh,hi,ar',
            layout: google.translate.TranslateElement.InlineLayout.SIMPLE
        }, 'google_translate_element');
    }
    window.googleTranslateElementInit = googleTranslateElementInit;

    // ========================================
    // 8. ENHANCED TRANSLATION
    // ========================================
    const translateOptions = document.querySelectorAll('.translate-option');

    function changeLanguage(langCode) {
        showNotification('🌍 Translating... Please wait.', 'info');
        
        let attempts = 0;
        const maxAttempts = 30;
        
        const translateInterval = setInterval(function() {
            attempts++;
            const select = document.querySelector('.goog-te-combo');
            
            if (select) {
                select.value = langCode;
                select.dispatchEvent(new Event('change'));
                localStorage.setItem('selectedLanguage', langCode);
                clearInterval(translateInterval);
                showNotification('✅ Translation Complete!', 'success');
            } else if (attempts >= maxAttempts) {
                clearInterval(translateInterval);
                showNotification('⚠️ Please click the translate button again.', 'warning');
            }
        }, 400);
    }

    translateOptions.forEach(option => {
        option.addEventListener('click', function(e) {
            e.preventDefault();
            const lang = this.getAttribute('data-lang');
            changeLanguage(lang);
            
            translateOptions.forEach(opt => {
                opt.classList.remove('active');
                const check = opt.querySelector('.fa-check');
                if (check) check.style.display = 'none';
            });
            this.classList.add('active');
            const checkIcon = this.querySelector('.fa-check');
            if (checkIcon) checkIcon.style.display = 'inline';
        });
    });

    // Reset Language
    const resetBtn = document.getElementById('resetLanguage');
    if (resetBtn) {
        resetBtn.addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.removeItem('selectedLanguage');
            location.reload();
        });
    }

    // Auto-translate on page load
    const savedLang = localStorage.getItem('selectedLanguage');
    if (savedLang && savedLang !== 'en') {
        setTimeout(function() {
            changeLanguage(savedLang);
        }, 2500);
    }

    // ========================================
    // 9. ENHANCED NOTIFICATION SYSTEM
    // ========================================
    function showNotification(message, type = 'info') {
        const existingAlerts = document.querySelectorAll('.custom-notification');
        existingAlerts.forEach(el => el.remove());

        const colors = {
            info: '#2d3436',
            success: '#00b894',
            warning: '#fdcb6e',
            error: '#e17055'
        };

        const alertDiv = document.createElement('div');
        alertDiv.className = 'custom-notification';
        alertDiv.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            background: ${colors[type] || '#2d3436'};
            color: ${type === 'warning' ? '#2d3436' : 'white'};
            padding: 18px 30px;
            border-radius: 12px;
            font-size: 16px;
            z-index: 99999;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            animation: slideUpNotification 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
            max-width: 400px;
            font-family: 'Inter', sans-serif;
            white-space: pre-line;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.1);
        `;
        alertDiv.innerHTML = message;
        document.body.appendChild(alertDiv);

        setTimeout(() => {
            alertDiv.style.animation = 'slideDownNotification 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
            setTimeout(() => {
                alertDiv.remove();
            }, 600);
        }, 4500);
    }

    // Add notification animations
    const notifStyle = document.createElement('style');
    notifStyle.textContent = `
        @keyframes slideUpNotification {
            0% { transform: translateY(100px) scale(0.8); opacity: 0; }
            100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes slideDownNotification {
            0% { transform: translateY(0) scale(1); opacity: 1; }
            100% { transform: translateY(100px) scale(0.8); opacity: 0; }
        }
    `;
    document.head.appendChild(notifStyle);

    // ========================================
    // 10. VIRTUAL TOUR
    // ========================================
    window.openVirtualTour = function() {
        window.location.href = 'virtual-tour.html';
    };

    // ========================================
    // 11. AR MENU
    // ========================================
    window.openARMenu = function() {
        showNotification('📱 AR Menu Loading... Point your camera at the table!', 'info');
        setTimeout(() => {
            showNotification('🔄 AR Mode: Scan the QR code on your table to see 3D dishes!', 'info');
        }, 2000);
    };

    // ========================================
    // 12. AI RECOMMENDATION
    // ========================================
    window.getRecommendation = function() {
        const dishes = [
            '🍝 Truffle Pasta - Recommended for Pasta Lovers',
            '🥩 Wagyu Steak - Best for Meat Enthusiasts',
            '🍣 Fresh Sushi - Perfect for Seafood Fans',
            '🍕 Margherita Pizza - Classic Choice',
            '🍰 Tiramisu - For Dessert Lovers',
            '🍷 Italian Wine - Perfect Pairing',
            '🦞 Lobster Thermidor - Luxury Choice',
            '🌿 Vegan Bowl - Healthy Option'
        ];
        const random = dishes[Math.floor(Math.random() * dishes.length)];
        showNotification('🤖 AI Recommendation: ' + random + '\n\nTry this based on your preferences!', 'success');
    };

    // ========================================
    // 13. RESERVATION FORM
    // ========================================
    const reservationForm = document.getElementById('reservationForm');
    if (reservationForm) {
        reservationForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const name = document.getElementById('resName');
            const email = document.getElementById('resEmail');
            const date = document.getElementById('resDate');
            const guests = document.getElementById('resGuests');

            if (!name.value.trim() || !email.value.trim() || !date.value || !guests.value) {
                showNotification('⚠️ Please fill in all required fields.', 'warning');
                return;
            }

            const btn = this.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Booking...';
            btn.disabled = true;

            setTimeout(() => {
                showNotification(
                    '✅ Reservation Confirmed!\n\nThank you ' + name.value + '!\n' +
                    'Your table for ' + guests.value + ' is booked for ' + date.value + '.\n' +
                    'We look forward to serving you at La Belle Vie! 🍽️',
                    'success'
                );
                this.reset();
                btn.innerHTML = originalText;
                btn.disabled = false;
            }, 1500);
        });
    }

    // ========================================
    // 14. CONTACT FORM
    // ========================================
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const name = document.getElementById('contactName');
            const email = document.getElementById('contactEmail');
            const message = document.getElementById('contactMessage');

            if (!name.value.trim() || !email.value.trim() || !message.value.trim()) {
                showNotification('⚠️ Please fill in all fields.', 'warning');
                return;
            }

            const btn = this.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            btn.disabled = true;

            setTimeout(() => {
                showNotification(
                    '✅ Message Sent!\n\nThank you ' + name.value + '!\n' +
                    'We will get back to you within 24 hours.',
                    'success'
                );
                this.reset();
                btn.innerHTML = originalText;
                btn.disabled = false;
            }, 1500);
        });
    }

    // ========================================
    // 15. NEWSLETTER FORM
    // ========================================
    const newsletterForms = document.querySelectorAll('#newsletterForm');

    newsletterForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = this.querySelector('input[type="email"]');
            if (!email.value.trim()) {
                showNotification('⚠️ Please enter your email address.', 'warning');
                return;
            }

            const btn = this.querySelector('button');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            btn.disabled = true;

            setTimeout(() => {
                showNotification(
                    '✅ Subscribed!\n\nThank you for subscribing to La Belle Vie newsletter! 🎉',
                    'success'
                );
                email.value = '';
                btn.innerHTML = originalText;
                btn.disabled = false;
            }, 1000);
        });
    });

    // ========================================
    // 16. PARALLAX HERO
    // ========================================
    const hero = document.querySelector('.hero');
    if (hero) {
        window.addEventListener('scroll', function() {
            const scrolled = window.pageYOffset;
            if (scrolled < 600) {
                const heroContent = hero.querySelector('.hero-content');
                if (heroContent) {
                    heroContent.style.transform = `translateY(${scrolled * 0.15}px)`;
                    heroContent.style.opacity = 1 - (scrolled / 600);
                }
            }
        });
    }

    // ========================================
    // 17. SMOOTH SCROLL FOR ANCHOR LINKS
    // ========================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // ========================================
    // 18. IMAGE ZOOM ON SCROLL
    // ========================================
    const zoomImages = document.querySelectorAll('.image-zoom-in, .image-zoom-out, .image-slow-zoom');

    if ('IntersectionObserver' in window) {
        const zoomObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target.querySelector('img');
                    if (img) {
                        img.style.animation = 'imageReveal 1.2s ease-out';
                        setTimeout(() => {
                            img.style.animation = '';
                        }, 1200);
                    }
                }
            });
        }, { threshold: 0.1 });

        zoomImages.forEach(el => zoomObserver.observe(el));
    }

    // Image reveal animation
    const imgStyle = document.createElement('style');
    imgStyle.textContent = `
        @keyframes imageReveal {
            0% { transform: scale(0.8); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
        }
    `;
    document.head.appendChild(imgStyle);

    // ========================================
    // 19. MOUSE TRAILER EFFECT (Premium)
    // ========================================
    const trailer = document.createElement('div');
    trailer.className = 'mouse-trailer';
    trailer.style.cssText = `
        position: fixed;
        width: 40px;
        height: 40px;
        border: 2px solid #C9A96E;
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        transition: all 0.15s cubic-bezier(0.34, 1.56, 0.64, 1);
        background: radial-gradient(circle, rgba(201,169,110,0.1) 0%, transparent 70%);
        opacity: 0;
        transform: translate(-50%, -50%) scale(0.5);
    `;
    document.body.appendChild(trailer);

    let mouseX = 0, mouseY = 0;
    let trailerX = 0, trailerY = 0;

    document.addEventListener('mousemove', function(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
        trailer.style.opacity = '1';
        trailer.style.transform = 'translate(-50%, -50%) scale(1)';
    });

    function animateTrailer() {
        trailerX += (mouseX - trailerX) * 0.1;
        trailerY += (mouseY - trailerY) * 0.1;
        trailer.style.left = trailerX + 'px';
        trailer.style.top = trailerY + 'px';
        requestAnimationFrame(animateTrailer);
    }
    animateTrailer();

    // Hide trailer on touch devices
    if ('ontouchstart' in window) {
        trailer.style.display = 'none';
    }

    // ========================================
    // 20. PARALLAX FOR COUNTRY HERO
    // ========================================
    const countryHero = document.querySelector('.country-hero');
    if (countryHero) {
        window.addEventListener('scroll', function() {
            const scrolled = window.pageYOffset;
            if (scrolled < 500) {
                const heroContent = countryHero.querySelector('.container');
                if (heroContent) {
                    heroContent.style.transform = `translateY(${scrolled * 0.1}px)`;
                }
            }
        });
    }

    // ========================================
    // 21. DESSERT CARD 3D TILT
    // ========================================
    const dessertCards = document.querySelectorAll('.dessert-card');
    
    dessertCards.forEach(card => {
        card.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;
            
            this.style.transition = 'none';
            this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px) scale(1.03)`;
        });

        card.addEventListener('mouseleave', function() {
            this.style.transition = 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
            this.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0) scale(1)';
        });
    });

    // ========================================
    // 22. CONSOLE WELCOME
    // ========================================
    console.log('%c🍽️ La Belle Vie Restaurant', 'font-size: 32px; font-weight: bold; color: #C9A96E;');
    console.log('%c✨ Premium Fine Dining Experience', 'font-size: 18px; color: #722F37;');
    console.log('%c🌟 Features: 3D Scroll • Image Zoom • AR Menu • AI Recommendations • Translation', 'font-size: 14px; color: #6b6b6b;');

    console.log('🚀 Website Loaded Successfully!');
});