/* ═══════════════════════════════════════════════════════════════
   NICU GLOGOGEANU — JavaScript Interactions
   Scroll animations, navigation, lightbox gallery, parallax
   ═══════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

    // ── Navigation: Scroll Effect ──
    const nav = document.querySelector('.nav');
    const navLinks = document.querySelectorAll('.nav__link');

    function handleNavScroll() {
        if (window.scrollY > 60) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    }

    window.addEventListener('scroll', handleNavScroll, { passive: true });
    handleNavScroll();

    // ── Mobile Menu ──
    const hamburger = document.querySelector('.nav__hamburger');
    const mobileMenu = document.querySelector('.nav__menu');

    if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            mobileMenu.classList.toggle('open');
            document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
        });

        // Close menu on link click
        mobileMenu.querySelectorAll('.nav__link, .nav__cta').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                mobileMenu.classList.remove('open');
                document.body.style.overflow = '';
            });
        });
    }

    // ── Scroll Reveal Animations ──
    const revealElements = document.querySelectorAll('.reveal, .reveal--left, .reveal--right, .reveal--scale');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // ── Staggered Reveal for Grid Children ──
    const staggerContainers = document.querySelectorAll('.stagger-children');

    staggerContainers.forEach(container => {
        const children = container.querySelectorAll('.reveal');
        children.forEach((child, index) => {
            child.style.setProperty('--i', index);
        });
    });

    // ── Counter Animation ──
    const counters = document.querySelectorAll('[data-counter]');

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => counterObserver.observe(counter));

    function animateCounter(el) {
        const target = parseInt(el.getAttribute('data-counter'));
        const suffix = el.getAttribute('data-suffix') || '';
        const duration = 2000;
        const start = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
            const current = Math.floor(eased * target);

            el.textContent = current + suffix;

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }

        requestAnimationFrame(update);
    }

    // ── Dynamic Gallery Loader ──
    const albumGrid = document.querySelector('.album-grid[data-category]');
    const albumCountDisplay = document.querySelector('.album-info__count');

    if (albumGrid) {
        albumGrid.innerHTML = '<div style="color:var(--text-muted); padding:40px;">Se încarcă fotografiile...</div>';
        const category = albumGrid.getAttribute('data-category');

        fetch(`gallery-api.php?cat=${category}`)
            .then(res => {
                if (!res.ok || !res.headers.get('content-type').includes('application/json')) {
                    throw new Error('Not running on PHP server');
                }
                return res.json();
            })
            .then(data => {
                if (data.images && data.images.length > 0) {
                    renderGallery(data.images, category);
                } else {
                    fallbackLocalLoad(category);
                }
            })
            .catch(() => {
                fallbackLocalLoad(category);
            });
    }

    function fallbackLocalLoad(category) {
        let images = [];
        let index = 1;

        function tryLoad() {
            // Nu limităm la 25, mergem până ne dă eroare o imagine ca să știm că s-au terminat pozele
            if (index > 150) {
                renderGallery(images, category);
                return;
            }

            const src = `images/${category}/${index}.jpg`;
            const img = new Image();

            img.onload = () => {
                images.push(`${index}.jpg`);
                index++;
                tryLoad();
            };

            img.onerror = () => {
                // Ne oprim din încărcare la prima fisură, înseamnă că nu mai sunt poze secvențiale
                renderGallery(images, category);
            };

            img.src = src;
        }

        tryLoad();
    }

    function renderGallery(images, category) {
        // Update the count text dynamically based on how many images were actually found
        if (albumCountDisplay) {
            const categoryNameCapitalized = category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, ' ');
            albumCountDisplay.innerHTML = `Album <strong>${categoryNameCapitalized}</strong> &mdash; ${images.length} fotografii`;
        }
        let html = '';
        let swiperHtml = '';

        if (images.length === 0) {
            html = '<div style="color:var(--text-muted); padding:40px;">Nu s-au găsit fotografii în folder.</div>';
        } else {
            // Skip the first image (index 0) as it is used for the page hero
            const galleryImages = images.slice(1);
            galleryImages.forEach((imgFile, i) => {
                const num = (i + 1).toString().padStart(2, '0');
                const imgSrc = `images/${category}/${imgFile}`;

                // For gallery grid
                html += `
                    <div class="album-card reveal">
                        <img src="${imgSrc}" alt="${category} foto" loading="lazy">
                        <div class="album-card__overlay"><span><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="icon"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" /></svg></span></div>
                    </div>
                `;

                // For swiper slider
                swiperHtml += `
                    <div class="swiper-slide">
                        <img src="${imgSrc}" alt="${category} slider image" loading="lazy">
                    </div>
                `;
            });
        }
        albumGrid.innerHTML = html;

        // Populate and init Swiper
        const swiperWrapper = document.getElementById('portfolioSwiperWrapper');
        if (swiperWrapper) {
            swiperWrapper.innerHTML = swiperHtml;
            if (typeof Swiper !== 'undefined') {
                new Swiper('.portfolio-swiper', {
                    loop: images.length > 1,
                    grabCursor: true,
                    navigation: {
                        nextEl: '.swiper-button-next',
                        prevEl: '.swiper-button-prev',
                    },
                    pagination: {
                        el: '.swiper-pagination',
                        clickable: true,
                    },
                });
            }
        }

        const newReveals = albumGrid.querySelectorAll('.reveal');
        newReveals.forEach((el, idx) => {
            el.style.setProperty('--i', idx);
            revealObserver.observe(el);
        });
    }

    // ── Lightbox Gallery ──
    const lightbox = document.querySelector('.lightbox');
    const lightboxImg = document.querySelector('.lightbox__img');
    const lightboxClose = document.querySelector('.lightbox__close');
    const lightboxPrev = document.querySelector('.lightbox__nav--prev');
    const lightboxNext = document.querySelector('.lightbox__nav--next');

    let currentImageIndex = 0;
    let galleryImages = [];

    // Global click listener for opening lightbox via Event Delegation
    document.addEventListener('click', (e) => {
        const item = e.target.closest('.gallery__item, .album-card');
        if (item && lightbox) {
            // Re-query fresh list of possible items
            const galleryItems = document.querySelectorAll('.gallery__item, .album-card');
            galleryImages = Array.from(galleryItems).map(el => {
                const img = el.querySelector('img');
                return img ? img.src : '';
            });

            currentImageIndex = Array.from(galleryItems).indexOf(item);
            if (currentImageIndex !== -1) {
                openLightbox();
            }
        }
    });

    if (lightbox) {
        // Close
        lightboxClose.addEventListener('click', closeLightbox);
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });

        // Navigation
        lightboxPrev.addEventListener('click', (e) => {
            e.stopPropagation();
            if (galleryImages.length > 0) {
                currentImageIndex = (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
                updateLightbox();
            }
        });

        lightboxNext.addEventListener('click', (e) => {
            e.stopPropagation();
            if (galleryImages.length > 0) {
                currentImageIndex = (currentImageIndex + 1) % galleryImages.length;
                updateLightbox();
            }
        });

        // Keyboard nav
        document.addEventListener('keydown', (e) => {
            if (!lightbox.classList.contains('active')) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') {
                currentImageIndex = (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
                updateLightbox();
            }
            if (e.key === 'ArrowRight') {
                currentImageIndex = (currentImageIndex + 1) % galleryImages.length;
                updateLightbox();
            }
        });
    }

    function openLightbox() {
        if (galleryImages[currentImageIndex]) {
            lightboxImg.src = galleryImages[currentImageIndex];
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }

    function updateLightbox() {
        lightboxImg.style.opacity = '0';
        setTimeout(() => {
            if (galleryImages[currentImageIndex]) {
                lightboxImg.src = galleryImages[currentImageIndex];
                lightboxImg.style.opacity = '1';
            }
        }, 200);
    }

    // ── Parallax Effect on Hero ──
    const heroBg = document.querySelector('.hero__bg img');

    if (heroBg) {
        window.addEventListener('scroll', () => {
            const scrolled = window.scrollY;
            if (scrolled < window.innerHeight) {
                heroBg.style.transform = `scale(1.05) translateY(${scrolled * 0.15}px)`;
            }
        }, { passive: true });
    }

    // ── Active Navigation Link ──
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage ||
            (currentPage === '' && href === 'index.html') ||
            (currentPage === 'index.html' && href === 'index.html')) {
            link.classList.add('active');
        }
    });

    // ── Smooth Scroll for Anchor Links ──
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // ── Service Cards — Touch Hover ──
    const serviceCards = document.querySelectorAll('.service-card');

    serviceCards.forEach(card => {
        card.addEventListener('touchstart', function () {
            // Remove active from all other cards
            serviceCards.forEach(c => {
                if (c !== this) c.classList.remove('touch-active');
            });
            this.classList.toggle('touch-active');
        }, { passive: true });
    });

    // ── Form Handling ──
    const contactForm = document.querySelector('.contact__form');

    // Initialize Flatpickr if element exists
    const dateInput = document.getElementById('event_date');
    if (dateInput && typeof flatpickr !== 'undefined') {
        flatpickr(dateInput, {
            locale: "ro",
            dateFormat: "d/m/Y",
            minDate: "today",
            disableMobile: "true", // ensures custom styling is used on mobile over native picker
            altInput: true,
            altFormat: "j F Y", // 15 Ianuarie 2026
        });
    }

    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // Collect form data
            const formData = new FormData(this);
            const data = Object.fromEntries(formData);

            // Simple validation
            const required = this.querySelectorAll('[required]');
            let valid = true;

            required.forEach(field => {
                if (!field.value.trim()) {
                    field.style.borderColor = '#e74c3c';
                    valid = false;
                } else {
                    field.style.borderColor = '';
                }
            });

            if (!valid) return;

            // Success feedback
            const btn = this.querySelector('.btn');
            const originalText = btn.innerHTML;
            btn.innerHTML = '' + `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="icon"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>` + '  Mesaj trimis cu succes!';
            btn.style.background = '#27ae60';

            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.style.background = '';
                this.reset();
            }, 3000);
        });
    }

    // ── Image Lazy Loading Enhancement ──
    if ('loading' in HTMLImageElement.prototype) {
        const lazyImages = document.querySelectorAll('img[loading="lazy"]');
        lazyImages.forEach(img => {
            if (img.dataset.src) {
                img.src = img.dataset.src;
            }
        });
    }

    // ── Year in Footer ──
    const yearEl = document.querySelector('.footer__year');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }

    // ═══════════════════════════════════════════════════════════════
    //    NEW PREMIUM INTERACTIONS (Lenis, GSAP, Swiper, Custom Cursor, Preloader)
    // ═══════════════════════════════════════════════════════════════

    // 1. Lenis Smooth Scroll
    if (typeof Lenis !== 'undefined') {
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smooth: true,
        });

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);

        // Integrate Lenis with GSAP ScrollTrigger
        if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
            lenis.on('scroll', ScrollTrigger.update);
            gsap.ticker.add((time) => {
                lenis.raf(time * 1000);
            });
            gsap.ticker.lagSmoothing(0, 0);
        }
    }

    // 2. Preloader & Initial Animations
    const preloader = document.querySelector('.preloader');
    if (preloader && typeof gsap !== 'undefined') {
        const hasPlayed = sessionStorage.getItem('preloaderPlayed');
        if (hasPlayed) {
            preloader.style.display = 'none';
        } else {
            sessionStorage.setItem('preloaderPlayed', 'true');
            const counter = document.querySelector('.preloader__counter');
            const curtains = document.querySelectorAll('.preloader__curtain');
            const content = document.querySelector('.preloader__content');

            // Prevent scroll without causing layout shift by hiding scrollbar
            if (typeof lenis !== 'undefined') {
                lenis.stop();
            } else {
                document.body.style.overflow = 'hidden';
            }

            let progress = { value: 0 };
            gsap.to(progress, {
                value: 100,
                duration: 2,
                ease: "power2.inOut",
                onUpdate: () => {
                    if (counter) counter.textContent = Math.floor(progress.value) + '%';
                },
                onComplete: () => {
                    const tl = gsap.timeline({
                        onComplete: () => {
                            preloader.style.display = 'none';
                            if (typeof lenis !== 'undefined') {
                                lenis.start();
                            } else {
                                document.body.style.overflow = '';
                            }
                            // Force a refresh to avoid any layout jumps
                            if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
                        }
                    });

                    tl.to(content, { opacity: 0, duration: 0.5, ease: "power2.inOut" })
                        .to(curtains[0], { xPercent: -100, duration: 1, ease: "power4.inOut" }, "-=0.2")
                        .to(curtains[1], { xPercent: 100, duration: 1, ease: "power4.inOut" }, "<");
                }
            });
        }
    }

    // 3. Custom Cursor
    const cursor = document.getElementById('customCursor');
    const cursorText = document.querySelector('.custom-cursor__text');

    if (cursor && !window.matchMedia("(max-width: 768px)").matches) {
        document.addEventListener('mousemove', (e) => {
            // Adjust position precisely to center the cursor
            cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
        });

        const hoverItems = document.querySelectorAll('a, button, .album-card, .service-card');
        hoverItems.forEach(item => {
            item.addEventListener('mouseenter', () => {
                cursor.classList.add('hover');
                if (item.classList.contains('album-card') || item.classList.contains('service-card')) {
                    cursorText.textContent = 'VEZI';
                } else if (item.classList.contains('swiper-slide')) {
                    cursorText.textContent = 'DRAG';
                } else {
                    cursorText.textContent = '';
                }
            });
            item.addEventListener('mouseleave', () => {
                cursor.classList.remove('hover');
                cursorText.textContent = '';
            });
        });
    }

    // 4. Magnetic Buttons
    const magneticBtns = document.querySelectorAll('.magnetic-btn');
    if (magneticBtns.length > 0 && typeof gsap !== 'undefined' && !window.matchMedia("(max-width: 768px)").matches) {
        magneticBtns.forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;

                gsap.to(btn, {
                    x: x * 0.4,
                    y: y * 0.4,
                    duration: 0.5,
                    ease: "power2.out"
                });
            });

            btn.addEventListener('mouseleave', () => {
                gsap.to(btn, {
                    x: 0,
                    y: 0,
                    duration: 0.5,
                    ease: "elastic.out(1, 0.3)"
                });
            });
        });
    }

    // 5. Marquee Continuous Scroll
    if (typeof gsap !== 'undefined') {
        const marqueeInner = document.querySelector('.marquee__inner');
        if (marqueeInner) {
            gsap.to(marqueeInner, {
                xPercent: -50,
                repeat: -1,
                duration: 20,
                ease: "linear"
            });
        }
    }

    // 6. GSAP Parallax & Text Reveal (About Section)
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);

        const aboutImg = document.querySelector('.about__image-wrapper img');
        if (aboutImg) {
            gsap.fromTo(aboutImg,
                { yPercent: -10, scale: 1.1 },
                {
                    yPercent: 10,
                    ease: "none",
                    scrollTrigger: {
                        trigger: ".about__grid",
                        start: "top bottom",
                        end: "bottom top",
                        scrub: true
                    }
                }
            );
        }
    }

    // 7. Swiper Testimonials Slider
    if (typeof Swiper !== 'undefined') {
        new Swiper('.testimonials-slider', {
            effect: 'coverflow',
            grabCursor: true,
            centeredSlides: true,
            slidesPerView: 'auto',
            loop: false,
            initialSlide: 0,
            coverflowEffect: {
                rotate: 20,
                stretch: 0,
                depth: 200,
                modifier: 1,
                slideShadows: false,
            },
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            breakpoints: {
                320: {
                    slidesPerView: 1,
                },
                768: {
                    slidesPerView: 2,
                },
                1024: {
                    slidesPerView: 3, // Shows 3 comfortably
                }
            }
        });
    }

    // 8. FAQ Accordion Logic
    const faqQuestions = document.querySelectorAll('.faq__question');
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const isExpanded = question.getAttribute('aria-expanded') === 'true';

            // Close all others
            faqQuestions.forEach(q => {
                q.setAttribute('aria-expanded', 'false');
                q.nextElementSibling.style.maxHeight = null;
            });

            // Toggle current
            if (!isExpanded) {
                question.setAttribute('aria-expanded', 'true');
                const answer = question.nextElementSibling;
                answer.style.maxHeight = answer.scrollHeight + "px";
            }
        });
    });

});
