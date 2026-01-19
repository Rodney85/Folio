import { useLayoutEffect, useRef, useEffect } from 'react';
import gsap from 'gsap';

export const useGsapContext = (scope: React.RefObject<HTMLDivElement>) => {
    const ctx = useRef<gsap.Context>();

    const useIsomorphicLayoutEffect =
        typeof window !== 'undefined' ? useLayoutEffect : useEffect;

    return (callback: gsap.ContextFunc) => {
        useIsomorphicLayoutEffect(() => {
            ctx.current = gsap.context(callback, scope);
            return () => ctx.current?.revert();
        }, [scope]);
    };
};
