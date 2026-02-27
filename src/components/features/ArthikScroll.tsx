import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { useNavigate } from "react-router-dom";

gsap.registerPlugin(ScrollTrigger);

const TOTAL_FRAMES = 225;
const IMAGE_BASE_PATH = "/arthikimages/ezgif-frame-";
const IMAGE_EXTENSION = ".jpg";

const ArthikScroll: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const loadingRef = useRef<HTMLDivElement>(null);
    const [imagesLoaded, setImagesLoaded] = useState(false);
    const [loadProgress, setLoadProgress] = useState(0);

    const images = useRef<HTMLImageElement[]>([]);
    const airPlane = useRef({ frame: 1 });
    const navigate = useNavigate();

    // 1. Initialize Lenis for smooth scrolling
    useEffect(() => {
        const lenis = new Lenis({
            duration: 2.2, // Significantly increased for a liquid, heavy-momentum feel
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            touchMultiplier: 1.2,
            infinite: false,
        });

        function raf(time: number) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }

        requestAnimationFrame(raf);

        return () => {
            lenis.destroy();
        };
    }, []);

    // 2. Preload Images
    useEffect(() => {
        let loadedCount = 0;

        const loadImages = () => {
            for (let i = 1; i <= TOTAL_FRAMES; i++) {
                const img = new Image();
                const frameNumber = i.toString().padStart(3, "0");
                // Direct path to images folder
                img.src = `${IMAGE_BASE_PATH}${frameNumber}${IMAGE_EXTENSION}`;
                img.onload = () => {
                    loadedCount++;
                    const progress = Math.floor((loadedCount / TOTAL_FRAMES) * 100);
                    setLoadProgress(progress);
                    if (loadedCount === TOTAL_FRAMES) {
                        setImagesLoaded(true);
                        gsap.to(loadingRef.current, {
                            opacity: 0,
                            duration: 1,
                            ease: "power2.inOut",
                            onComplete: () => {
                                if (loadingRef.current) loadingRef.current.style.display = "none";
                            }
                        });
                    }
                };
                images.current[i] = img;
            }
        };

        loadImages();
    }, []);

    // 3. Canvas Rendering Function (Optimized for Clarity)
    const render = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Use alpha: false for significant performance gains
        const context = canvas.getContext("2d", { alpha: false });
        if (!context) return;

        const img = images.current[Math.round(airPlane.current.frame)];
        if (!img) return;

        const width = window.innerWidth;
        const height = window.innerHeight;
        const dpr = window.devicePixelRatio || 1;

        // Ensure canvas resolution matches display perfectly
        if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;
        }

        context.setTransform(dpr, 0, 0, dpr, 0, 0);

        // Background
        context.fillStyle = "#050505";
        context.fillRect(0, 0, width, height);

        // Saturation & Contrast Boost for "Clean" Look
        context.filter = "saturate(1.4) contrast(1.1) brightness(1.1)";

        // Zoom logic to hide the Veo watermark at the bottom right
        const baseScale = Math.max(width / img.width, height / img.height);
        const scale = baseScale * 1.1;

        const x = (width / 2) - (img.width / 2) * scale;
        const y = (height / 2) - (img.height / 2) * scale;

        // Draw Image
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = "high";

        context.drawImage(
            img,
            Math.round(x),
            Math.round(y),
            Math.round(img.width * scale),
            Math.round(img.height * scale)
        );

        // Reset filter
        context.filter = "none";
    };

    // 4. GSAP Scroll Animation
    useEffect(() => {
        if (!imagesLoaded) return;

        render();

        // The "Butter" Scroll: GSAP handles the frame interpolation
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: containerRef.current,
                start: "top top",
                end: "bottom bottom",
                scrub: 1.8, // Increased for a heavy, 'butter' liquid follow effect
                onUpdate: render,
            },
        });

        tl.to(airPlane.current, {
            frame: TOTAL_FRAMES,
            snap: "frame",
            ease: "none",
        });

        window.addEventListener("resize", render);

        return () => {
            window.removeEventListener("resize", render);
            ScrollTrigger.getAll().forEach(t => t.kill());
        };
    }, [imagesLoaded]);

    // Enhanced Text Animations
    useEffect(() => {
        if (!imagesLoaded) return;

        // Entrance Animations (Skip Slide 1 to keep it visible on load)
        [".slide-2", ".slide-3", ".slide-4", ".slide-5"].forEach((slide) => {
            const h = `${slide} h1, ${slide} h2`;
            const p = `${slide} p, ${slide} span, ${slide} .tech-bar`;

            gsap.fromTo(h,
                { opacity: 0, y: 40, filter: "blur(15px)", scale: 0.95 },
                {
                    opacity: 1, y: 0, filter: "blur(0px)", scale: 1,
                    duration: 1.5, ease: "power4.out",
                    scrollTrigger: { trigger: slide, start: "top 85%", end: "top 45%", scrub: 1 }
                }
            );

            gsap.fromTo(p,
                { opacity: 0, y: 20 },
                {
                    opacity: 0.6, y: 0, duration: 1, stagger: 0.1,
                    scrollTrigger: { trigger: slide, start: "top 80%", end: "top 50%", scrub: 1 }
                }
            );
        });

        // Exit Animation for Slide 1 (Special timing to stay visible initially)
        gsap.to(".slide-1", {
            opacity: 0, y: -60, filter: "blur(20px)",
            scrollTrigger: {
                trigger: ".slide-1",
                start: "top -20%", // Delay exit until it moves up 20%
                end: "top -60%",
                scrub: 1
            }
        });

        // Exit Animations (Remaining slides, excluding final slide)
        [".slide-2", ".slide-3", ".slide-4"].forEach((slide) => {
            gsap.to(slide, {
                opacity: 0, y: -60, filter: "blur(20px)",
                scrollTrigger: { trigger: slide, start: "top 10%", end: "top -10%", scrub: 1 }
            });
        });
    }, [imagesLoaded]);

    return (
        <div ref={containerRef} className="relative w-full h-[900vh] bg-[#050505] selection:bg-white selection:text-black">
            {/* Top Navigation Overlay */}
            <header className="fixed top-0 inset-x-0 h-24 px-12 z-[70] flex items-center justify-between pointer-events-none">
                <div className="flex items-center gap-4">
                    <div className="text-white text-xl font-thin tracking-[0.8em] uppercase opacity-90 drop-shadow-2xl">
                        Arthik
                    </div>
                </div>

                <div className="flex items-center gap-8 pointer-events-auto">
                    <button
                        onClick={() => navigate("/login")}
                        className="text-white/40 text-[10px] tracking-[0.6em] uppercase hover:text-white transition-all duration-500 flex items-center gap-3 group"
                    >
                        <div className="w-8 h-[1px] bg-white/20 group-hover:w-12 group-hover:bg-white transition-all duration-500" />
                        Login
                    </button>
                </div>
            </header>

            {/* Scroll Progress Bar */}
            <div className="fixed right-12 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-6">
                <div className="text-[9px] text-white/20 tracking-[0.6em] uppercase vertical-text transform rotate-180" style={{ writingMode: 'vertical-rl' }}>
                    System Status: Active
                </div>
                <div className="w-[1px] h-40 bg-white/5 relative overflow-hidden">
                    <div className="absolute top-0 w-full bg-white/40 h-1/4 animate-pulse" />
                </div>
            </div>

            {/* Loading */}
            <div ref={loadingRef} className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#050505]">
                <div className="flex flex-col items-center">
                    <h2 className="text-white text-5xl font-thin tracking-[1.2em] mb-16 uppercase opacity-80">
                        Arthik
                    </h2>
                    <div className="w-96 h-[1px] bg-white/10 relative overflow-hidden">
                        <div
                            className="absolute h-full bg-white shadow-[0_0_20px_white] transition-all duration-700 ease-out"
                            style={{ width: `${loadProgress}%` }}
                        />
                    </div>
                    <div className="mt-6 text-white/20 text-[10px] tracking-[0.5em] uppercase animate-pulse">
                        Synchronising Global Nodes... {loadProgress}%
                    </div>
                </div>
            </div>

            {/* Canvas Container */}
            <div className="sticky top-0 left-0 w-full h-screen overflow-hidden">
                <canvas
                    ref={canvasRef}
                    className="w-full h-full block bg-[#050505]"
                />

                {/* Technical HUD Overlay */}
                <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#050505] to-transparent pointer-events-none z-10" />
                <div className="absolute inset-0 pointer-events-none opacity-10">
                    <div className="absolute top-10 left-10 w-20 h-[1px] bg-white" />
                    <div className="absolute top-10 left-10 w-[1px] h-20 bg-white" />
                    <div className="absolute bottom-10 right-10 w-20 h-[1px] bg-white" />
                    <div className="absolute bottom-10 right-10 w-[1px] h-20 bg-white" />
                </div>

                {/* Cinematic Vignette */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(5,5,5,0.5)_100%)] pointer-events-none" />
                <div className="absolute inset-x-0 bottom-0 h-[40vh] bg-gradient-to-t from-[#050505] to-transparent pointer-events-none z-10" />
            </div>

            {/* Story Layers - Shifted up to align first slide with first frame */}
            <div className="relative z-20 pointer-events-none -mt-[100vh]">
                {/* Slide 1: Identity / Main Frame */}
                <div className="h-screen flex items-center justify-center px-8 relative overflow-hidden">
                    {/* Background Text Accent */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
                        <span className="text-[30vw] font-bold tracking-tighter uppercase">AI AGENT</span>
                    </div>

                    <div className="slide-1 text-center relative z-10">
                        <span className="text-white/20 text-sm tracking-[1.2em] uppercase mb-10 block font-light">Next-Gen Autonomous Concierge</span>
                        <h1 className="text-9xl md:text-[14rem] font-bold text-white tracking-tighter mb-10 leading-none drop-shadow-2xl">
                            Arthik <span className="opacity-70 italic font-light text-white/90">Global</span>
                        </h1>
                        <div className="tech-bar w-64 h-[2px] bg-gradient-to-r from-transparent via-white/30 to-transparent mx-auto mb-12" />
                        <p className="text-2xl md:text-3xl text-white/80 tracking-[1.5em] uppercase font-bold mb-8 drop-shadow-md">
                            Intelligence in Motion
                        </p>
                        <p className="max-w-2xl mx-auto text-white/70 text-lg font-normal leading-relaxed tracking-wide drop-shadow-md">
                            Experience the world's first fully autonomous travel engine. Our neural agent
                            scours, negotiates, and secures premium stays tailored to your exact DNA.
                        </p>
                    </div>
                </div>

                <div className="h-screen" />

                {/* Slide 2: The Agent */}
                <div className="h-screen flex items-center justify-start px-32">
                    <div className="slide-2 max-w-2xl bg-white/[0.01] backdrop-blur-2xl p-16 rounded-[3rem] border border-white/10 relative shadow-2xl overflow-hidden group">
                        <div className="absolute top-0 right-0 p-10 text-[9px] text-white/10 font-mono tracking-widest leading-loose">
                            LOC_REF: 40.7128° N <br /> STATUS: SCANNING...
                        </div>
                        <span className="text-white/40 text-xs tracking-[0.6em] uppercase mb-8 block font-medium">01. Autonomous Discovery</span>
                        <h2 className="text-7xl md:text-8xl font-bold text-white tracking-tight mb-10 leading-tight drop-shadow-2xl">
                            Meet Your <br /> <span className="italic opacity-80 font-light">Personal Agent.</span>
                        </h2>
                        <div className="tech-bar w-64 h-[1px] bg-gradient-to-r from-white/30 to-transparent mb-12" />
                        <p className="text-white/80 text-2xl font-medium leading-relaxed mb-10 drop-shadow-lg">
                            A sophisticated neural engine that understands
                            your nuances. Our agent negotiates with global
                            vendors in real-time to find your perfect match.
                        </p>
                        <div className="flex gap-4">
                            <div className="w-1 h-1 rounded-full bg-white/40 animate-ping" />
                            <div className="w-32 h-[1px] bg-white/10 mt-auto" />
                        </div>
                    </div>
                </div>

                <div className="h-screen" />

                {/* Slide 3: Real-time Precision */}
                <div className="h-screen flex items-center justify-end px-32 text-right">
                    <div className="slide-3 max-w-2xl bg-white/[0.01] backdrop-blur-2xl p-16 rounded-[3rem] border border-white/10 relative shadow-2xl">
                        <div className="absolute top-0 left-0 p-10 text-[9px] text-white/10 font-mono tracking-widest leading-loose text-left">
                            VNDR_SYNC: ACTIVE <br /> LATENCY: 12ms
                        </div>
                        <span className="text-white/40 text-xs tracking-[0.6em] uppercase mb-8 block font-medium">02. Dynamic Inventory</span>
                        <h2 className="text-7xl md:text-8xl font-bold text-white tracking-tight mb-10 leading-tight drop-shadow-2xl">
                            Real-Time <br /> <span className="italic opacity-80 font-light">Accuracy.</span>
                        </h2>
                        <div className="tech-bar w-64 h-[1px] bg-gradient-to-l from-white/30 to-transparent mb-12 ml-auto" />
                        <p className="text-white/80 text-2xl font-medium leading-relaxed drop-shadow-lg">
                            No outdated data. Our agent talks directly
                            to vendor systems, ensuring facilities and
                            pricing are accurate to the exact second.
                        </p>
                    </div>
                </div>

                <div className="h-screen" />

                {/* Slide 4: Transactional Flow */}
                <div className="h-screen flex flex-col items-center justify-center px-8 text-center text-white">
                    <div className="slide-4 max-w-4xl">
                        <span className="text-white/30 text-xs tracking-[0.5em] uppercase mb-8 block">03. Seamless Settlement</span>
                        <h2 className="text-7xl md:text-9xl font-bold tracking-tighter mb-12 drop-shadow-2xl">
                            Effortless Booking.
                        </h2>
                        <p className="text-white/90 text-2xl font-medium mb-16 max-w-2xl mx-auto leading-relaxed drop-shadow-lg">
                            Powered by secure PayU integration. Automatic PDF transactions
                            and ranking-based selection make travel frictionless.
                        </p>
                        <button
                            onClick={() => window.location.href = '/home'}
                            className="group relative px-20 py-8 border-2 border-white/40 text-white text-base font-bold uppercase tracking-[0.8em] overflow-hidden pointer-events-auto transition-all duration-700 hover:border-white hover:bg-white hover:text-black shadow-xl backdrop-blur-md bg-white/5">
                            Start Searching
                        </button>
                    </div>
                </div>

                <div className="h-screen flex flex-col items-center justify-center px-8 text-center text-white">
                    <div className="slide-5 max-w-4xl">
                        <div className="mb-12 inline-block px-8 py-3 border border-white/20 rounded-full bg-white/5 backdrop-blur-xl">
                            <span className="text-white/80 text-[10px] tracking-[1em] uppercase font-medium">Ready to Begin?</span>
                        </div>
                        <h2 className="text-8xl md:text-[11rem] font-bold tracking-tighter mb-16 leading-tight drop-shadow-2xl">
                            Get <span className="opacity-80 italic font-light">Started.</span>
                        </h2>
                        <p className="text-white/90 text-2xl font-medium mb-20 max-w-2xl mx-auto leading-relaxed drop-shadow-lg">
                            Join the elite circle of travelers using autonomous intelligence.
                            Your personalized global journey starts here.
                        </p>
                        <button
                            onClick={() => window.location.href = '/home'}
                            className="group relative px-28 py-12 border-2 border-white/40 text-white text-base font-black uppercase tracking-[1.2em] overflow-hidden pointer-events-auto transition-all duration-1000 hover:border-white hover:bg-white hover:text-black shadow-2xl backdrop-blur-xl bg-white/10"
                        >
                            <span className="relative z-10">Enter Portal</span>
                            <div className="absolute inset-0 bg-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-700 ease-in-out" />
                        </button>
                    </div>
                </div>

                <div className="h-[20vh]" />
            </div>
        </div>
    );
};

export default ArthikScroll;
