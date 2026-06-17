/* ==========================================================================
   BELL ECOPACK - MAIN CONTROLLER ENGINE
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // REGISTER GSAP PLUGINS
    gsap.registerPlugin(ScrollTrigger);

    // CORE CONTROLLER OBJECTS
    let lenis;
    let threeEngine = {
        scene: null,
        camera: null,
        renderer: null,
        group: null,
        popcornBox: null,
        burgerBox: null,
        cakeBox: null,
        burgerLidGroup: null,
        raycaster: new THREE.Raycaster(),
        mouse: new THREE.Vector2(),
        isHovered: { popcorn: false, burger: false, cake: false },
        width: 0,
        height: 0
    };

    /* ---------------------------------------------------------
       1. LENIS SMOOTH SCROLL INITIALIZATION
       --------------------------------------------------------- */
    function initLenis() {
        // Disable Lenis on touch devices for native smooth scrolling (60fps mobile responsiveness)
        const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        if (isTouch) return;

        lenis = new Lenis({
            duration: 1.4,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true,
            wheelMultiplier: 1,
            touchMultiplier: 1.5
        });

        lenis.on('scroll', ScrollTrigger.update);
        
        gsap.ticker.add((time) => {
            lenis.raf(time * 1000);
        });
        
        gsap.ticker.lagSmoothing(0);
    }

    /* ---------------------------------------------------------
       2. CINEMATIC PRELOADER WITH NESTED WRAPPER ANIMATION
       --------------------------------------------------------- */
    function initPreloader() {
        const preloader = document.getElementById('preloader');
        if (!preloader) {
            initHeroEntrance();
            return;
        }

        const percentage = document.getElementById('percentage');
        const progressLine = document.getElementById('production-progress');
        const loaderBox = document.getElementById('loader-box');

        // Create preloader floating particles
        const particlesContainer = document.getElementById('preloader-particles');
        if (particlesContainer) {
            for (let i = 0; i < 25; i++) {
                const particle = document.createElement('div');
                particle.classList.add('preloader-particle');
                const size = Math.random() * 5 + 2;
                particle.style.width = `${size}px`;
                particle.style.height = `${size}px`;
                particle.style.left = `${Math.random() * 100}%`;
                particle.style.bottom = `-20px`;
                particlesContainer.appendChild(particle);

                gsap.to(particle, {
                    y: -(window.innerHeight + 50),
                    x: `+=${Math.random() * 100 - 50}`,
                    opacity: Math.random() * 0.4 + 0.1,
                    duration: Math.random() * 3 + 2,
                    repeat: -1,
                    delay: Math.random() * 2,
                    ease: 'power1.out'
                });
            }
        }

        // Get inner face elements inside wrappers
        const front = loaderBox.querySelector('.face-wrapper.front .face');
        const back = loaderBox.querySelector('.face-wrapper.back .face');
        const left = loaderBox.querySelector('.face-wrapper.left .face');
        const right = loaderBox.querySelector('.face-wrapper.right .face');
        const top = loaderBox.querySelector('.face-wrapper.top .face');
        const bottom = loaderBox.querySelector('.face-wrapper.bottom .face');

        // Set initial flat unfolded positions on child faces (rotating WRT parent hinges)
        gsap.set(front, { rotateX: 90 });
        gsap.set(back, { rotateX: -90 });
        gsap.set(left, { rotateX: -90 });
        gsap.set(right, { rotateX: 90 });
        gsap.set(top, { rotateX: -90 });
        gsap.set(bottom, { rotateX: 0 }); // Base remains static

        const loaderTl = gsap.timeline({
            onComplete: () => {
                gsap.to(preloader, {
                    clipPath: 'circle(0% at 50% 50%)',
                    duration: 0.8,
                    ease: 'power4.inOut',
                    onComplete: () => {
                        preloader.style.display = 'none';
                        initHeroEntrance();
                    }
                });
            }
        });

        // 1. Percentage counter counting smoothly (0 to 100)
        loaderTl.to({ val: 0 }, {
            val: 100,
            duration: 1.8,
            ease: 'power1.inOut',
            onUpdate: function() {
                const currentVal = Math.round(this.targets()[0].val);
                if (percentage) percentage.textContent = currentVal;
                if (progressLine) progressLine.style.width = `${currentVal}%`;
            }
        }, 0);

        // 2. Draw die lines
        loaderTl.to('.die-line', {
            strokeDashoffset: 0,
            duration: 0.6,
            ease: 'power2.inOut'
        }, 0.1);

        // 3. Fold the box flaps upright (complete folds by 1.5 seconds)
        loaderTl.to(front, { rotateX: 0, duration: 0.3, ease: 'power2.inOut' }, 0.3)
                .to(back, { rotateX: 0, duration: 0.3, ease: 'power2.inOut' }, 0.5)
                .to(left, { rotateX: 0, duration: 0.3, ease: 'power2.inOut' }, 0.7)
                .to(right, { rotateX: 0, duration: 0.3, ease: 'power2.inOut' }, 0.9)
                .to(top, { rotateX: 0, duration: 0.4, ease: 'power2.inOut' }, 1.1);

        // 4. Spin fully assembled box (starts at 1.2s, wraps up as timeline hits 1.8s)
        loaderTl.to(loaderBox, {
            rotateX: 340,
            rotateY: 405,
            duration: 0.6,
            ease: 'power3.out'
        }, 1.2);
    }

    /* ---------------------------------------------------------
       3. HERO ENTRANCE ANIMATIONS
       --------------------------------------------------------- */
    function initHeroEntrance() {
        const heroTl = gsap.timeline();
        
        if (document.querySelector('.navbar-header')) {
            heroTl.from('.navbar-header', {
                y: -100,
                opacity: 0,
                duration: 1.2,
                ease: 'power4.out',
                clearProps: 'all'
            }, 0);
        }
        
        const heroTitleSpans = document.querySelectorAll('.hero-title span');
        if (heroTitleSpans.length > 0) {
            heroTl.from(heroTitleSpans, {
                y: 80,
                opacity: 0,
                duration: 1.2,
                stagger: 0.08,
                ease: 'power4.out'
            }, 0.2);
        }
        
        if (document.querySelector('.hero-subtitle')) {
            heroTl.from('.hero-subtitle', {
                y: 30,
                opacity: 0,
                duration: 1,
                ease: 'power3.out'
            }, 0.6);
        }
        
        const heroBtns = document.querySelectorAll('.hero-actions .btn');
        if (heroBtns.length > 0) {
            heroTl.from(heroBtns, {
                scale: 0.9,
                opacity: 0,
                duration: 0.8,
                stagger: 0.1,
                ease: 'back.out(1.5)'
            }, 0.8);
        }
        
        if (document.querySelector('.hero-interactive-3d')) {
            heroTl.from('.hero-interactive-3d', {
                opacity: 0,
                scale: 0.85,
                duration: 1.5,
                ease: 'power3.out'
            }, 0.5);
        }
    }

    /* ---------------------------------------------------------
       4. FLOATING LEAVES BACKGROUND EFFECTS
       --------------------------------------------------------- */
    function initLeafParticles() {
        const container = document.getElementById('leaf-container');
        if (!container) return;

        for (let i = 0; i < 15; i++) {
            const leaf = document.createElement('div');
            leaf.classList.add('floating-leaf');
            
            const size = Math.random() * 20 + 10;
            leaf.style.width = `${size}px`;
            leaf.style.height = `${size}px`;
            leaf.style.left = `${Math.random() * 100}vw`;
            leaf.style.top = `${Math.random() * 100}vh`;
            container.appendChild(leaf);

            gsap.to(leaf, {
                x: `+=${Math.random() * 100 - 50}`,
                y: `+=${Math.random() * 100 - 50}`,
                rotation: `+=${Math.random() * 360 - 180}`,
                duration: Math.random() * 10 + 10,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut'
            });
        }
    }

    /* ---------------------------------------------------------
       5. THREE.JS 3D HERO SHOWCASE
       --------------------------------------------------------- */
    function generateCanvasTexture(type) {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        if (type === 'popcorn') {
            ctx.fillStyle = '#bca586'; 
            ctx.fillRect(0, 0, 512, 512);
            ctx.fillStyle = '#1e4620';
            const stripeWidth = 512 / 8;
            for (let i = 0; i < 8; i += 2) {
                ctx.fillRect(i * stripeWidth, 0, stripeWidth, 512);
            }
            ctx.fillStyle = '#fcfcf9';
            ctx.beginPath();
            ctx.arc(256, 256, 95, 0, Math.PI * 2);
            ctx.fill();
            ctx.lineWidth = 6;
            ctx.strokeStyle = '#c5a880';
            ctx.stroke();
            ctx.fillStyle = '#1e4620';
            ctx.font = 'bold 22px Outfit';
            ctx.textAlign = 'center';
            ctx.fillText('BELL ECO', 256, 240);
            ctx.font = 'bold 28px Outfit';
            ctx.fillStyle = '#c5a880';
            ctx.fillText('POPCORN', 256, 275);
            ctx.font = '500 14px Inter';
            ctx.fillStyle = '#1e4620';
            ctx.fillText('100% COMPOSTABLE', 256, 305);

        } else if (type === 'burger') {
            ctx.fillStyle = '#e6e5e0';
            ctx.fillRect(0, 0, 512, 512);
            ctx.strokeStyle = '#1e4620';
            ctx.lineWidth = 15;
            ctx.strokeRect(40, 40, 432, 432);
            ctx.fillStyle = '#1e4620';
            ctx.font = 'bold 32px Outfit';
            ctx.textAlign = 'center';
            ctx.fillText('BELL BURGER', 256, 230);
            ctx.font = 'bold 24px Outfit';
            ctx.fillStyle = '#c5a880';
            ctx.fillText('ECO-BOX', 256, 275);
            ctx.font = '500 16px Inter';
            ctx.fillStyle = '#1e4620';
            ctx.fillText('HOT & FRESH LOCK', 256, 320);

        } else if (type === 'cake') {
            ctx.fillStyle = '#c5a880';
            ctx.fillRect(0, 0, 512, 512);
            ctx.fillStyle = '#1e4620';
            ctx.fillRect(0, 0, 512, 60);
            ctx.fillRect(0, 452, 512, 60);
            ctx.fillStyle = '#fcfcf9';
            ctx.font = 'bold 26px Outfit';
            ctx.textAlign = 'center';
            ctx.fillText('BELL BAKERY SOLUTIONS', 256, 240);
            ctx.font = 'bold 36px Outfit';
            ctx.fillStyle = '#1e4620';
            ctx.fillText('CONFECTIONERY', 256, 290);
        }

        return new THREE.CanvasTexture(canvas);
    }

    function getResponsiveCameraZ() {
        const w = window.innerWidth;
        if (w < 480) return 12.5;
        if (w < 768) return 10.5;
        if (w < 1024) return 9.2;
        return 8;
    }

    function initThreeJS() {
        const container = document.getElementById('hero-canvas-container');
        if (!container) return;

        threeEngine.width = container.clientWidth;
        threeEngine.height = container.clientHeight;

        threeEngine.scene = new THREE.Scene();

        threeEngine.camera = new THREE.PerspectiveCamera(45, threeEngine.width / threeEngine.height, 0.1, 100);
        const zPos = getResponsiveCameraZ();
        threeEngine.camera.position.set(0, 0, zPos);

        threeEngine.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        threeEngine.renderer.setSize(threeEngine.width, threeEngine.height);
        threeEngine.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        threeEngine.renderer.shadowMap.enabled = true;
        container.appendChild(threeEngine.renderer.domElement);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        threeEngine.scene.add(ambientLight);

        const keyLight = new THREE.DirectionalLight(0xfff5e6, 1.2); 
        keyLight.position.set(5, 5, 4);
        keyLight.castShadow = true;
        threeEngine.scene.add(keyLight);

        const accentLight = new THREE.PointLight(0xc5a880, 1.5, 10);
        accentLight.position.set(-3, -2, 2);
        threeEngine.scene.add(accentLight);

        threeEngine.group = new THREE.Group();
        threeEngine.scene.add(threeEngine.group);

        const kraftMat = new THREE.MeshStandardMaterial({
            map: generateCanvasTexture('popcorn'),
            roughness: 0.5,
            metalness: 0.1
        });

        const burgerMat = new THREE.MeshStandardMaterial({
            map: generateCanvasTexture('burger'),
            roughness: 0.4,
            metalness: 0.15
        });

        const cakeMat = new THREE.MeshStandardMaterial({
            map: generateCanvasTexture('cake'),
            roughness: 0.5,
            metalness: 0.1
        });

        const goldMat = new THREE.MeshStandardMaterial({
            color: 0xc5a880,
            roughness: 0.25,
            metalness: 0.85
        });

        const interiorMat = new THREE.MeshStandardMaterial({
            color: 0x8a7051, 
            roughness: 0.7
        });

        // 1. POPCORN BOX
        const popGeo = new THREE.CylinderGeometry(0.8, 0.6, 1.8, 4, 1, true);
        threeEngine.popcornBox = new THREE.Mesh(popGeo, kraftMat);
        threeEngine.popcornBox.rotation.y = Math.PI / 4; 
        
        const popCapGeo = new THREE.BoxGeometry(0.85, 0.02, 0.85);
        const popCap = new THREE.Mesh(popCapGeo, interiorMat);
        popCap.position.y = -0.9;
        popCap.rotation.y = Math.PI / 4;
        threeEngine.popcornBox.add(popCap);
        
        threeEngine.popcornBox.position.set(-2.0, 0.5, 0);
        threeEngine.group.add(threeEngine.popcornBox);

        // 2. BURGER BOX
        const burgerBoxGroup = new THREE.Group();
        
        const baseGeo = new THREE.BoxGeometry(1.4, 0.4, 1.4);
        const burgerBase = new THREE.Mesh(baseGeo, burgerMat);
        burgerBase.position.y = -0.2;
        burgerBoxGroup.add(burgerBase);
        
        threeEngine.burgerLidGroup = new THREE.Group();
        threeEngine.burgerLidGroup.position.set(0, 0, -0.7);
        
        const lidGeo = new THREE.BoxGeometry(1.42, 0.4, 1.42);
        const burgerLid = new THREE.Mesh(lidGeo, burgerMat);
        burgerLid.position.set(0, 0.2, 0.7); 
        threeEngine.burgerLidGroup.add(burgerLid);
        
        burgerBoxGroup.add(threeEngine.burgerLidGroup);
        
        burgerBoxGroup.position.set(1.8, -0.6, 0.5);
        threeEngine.burgerBox = burgerBoxGroup; 
        threeEngine.group.add(threeEngine.burgerBox);

        // 3. CAKE BOX
        const cakeBoxGroup = new THREE.Group();
        
        const cakeGeo = new THREE.BoxGeometry(1.3, 1.1, 1.3);
        const cakeBody = new THREE.Mesh(cakeGeo, cakeMat);
        cakeBoxGroup.add(cakeBody);

        const shape = new THREE.Shape();
        shape.moveTo(-0.3, 0);
        shape.lineTo(-0.3, 0.25);
        shape.quadraticCurveTo(-0.3, 0.45, -0.15, 0.45);
        shape.lineTo(0.15, 0.45);
        shape.quadraticCurveTo(0.3, 0.45, 0.3, 0.25);
        shape.lineTo(0.3, 0);
        shape.lineTo(0.2, 0);
        shape.lineTo(0.2, 0.2);
        shape.quadraticCurveTo(0.2, 0.35, 0.1, 0.35);
        shape.lineTo(-0.1, 0.35);
        shape.quadraticCurveTo(-0.2, 0.35, -0.2, 0.2);
        shape.lineTo(-0.2, 0);

        const extrudeSettings = { depth: 0.05, bevelEnabled: false };
        const handleGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        const cakeHandle = new THREE.Mesh(handleGeo, goldMat);
        cakeHandle.position.set(0, 0.55, -0.025);
        cakeBoxGroup.add(cakeHandle);

        cakeBoxGroup.position.set(0, 1.2, -1.2);
        threeEngine.cakeBox = cakeBoxGroup;
        threeEngine.group.add(threeEngine.cakeBox);

        threeEngine.popcornBox.userData = { id: 'popcorn' };
        burgerBase.userData = { id: 'burger' };
        burgerLid.userData = { id: 'burger' };
        cakeBody.userData = { id: 'cake' };

        window.addEventListener('resize', onWindowResize);
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('touchmove', onMouseMove, { passive: true });

        animateThree();
    }

    function onMouseMove(event) {
        if (!threeEngine.renderer) return;
        const rect = threeEngine.renderer.domElement.getBoundingClientRect();
        
        let clientX, clientY;
        if (event.touches && event.touches.length > 0) {
            clientX = event.touches[0].clientX;
            clientY = event.touches[0].clientY;
        } else {
            clientX = event.clientX;
            clientY = event.clientY;
        }
        
        if (clientX === undefined || clientY === undefined) return;

        threeEngine.mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
        threeEngine.mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

        if (threeEngine.group) {
            gsap.to(threeEngine.group.rotation, {
                x: -threeEngine.mouse.y * 0.25,
                y: threeEngine.mouse.x * 0.25,
                duration: 0.8,
                ease: 'power2.out'
            });
        }
    }

    function onWindowResize() {
        const container = document.getElementById('hero-canvas-container');
        if (!container) return;

        threeEngine.width = container.clientWidth;
        threeEngine.height = container.clientHeight;

        threeEngine.camera.aspect = threeEngine.width / threeEngine.height;
        threeEngine.camera.updateProjectionMatrix();

        const zPos = getResponsiveCameraZ();
        threeEngine.camera.position.z = zPos;

        threeEngine.renderer.setSize(threeEngine.width, threeEngine.height);
    }

    function animateThree() {
        requestAnimationFrame(animateThree);

        const time = Date.now() * 0.001;

        if (threeEngine.popcornBox && !threeEngine.isHovered.popcorn) {
            threeEngine.popcornBox.position.y = 0.5 + Math.sin(time * 0.8) * 0.12;
            threeEngine.popcornBox.rotation.y = time * 0.15;
        }

        if (threeEngine.burgerBox && !threeEngine.isHovered.burger) {
            threeEngine.burgerBox.position.y = -0.6 + Math.sin(time * 0.6 + 1) * 0.12;
            threeEngine.burgerBox.rotation.y = -time * 0.12;
        }

        if (threeEngine.cakeBox && !threeEngine.isHovered.cake) {
            threeEngine.cakeBox.position.y = 1.2 + Math.sin(time * 0.7 + 2) * 0.1;
            threeEngine.cakeBox.rotation.y = time * 0.08;
        }

        threeEngine.raycaster.setFromCamera(threeEngine.mouse, threeEngine.camera);
        const intersects = threeEngine.raycaster.intersectObjects(threeEngine.group.children, true);

        let hoveredId = null;
        if (intersects.length > 0) {
            let currentObj = intersects[0].object;
            while (currentObj.parent) {
                if (currentObj.userData && currentObj.userData.id) {
                    hoveredId = currentObj.userData.id;
                    break;
                }
                currentObj = currentObj.parent;
            }
        }

        if (hoveredId === 'popcorn') {
            threeEngine.isHovered.popcorn = true;
            gsap.to(threeEngine.popcornBox.scale, { x: 1.15, y: 1.15, z: 1.15, duration: 0.4 });
        } else {
            threeEngine.isHovered.popcorn = false;
            gsap.to(threeEngine.popcornBox.scale, { x: 1, y: 1, z: 1, duration: 0.4 });
        }

        if (hoveredId === 'burger') {
            threeEngine.isHovered.burger = true;
            gsap.to(threeEngine.burgerLidGroup.rotation, { x: -0.6, duration: 0.5 }); 
        } else {
            threeEngine.isHovered.burger = false;
            gsap.to(threeEngine.burgerLidGroup.rotation, { x: 0, duration: 0.5 }); 
        }

        if (hoveredId === 'cake') {
            threeEngine.isHovered.cake = true;
            gsap.to(threeEngine.cakeBox.scale, { x: 1.12, y: 1.12, z: 1.12, duration: 0.4 });
            threeEngine.cakeBox.rotation.y += 0.02; 
        } else {
            threeEngine.isHovered.cake = false;
            gsap.to(threeEngine.cakeBox.scale, { x: 1, y: 1, z: 1, duration: 0.4 });
        }

        threeEngine.renderer.render(threeEngine.scene, threeEngine.camera);
    }

    /* ---------------------------------------------------------
       6. VISION PRO CAROUSEL SWAP SYSTEM (COMPACT RADIUS)
       --------------------------------------------------------- */
    const carouselData = {
        cards: document.querySelectorAll('.carousel-card'),
        track: document.getElementById('carousel-track'),
        dotsWrap: document.getElementById('carousel-dots'),
        detailsTitle: document.getElementById('details-title'),
        detailsDesc: document.getElementById('details-desc'),
        detailsF1: document.getElementById('feat-1'),
        detailsF2: document.getElementById('feat-2'),
        detailsF3: document.getElementById('feat-3'),
        detailsCta: document.getElementById('details-cta'),
        activeIndex: 0,
        isDragging: false,
        startX: 0,
        currentTranslate: 0,
        prevTranslate: 0,
        dragThreshold: 40
    };

    function initCarousel() {
        if (!carouselData.track || carouselData.cards.length === 0) return;

        carouselData.cards.forEach((card, index) => {
            const dot = document.createElement('div');
            dot.classList.add('dot');
            if (index === 0) dot.classList.add('active-dot');
            dot.addEventListener('click', () => swapProduct(index));
            carouselData.dotsWrap.appendChild(dot);
        });

        carouselData.cards.forEach((card, index) => {
            card.addEventListener('click', () => {
                if (index !== carouselData.activeIndex) {
                    swapProduct(index);
                }
            });
        });

        updateCarouselPositions();

        carouselData.track.addEventListener('mousedown', dragStart);
        carouselData.track.addEventListener('touchstart', dragStart, { passive: true });
        
        window.addEventListener('mousemove', dragMove);
        window.addEventListener('touchmove', dragMove, { passive: true });
        
        window.addEventListener('mouseup', dragEnd);
        window.addEventListener('touchend', dragEnd);

        carouselData.track.addEventListener('wheel', (e) => {
            e.preventDefault();
            if (e.deltaY > 0) {
                navigateCarousel(1);
            } else {
                navigateCarousel(-1);
            }
        }, { passive: false });

        const prevBtn = document.querySelector('.prev-btn');
        const nextBtn = document.querySelector('.next-btn');
        if(prevBtn) prevBtn.addEventListener('click', () => navigateCarousel(-1));
        if(nextBtn) nextBtn.addEventListener('click', () => navigateCarousel(1));

        window.addEventListener('resize', () => {
            updateCarouselPositions();
        });
    }

    function navigateCarousel(direction) {
        let nextIndex = carouselData.activeIndex + direction;
        if (nextIndex < 0) nextIndex = carouselData.cards.length - 1;
        if (nextIndex >= carouselData.cards.length) nextIndex = 0;
        swapProduct(nextIndex);
    }

    function swapProduct(index) {
        carouselData.activeIndex = index;
        updateCarouselPositions();
        updateActiveDetails(carouselData.cards[index]);

        const dots = carouselData.dotsWrap.querySelectorAll('.dot');
        dots.forEach((dot, idx) => {
            dot.classList.toggle('active-dot', idx === index);
        });
    }

    function updateCarouselPositions() {
        let radius = 250;
        if (window.innerWidth < 480) {
            radius = 95;
        } else if (window.innerWidth < 768) {
            radius = 130;
        }
        const separationAngle = Math.PI / 3; 

        carouselData.cards.forEach((card, idx) => {
            const angle = (idx - carouselData.activeIndex) * separationAngle;
            
            const x = Math.sin(angle) * radius;
            const z = Math.cos(angle) * radius - radius; 
            const rotationY = -angle * 45; 
            const scale = 1 - Math.abs(angle) * 0.15;
            const opacity = 1 - Math.abs(angle) * 0.45;
            const blur = Math.abs(angle) * 5;

            gsap.to(card, {
                x: x,
                z: z,
                rotationY: rotationY,
                scale: scale,
                opacity: opacity,
                filter: `blur(${blur}px)`,
                duration: 0.8,
                ease: 'power3.out',
                overwrite: 'auto'
            });

            card.classList.toggle('active-card', idx === carouselData.activeIndex);
        });
    }

    function updateActiveDetails(card) {
        const title = card.getAttribute('data-product');
        const desc = card.getAttribute('data-desc');
        const features = card.getAttribute('data-features').split(' • ');
        const ctaLink = card.getAttribute('data-cta');

        gsap.to('.details-content', {
            opacity: 0,
            y: 10,
            duration: 0.3,
            onComplete: () => {
                carouselData.detailsTitle.textContent = title;
                carouselData.detailsDesc.textContent = desc;
                carouselData.detailsF1.textContent = features[0] || '';
                carouselData.detailsF2.textContent = features[1] || '';
                carouselData.detailsF3.textContent = features[2] || '';
                carouselData.detailsCta.setAttribute('href', ctaLink);

                gsap.to('.details-content', {
                    opacity: 1,
                    y: 0,
                    duration: 0.4,
                    ease: 'power2.out'
                });
            }
        });
    }

    function dragStart(e) {
        carouselData.isDragging = true;
        carouselData.startX = e.type.includes('touch') ? (e.touches && e.touches[0] ? e.touches[0].clientX : 0) : e.clientX;
        if (carouselData.track) carouselData.track.style.cursor = 'grabbing';
    }

    // Touch-safe drag handler preventing NaN coordinates
    function dragMove(e) {
        if (!carouselData.isDragging) return;
        const currentX = e.type.includes('touch') ? (e.touches && e.touches[0] ? e.touches[0].clientX : 0) : e.clientX;
        const diffX = currentX - carouselData.startX;

        if (Math.abs(diffX) > carouselData.dragThreshold) {
            carouselData.isDragging = false;
            if (carouselData.track) carouselData.track.style.cursor = 'grab';
            if (diffX > 0) {
                navigateCarousel(-1); 
            } else {
                navigateCarousel(1);  
            }
        }
    }

    function dragEnd() {
        carouselData.isDragging = false;
        if (carouselData.track) carouselData.track.style.cursor = 'grab';
    }

    /* ---------------------------------------------------------
       7. MANUFACTURING PROCESS TIMELINE PATH DRAWING
       --------------------------------------------------------- */
    function initTimelineProgress() {
        const fillPath = document.getElementById('timeline-progress-fill');
        if (!fillPath) return;

        gsap.set(fillPath, { strokeDashoffset: 2000, strokeDasharray: 2000 });

        gsap.to(fillPath, {
            strokeDashoffset: 0,
            scrollTrigger: {
                trigger: '.timeline-container',
                start: 'top 60%',
                end: 'bottom 40%',
                scrub: true
            }
        });

        const steps = document.querySelectorAll('.timeline-item');
        steps.forEach((step) => {
            ScrollTrigger.create({
                trigger: step,
                start: 'top 70%',
                end: 'bottom 30%',
                onEnter: () => step.classList.add('active-step'),
                onEnterBack: () => step.classList.add('active-step'),
                onLeave: () => step.classList.remove('active-step'),
                onLeaveBack: () => step.classList.remove('active-step')
            });
        });
    }

    /* ---------------------------------------------------------
       8. 3D CARD TILT SHIFT MICRO-INTERACTION
       --------------------------------------------------------- */
    function initCardTilt() {
        const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        if (isTouch) return;

        const cards = document.querySelectorAll('.tilt-card');
        cards.forEach((card) => {
            const reflection = card.querySelector('.card-reflection');

            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                const rotateY = ((x / rect.width) * 20 - 10).toFixed(2);
                const rotateX = -((y / rect.height) * 20 - 10).toFixed(2);

                card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;

                if (reflection) {
                    const pctX = (x / rect.width) * 100;
                    const pctY = (y / rect.height) * 100;
                    reflection.style.transform = `translate(-50%, -50%) rotate(45deg) translate(${pctX - 50}px, ${pctY - 50}px)`;
                }
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = `perspective(800px) rotateX(0deg) rotateY(0deg) translateY(0)`;
                if (reflection) {
                    reflection.style.transform = `translate(-50%, -50%) rotate(45deg)`;
                }
            });
        });
    }

    /* ---------------------------------------------------------
       9. STATISTICS NUMERIC COUNTERS
       --------------------------------------------------------- */
    function initCounters() {
        const counters = document.querySelectorAll('.counter');
        counters.forEach((counter) => {
            const target = parseInt(counter.getAttribute('data-target'), 10);
            
            ScrollTrigger.create({
                trigger: counter,
                start: 'top 85%',
                onEnter: () => {
                    gsap.to(counter, {
                        textContent: target,
                        duration: 2,
                        snap: { textContent: 1 },
                        ease: 'power2.out'
                    });
                },
                once: true 
            });
        });
    }

    /* ---------------------------------------------------------
       10. GLOBAL EXPORT PRESENCE MAP (TAMIL NADU DEFAULT)
       --------------------------------------------------------- */
    function initMapInteractions() {
        const destinations = document.querySelectorAll('.export-destination');
        const tooltip = document.getElementById('map-details');
        if(!tooltip) return;

        destinations.forEach((dest) => {
            dest.addEventListener('mouseenter', (e) => {
                const region = dest.getAttribute('data-region');
                const stat = dest.getAttribute('data-stat');
                
                const laneClass = `.lane-${region.toLowerCase().replace(' ', '')}`;
                const activeLane = document.querySelector(laneClass);
                if (activeLane) {
                    activeLane.classList.add('active-lane');
                }

                tooltip.querySelector('h4').textContent = 'Global Destination';
                tooltip.querySelector('.region-name').textContent = region;
                tooltip.querySelector('.region-details').textContent = stat;

                gsap.to(tooltip, { opacity: 1, y: 0, duration: 0.3 });
            });

            dest.addEventListener('mouseleave', () => {
                const region = dest.getAttribute('data-region');
                
                const laneClass = `.lane-${region.toLowerCase().replace(' ', '')}`;
                const activeLane = document.querySelector(laneClass);
                if (activeLane) {
                    activeLane.classList.remove('active-lane');
                }

                tooltip.querySelector('h4').textContent = 'Manufacturing Hub';
                tooltip.querySelector('.region-name').textContent = 'Virudhunagar, Tamil Nadu';
                tooltip.querySelector('.region-details').textContent = 'Global headquarters. Fully integrated automatic manufacturing plants running 24/7.';
            });
        });
    }

    /* ---------------------------------------------------------
       11. TESTIMONIALS SLIDER
       --------------------------------------------------------- */
    const testimonialData = {
        slides: document.querySelectorAll('.testimonial-slide'),
        fill: document.getElementById('t-progress-fill'),
        index: 0,
        timer: null,
        intervalMs: 6000
    };

    function initTestimonials() {
        if (testimonialData.slides.length === 0) return;

        const prevBtn = document.querySelector('.t-prev');
        const nextBtn = document.querySelector('.t-next');
        if (prevBtn) prevBtn.addEventListener('click', () => shiftTestimonial(-1));
        if (nextBtn) nextBtn.addEventListener('click', () => shiftTestimonial(1));

        resetTestimonialTimer();
    }

    function shiftTestimonial(direction) {
        testimonialData.slides[testimonialData.index].classList.remove('active-slide');
        
        testimonialData.index += direction;
        if (testimonialData.index < 0) {
            testimonialData.index = testimonialData.slides.length - 1;
        } else if (testimonialData.index >= testimonialData.slides.length) {
            testimonialData.index = 0;
        }

        testimonialData.slides[testimonialData.index].classList.add('active-slide');

        if(testimonialData.fill) {
            const fillPct = ((testimonialData.index + 1) / testimonialData.slides.length) * 100;
            gsap.to(testimonialData.fill, { width: `${fillPct}%`, duration: 0.4 });
        }

        resetTestimonialTimer();
    }

    function resetTestimonialTimer() {
        clearInterval(testimonialData.timer);
        
        if(testimonialData.fill) {
            const fillPct = ((testimonialData.index + 1) / testimonialData.slides.length) * 100;
            gsap.set(testimonialData.fill, { width: `${fillPct}%` });
        }

        testimonialData.timer = setInterval(() => {
            shiftTestimonial(1);
        }, testimonialData.intervalMs);
    }

    /* ---------------------------------------------------------
       12. FORMS SUBMISSION & CONTACT LOGIC
       --------------------------------------------------------- */
    function initForms() {
        const quoteForm = document.getElementById('quote-form');
        const successBox = document.getElementById('success-notif');

        if (quoteForm) {
            quoteForm.addEventListener('submit', (e) => {
                e.preventDefault();

                const submitBtn = quoteForm.querySelector('.form-submit-btn');
                submitBtn.disabled = true;
                submitBtn.querySelector('span').textContent = 'PROCESSING...';

                setTimeout(() => {
                    successBox.classList.add('show');
                    gsap.from(successBox, {
                        scale: 0.95,
                        opacity: 0,
                        duration: 0.5,
                        ease: 'power2.out'
                    });
                }, 1200);
            });
        }

        const newsForm = document.getElementById('newsletter-form');
        const newsStatus = document.getElementById('news-status');

        if (newsForm) {
            newsForm.addEventListener('submit', (e) => {
                e.preventDefault();
                newsForm.style.opacity = '0.5';
                newsForm.querySelector('button').disabled = true;

                setTimeout(() => {
                    newsForm.reset();
                    newsForm.style.opacity = '1';
                    newsForm.querySelector('button').disabled = false;
                    newsStatus.style.display = 'block';
                    gsap.from(newsStatus, { opacity: 0, y: 5, duration: 0.3 });
                }, 1000);
            });
        }
    }

    /* ---------------------------------------------------------
       13. RESPONSIVE DRAWER & HEADER LOGIC
       --------------------------------------------------------- */
    function initHeaderDrawer() {
        const toggle = document.querySelector('.menu-toggle');
        const drawer = document.querySelector('.mobile-drawer');
        const header = document.querySelector('.navbar-header');
        
        if (!toggle) return;

        let lastScrollY = window.scrollY;

        toggle.addEventListener('click', () => {
            const isOpen = drawer.classList.toggle('open');
            toggle.classList.toggle('active');
            if (isOpen) {
                document.body.style.overflow = 'hidden'; // Lock background scrolling
            } else {
                document.body.style.overflow = '';
            }
        });

        drawer.querySelectorAll('a').forEach((link) => {
            link.addEventListener('click', () => {
                toggle.classList.remove('active');
                drawer.classList.remove('open');
                document.body.style.overflow = ''; // Unlock background scrolling
            });
        });

        window.addEventListener('resize', () => {
            if (window.innerWidth > 900) {
                drawer.classList.remove('open');
                toggle.classList.remove('active');
                document.body.style.overflow = '';
            }
        });

        window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;
            if (currentScrollY > 150) {
                if (currentScrollY > lastScrollY) {
                    header.classList.add('nav-hidden');
                } else {
                    header.classList.remove('nav-hidden');
                }
            } else {
                header.classList.remove('nav-hidden');
            }
            lastScrollY = currentScrollY;
        }, { passive: true });
    }

    /* ---------------------------------------------------------
       14. ADVANCED MICRO-INTERACTIONS (MAGNETIC BUTTONS)
       --------------------------------------------------------- */
    function initMagneticButtons() {
        const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        if (isTouch) return;

        const magnetics = document.querySelectorAll('.magnetic');
        magnetics.forEach((btn) => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;

                gsap.to(btn, {
                    x: x * 0.35,
                    y: y * 0.35,
                    duration: 0.3,
                    ease: 'power2.out'
                });
            });

            btn.addEventListener('mouseleave', () => {
                gsap.to(btn, {
                    x: 0,
                    y: 0,
                    duration: 0.5,
                    ease: 'elastic.out(1, 0.3)'
                });
            });
        });
    }

    /* ---------------------------------------------------------
       15. DYNAMIC LAYOUT LOADING (HEADER & FOOTER)
       --------------------------------------------------------- */
    async function loadLayout() {
        const headerPlaceholder = document.getElementById('header-placeholder');
        const footerPlaceholder = document.getElementById('footer-placeholder');

        if (headerPlaceholder) {
            try {
                const response = await fetch('layout/header.html');
                if (response.ok) {
                    const html = await response.text();
                    headerPlaceholder.outerHTML = html;
                } else {
                    console.error('Failed to load header:', response.statusText);
                }
            } catch (e) {
                console.error('Error loading header layout:', e);
            }
        }

        if (footerPlaceholder) {
            try {
                const response = await fetch('layout/footer.html');
                if (response.ok) {
                    const html = await response.text();
                    footerPlaceholder.outerHTML = html;
                } else {
                    console.error('Failed to load footer:', response.statusText);
                }
            } catch (e) {
                console.error('Error loading footer layout:', e);
            }
        }

        // Set active link based on current filename
        const currentPath = window.location.pathname.split('/').pop() || 'index.html';
        document.querySelectorAll('.nav-links a, .drawer-links a').forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPath || (currentPath === '' && href === 'index.html')) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    /* ---------------------------------------------------------
       16. ORCHESTRATE ALL SCRIPTS STARTS
       --------------------------------------------------------- */
    async function init() {
        initLenis();
        await loadLayout();
        initPreloader();
        initLeafParticles();
        initThreeJS();
        initCarousel();
        initTimelineProgress();
        initCardTilt();
        initCounters();
        initMapInteractions();
        initTestimonials();
        initForms();
        initHeaderDrawer();
        initMagneticButtons();
    }

    init();
});
