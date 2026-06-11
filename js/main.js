document.addEventListener('DOMContentLoaded', () => {

    // Enhanced WhatsApp Float
    const waTooltip = document.querySelector('.whatsapp-tooltip');
    const waFloat = document.querySelector('.whatsapp-float');
    if (waTooltip && waFloat) {
        // Show tooltip after 3 seconds
        setTimeout(() => {
            waTooltip.style.opacity = '1';
            waTooltip.style.transform = 'translateY(-50%) translateX(0)';
            waTooltip.innerText = 'Need help with Japan Visa? Chat with us!';
            
            // Hide after 5 seconds
            setTimeout(() => {
                waTooltip.style.opacity = '0';
                waTooltip.style.transform = 'translateY(-50%) translateX(-10px)';
            }, 5000);
        }, 3000);

        // Pulse heavily when reaching the bottom of the page
        window.addEventListener('scroll', () => {
            if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 500) {
                waFloat.classList.add('heavy-pulse');
            } else {
                waFloat.classList.remove('heavy-pulse');
            }
        });
    }


    // Testimonial Carousel
    const track = document.getElementById('testimonialTrack');
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.carousel-dot');
    
    if (track && slides.length > 0) {
        let currentIndex = 0;
        let carouselInterval;

        window.goToSlide = function(index) {
            currentIndex = index;
            const offset = -currentIndex * 100;
            track.style.transform = `translateX(${offset}%)`;
            
            slides.forEach(s => s.classList.remove('active'));
            dots.forEach(d => d.classList.remove('active'));
            
            slides[currentIndex].classList.add('active');
            dots[currentIndex].classList.add('active');
            
            resetInterval();
        };

        function nextSlide() {
            let next = currentIndex + 1;
            if (next >= slides.length) next = 0;
            goToSlide(next);
        }

        function resetInterval() {
            clearInterval(carouselInterval);
            carouselInterval = setInterval(nextSlide, 5000);
        }

        resetInterval(); // Start auto-rotate
    }


    // Smooth Page Transitions
    document.querySelectorAll('a').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            const target = this.getAttribute('target');
            
            // Ignore if it's an anchor link, empty link, external blank target, or javascript
            if (!href || href.startsWith('#') || href.startsWith('javascript') || target === '_blank') return;
            
            // Allow default behavior for external links, but intercept internal HTML navigation
            if (href.endsWith('.html') || href === '/') {
                e.preventDefault();
                document.body.classList.add('page-transition-exit');
                
                setTimeout(() => {
                    window.location.href = href;
                }, 400); // Wait for CSS transition
            }
        });
    });


    // Referral Tracking
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    if (refCode) {
        localStorage.setItem('nn_referral_code', refCode);
    }

    // Mobile Menu Toggle
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            // Toggle hamburger icon between bars and times
            const icon = hamburger.querySelector('i');
            if (icon) {
                if (navLinks.classList.contains('active')) {
                    icon.classList.remove('fa-bars');
                    icon.classList.add('fa-times');
                } else {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        });
        
        // Close menu when clicking a link
        const links = navLinks.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                const icon = hamburger.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            });
        });
    }

    // Sticky Navbar with Glassmorphism
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Premium Fade-in & Slide Animations on Scroll
    const animatedElements = document.querySelectorAll('.animate');
    const appearOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const appearOnScroll = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('appear');
                if (!entry.target.classList.contains('repeat-animate')) {
                    observer.unobserve(entry.target);
                }
            } else {
                if (entry.target.classList.contains('repeat-animate')) {
                    entry.target.classList.remove('appear');
                }
            }
        });
    }, appearOptions);

    animatedElements.forEach(el => {
        appearOnScroll.observe(el);
    });


    // Global Cinematic 3D Parallax, Hero Orbs & Scroll Progress Bar
    const parallaxBg = document.querySelector('.parallax-bg');
    
    // Inject Scroll Progress Bar if it doesn't exist
    let progressBar = document.getElementById('scroll-progress');
    if (!progressBar) {
        progressBar = document.createElement('div');
        progressBar.id = 'scroll-progress';
        document.body.appendChild(progressBar);
    }
    
    let scrollY = window.scrollY;
    let ticking = false;
    let mouseX = 0;
    let mouseY = 0;

    function updateParallax() {
        const maxScroll = Math.max(1, document.body.scrollHeight - window.innerHeight);
        const scrollProgress = scrollY / maxScroll;
        
        if (parallaxBg) {
            const bgY = scrollProgress * -10; // Smooth vertical pan
            const scale = 1 + (scrollProgress * 0.05); // Subtle cinematic zoom
            parallaxBg.style.transform = `translate3d(0, ${bgY}%, 0) scale(${scale})`;
        }
        
        if (progressBar) {
            progressBar.style.width = `${scrollProgress * 100}%`;
        }
        
        const orbs = document.querySelectorAll('.hero-orb');
        orbs.forEach((orb, i) => {
            const scrollSpeed = i === 0 ? -100 : -200;
            const scrollOffset = scrollProgress * scrollSpeed;
            orb.style.transform = `translate3d(${mouseX}px, ${mouseY + scrollOffset}px, 0)`;
        });
        
        ticking = false;
    }

    document.addEventListener('mousemove', (e) => {
        mouseX = (window.innerWidth - e.pageX * 2) / 90;
        mouseY = (window.innerHeight - e.pageY * 2) / 90;
        if (!ticking) {
            window.requestAnimationFrame(updateParallax);
            ticking = true;
        }
    });

    window.addEventListener('scroll', () => {
        scrollY = window.scrollY;
        if (!ticking) {
            window.requestAnimationFrame(updateParallax);
            ticking = true;
        }
    });
    
    updateParallax();

    // --- Interactive & Conversion Features --- //

    // 1. Page Transition Animation
    document.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', (e) => {
            if (link.hostname === window.location.hostname && 
                !link.hash && 
                link.getAttribute('target') !== '_blank' && 
                link.href.indexOf('javascript:') === -1) {
                e.preventDefault();
                document.body.classList.add('page-exit');
                setTimeout(() => {
                    window.location.href = link.href;
                }, 400); // Wait 0.4s for transition to finish
            }
        });
    });

    // 2. 3D Card Tilt Effect
    // Apply to statically rendered cards
    function initTiltCards() {
        const tiltCards = document.querySelectorAll('.card, .bundle-card, .contact-card, .service-detail .service-icon');
        tiltCards.forEach(card => {
            // Avoid adding multiple listeners if re-initialized
            if(card.dataset.tiltInit) return;
            card.dataset.tiltInit = 'true';

            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left; // x position within the element
                const y = e.clientY - rect.top;  // y position within the element
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateX = ((y - centerY) / centerY) * -10; // Max 10 deg
                const rotateY = ((x - centerX) / centerX) * 10;
                
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
            });
        });
    }
    initTiltCards();
    // Expose globally so dynamic elements (like jobs) can initialize it
    window.initTiltCards = initTiltCards;

    // 3. Simple Frontend Analytics Tracker
    const trackClick = (eventName) => {
        try {
            let events = JSON.parse(localStorage.getItem('nn_analytics') || '[]');
            events.push({ event: eventName, timestamp: new Date().toISOString() });
            localStorage.setItem('nn_analytics', JSON.stringify(events));
            console.log(`[Analytics] Tracked: ${eventName}`);
        } catch(e) { }
    };

    document.querySelectorAll('.btn-primary').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const txt = e.target.innerText.trim().replace(/\s+/g, '_').toLowerCase();
            if(txt) trackClick(`clicked_btn_${txt}`);
        });
    });
    
    document.querySelectorAll('.whatsapp-float').forEach(btn => {
        btn.addEventListener('click', () => trackClick('clicked_whatsapp_float'));
    });
});
