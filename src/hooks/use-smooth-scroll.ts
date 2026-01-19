import { useEffect } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export const useSmoothScroll = (enabled: boolean = true) => {
    useEffect(() => {
        // Skip if disabled (e.g., on app pages with nested scroll containers)
        if (!enabled) return;

        // Register GSAP ScrollTrigger
        gsap.registerPlugin(ScrollTrigger);

        // Initialize Lenis
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true,
            touchMultiplier: 2,
        });

        // 1. Update ScrollTrigger on Lenis scroll
        lenis.on('scroll', ScrollTrigger.update);

        // 2. Add Lenis's RAF to GSAP's ticker
        // This ensures they share the same animation frame loop
        const rafCallback = (time: number) => {
            lenis.raf(time * 1000);
        };
        gsap.ticker.add(rafCallback);

        // 3. Disable native lag smoothing
        gsap.ticker.lagSmoothing(0);

        return () => {
            // Cleanup: Remove listener and ticker
            gsap.ticker.remove(rafCallback);
            lenis.destroy();
        };
    }, [enabled]);
};
