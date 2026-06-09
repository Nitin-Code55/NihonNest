document.addEventListener('DOMContentLoaded', () => {
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
            if (!entry.isIntersecting) {
                return;
            } else {
                entry.target.classList.add('appear');
                observer.unobserve(entry.target);
            }
        });
    }, appearOptions);

    animatedElements.forEach(el => {
        appearOnScroll.observe(el);
    });

    // Handle all generic forms to show success message
    const forms = document.querySelectorAll('form:not(#calculator-form)');
    forms.forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const submitBtn = form.querySelector('button[type="submit"]');
            if(!submitBtn) return;
            const originalText = submitBtn.innerText;
            
            submitBtn.innerText = 'Sent Successfully! ✓';
            submitBtn.style.background = 'linear-gradient(135deg, #25D366 0%, #1EBE55 100%)';
            submitBtn.style.color = 'white';
            
            form.reset();
            
            setTimeout(() => {
                submitBtn.innerText = originalText;
                submitBtn.style.background = '';
                submitBtn.style.color = '';
            }, 3000);
        });
    });

    // Parallax effect for Hero Orbs
    document.addEventListener('mousemove', (e) => {
        const orbs = document.querySelectorAll('.hero-orb');
        const x = (window.innerWidth - e.pageX * 2) / 90;
        const y = (window.innerHeight - e.pageY * 2) / 90;

        orbs.forEach(orb => {
            orb.style.transform = `translateX(${x}px) translateY(${y}px)`;
        });
    });
});
