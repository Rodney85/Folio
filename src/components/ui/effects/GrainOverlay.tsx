import { Action } from "@radix-ui/react-toast";

export const GrainOverlay = () => {
    return (
        <div className="pointer-events-none fixed inset-0 z-[9999] h-full w-full select-none overflow-hidden opacity-[0.05]">
            <div className="relative -ml-[50%] -mt-[50%] h-[200%] w-[200%] animate-grain bg-[url('/noise.png')] bg-repeat opacity-50 will-change-transform" />
            <svg className="hidden">
                <filter id="noiseFilter">
                    <feTurbulence
                        type="fractalNoise"
                        baseFrequency="0.6"
                        stitchTiles="stitch"
                    />
                </filter>
            </svg>
            <div
                className="absolute inset-0 h-full w-full"
                style={{
                    filter: 'url(#noiseFilter)',
                    opacity: 0.05
                }}
            />
        </div>
    );
};
