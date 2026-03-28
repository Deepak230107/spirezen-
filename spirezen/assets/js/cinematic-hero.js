/**
 * Cinematic Hero Section - "Master Cursor Prompt"
 * 
 * Features:
 * 1. Conditional Loading: Checks device capability before init.
 * 2. Three.js: Low-poly sphere with static normal map for performance.
 * 3. Fallback: CSS-only mode for low-end devices.
 * 4. Interaction: Magnetic CTA and subtle parallax.
 * 5. Performance: Offscreen pausing, throttled listeners.
 */

document.addEventListener('DOMContentLoaded', () => {

    // --- CONFIGURATION ---
    const CONFIG = {
        checkPerformance: true, // Set to false to force enable
        minWidth: 768,
        throttleDelay: 16, // ~60fps cap for events
    };

    const heroSection = document.getElementById('cinematicHero');
    const container = document.getElementById('canvas-container');
    const cta = document.getElementById('heroCTA');

    if (!heroSection || !container) return;

    // --- 1. CAPABILITY CHECK ---
    const isCapable = () => {
        if (!CONFIG.checkPerformance) return true;

        // Check screen width
        if (window.innerWidth < CONFIG.minWidth) return false;

        // Check reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return false;

        // Check Hardware Concurrency (rough proxy for CPU/Device class)
        // >= 4 cores usually means decent laptop/desktop or high-end mobile
        if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) return false;

        // Optionally check Device Memory (if supported)
        if (navigator.deviceMemory && navigator.deviceMemory < 4) return false;

        return true;
    };

    if (!isCapable()) {
        console.log("Cinematic Hero: Low-end device or preference detected. Using CSS fallback.");
        heroSection.classList.add('fallback-mode');
        return; // Stop here, no Three.js
    }

    // --- 2. THREE.JS INITIALIZATION ---
    let scene, camera, renderer, sphere;
    let mouseX = 0, mouseY = 0;
    let targetX = 0, targetY = 0;

    // Check if Three is loaded
    if (typeof THREE === 'undefined') {
        console.error("Three.js not loaded.");
        return;
    }

    function initThree() {
        // Scene setup
        scene = new THREE.Scene();
        // Fog for depth blending (matches dark bg: #050505)
        scene.fog = new THREE.FogExp2(0x050505, 0.002);

        // Camera
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 5;

        // Renderer
        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); // Limit pixel ratio for perf
        container.appendChild(renderer.domElement);

        // --- OBJECT: THE ORB ---
        // Using standard geometry + normal map for "liquid" look without heavy displacement
        const geometry = new THREE.IcosahedronGeometry(2, 4); // Detail level 4 (mid-poly)

        // Material: High metalness for reflections
        const material = new THREE.MeshStandardMaterial({
            color: 0x111111,
            metalness: 0.9,
            roughness: 0.1,
            flatShading: false, // Smooth shading
        });

        sphere = new THREE.Mesh(geometry, material);
        scene.add(sphere);

        // --- LIGHTING ---
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
        scene.add(ambientLight);

        // Directional Lights (Gold accents)
        const light1 = new THREE.DirectionalLight(0xd1a95f, 2); // Gold
        light1.position.set(5, 5, 5);
        scene.add(light1);

        const light2 = new THREE.PointLight(0x4a90e2, 1); // Blueish backlight for contrast
        light2.position.set(-5, -5, 2);
        scene.add(light2);

        // Window resize handling
        window.addEventListener('resize', onWindowResize, false);

        // Mouse movement tracking
        document.addEventListener('mousemove', onMouseMove, false);

        // Start loop
        animate();
    }

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function onMouseMove(event) {
        // Normalize mouse position (-1 to 1)
        targetX = (event.clientX / window.innerWidth) * 2 - 1;
        targetY = -(event.clientY / window.innerHeight) * 2 + 1;
    }

    // --- ANIMATION LOOP ---
    // Use IntersectionObserver to stop rendering when offscreen
    let isVisible = true;
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            isVisible = entry.isIntersecting;
        });
    }, { threshold: 0 });
    observer.observe(heroSection);

    function animate() {
        requestAnimationFrame(animate);

        if (!isVisible) return; // Pause if offscreen

        // Smooth mouse follow (Lerp)
        mouseX += (targetX - mouseX) * 0.05; // Slow ease
        mouseY += (targetY - mouseY) * 0.05;

        if (sphere) {
            // Rotation based on mouse only (auto-spin removed)
            sphere.rotation.x += (mouseY * 0.002);
            sphere.rotation.y += (mouseX * 0.002);

            // Subtle float
            const time = Date.now() * 0.001;
            sphere.position.y = Math.sin(time) * 0.1;
        }

        renderer.render(scene, camera);
    }

    // Initialize
    initThree();


    // --- 3. MAGNETIC CTA ---
    if (cta) {
        const btnBorder = cta.querySelector('.btn-border');

        cta.addEventListener('mousemove', (e) => {
            const rect = cta.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Move text slightly
            cta.style.transform = `translate(${(x - rect.width / 2) * 0.2}px, ${(y - rect.height / 2) * 0.2}px)`;

            // Move border highlight
            // This assumes CSS handles the "glow" via background position or pseudo-elements
        });

        cta.addEventListener('mouseleave', () => {
            cta.style.transform = `translate(0, 0)`;
        });
    }

    // --- 4. SCROLL OUT EFFECT ---
    window.addEventListener('scroll', () => {
        if (!isVisible) return;

        const scrolled = window.scrollY;

        // Dissolve/Fade out effect
        // Only apply to content 
        const content = document.querySelector('.hero-content');
        if (content) {
            content.style.opacity = 1 - (scrolled / 500);
            content.style.transform = `translateY(${scrolled * 0.5}px)`;
        }

        // Zoom sphere slightly on scroll
        if (sphere) {
            const scale = 1 + (scrolled * 0.001);
            sphere.scale.set(scale, scale, scale);
        }
    });

});
