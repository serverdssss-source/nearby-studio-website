import React, { lazy, Suspense, useRef, useEffect, useState, memo, useCallback } from 'react';
import { Renderer, Program, Triangle, Mesh } from 'ogl';
const SplashCursor = lazy(() => import('./SplashCursor'));

/* =========================
   LightRays Component
========================= */

const DEFAULT_COLOR = '#00C2A8';

const hexToRgb = (hex) => {
    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return m
        ? [
            parseInt(m[1], 16) / 255,
            parseInt(m[2], 16) / 255,
            parseInt(m[3], 16) / 255,
        ]
        : [1, 1, 1];
};

const getAnchorAndDir = (origin, w, h) => {
    const outside = 0.2;
    switch (origin) {
        case 'top-left':
            return { anchor: [0, -outside * h], dir: [0, 1] };
        case 'top-right':
            return { anchor: [w, -outside * h], dir: [0, 1] };
        case 'left':
            return { anchor: [-outside * w, 0.5 * h], dir: [1, 0] };
        case 'right':
            return { anchor: [(1 + outside) * w, 0.5 * h], dir: [-1, 0] };
        case 'bottom-left':
            return { anchor: [0, (1 + outside) * h], dir: [0, -1] };
        case 'bottom-center':
            return { anchor: [0.5 * w, (1 + outside) * h], dir: [0, -1] };
        case 'bottom-right':
            return { anchor: [w, (1 + outside) * h], dir: [0, -1] };
        default:
            return { anchor: [0.5 * w, -outside * h], dir: [0, 1] };
    }
};

const LightRays = memo(({
    raysOrigin = 'top-center',
    raysColor = DEFAULT_COLOR,
    raysSpeed = 1,
    lightSpread = 1,
    rayLength = 2,
    pulsating = false,
    fadeDistance = 1.0,
    saturation = 1.0,
    followMouse = true,
    mouseInfluence = 0.1,
    noiseAmount = 0.0,
    distortion = 0.0,
    className = '',
}) => {
    const containerRef = useRef(null);
    const uniformsRef = useRef(null);
    const rendererRef = useRef(null);
    const mouseRef = useRef({ x: 0.5, y: 0.5 });
    const smoothMouseRef = useRef({ x: 0.5, y: 0.5 });
    const animationIdRef = useRef(null);
    const meshRef = useRef(null);
    const cleanupFunctionRef = useRef(null);
    const isInViewportRef = useRef(true);
    const isTabVisibleRef = useRef(true);
    const isAnimatingRef = useRef(false);

    /* =========================
       WebGL Setup
    ========================= */

    useEffect(() => {
        if (!containerRef.current) return;

        if (cleanupFunctionRef.current) {
            cleanupFunctionRef.current();
            cleanupFunctionRef.current = null;
        }

        const initializeWebGL = async () => {
            const renderer = new Renderer({
                dpr: Math.min(window.devicePixelRatio, 2),
                alpha: true,
            });

            rendererRef.current = renderer;
            const gl = renderer.gl;

            gl.canvas.style.width = '100%';
            gl.canvas.style.height = '100%';

            containerRef.current.innerHTML = '';
            containerRef.current.appendChild(gl.canvas);

            const vert = `
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}`;

            const frag = `
precision highp float;

uniform float iTime;
uniform vec2  iResolution;
uniform vec2  rayPos;
uniform vec2  rayDir;
uniform vec3  raysColor;
uniform float raysSpeed;
uniform float lightSpread;
uniform float rayLength;
uniform float pulsating;
uniform float fadeDistance;
uniform float saturation;
uniform vec2  mousePos;
uniform float mouseInfluence;
uniform float noiseAmount;
uniform float distortion;

varying vec2 vUv;

float noise(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

float rayStrength(vec2 raySource, vec2 rayRefDirection, vec2 coord,
                  float seedA, float seedB, float speed) {
  vec2 sourceToCoord = coord - raySource;
  vec2 dirNorm = normalize(sourceToCoord);
  float cosAngle = dot(dirNorm, rayRefDirection);

  float distortedAngle = cosAngle + distortion * 
    sin(iTime * 2.0 + length(sourceToCoord) * 0.01) * 0.2;

  float spreadFactor = pow(max(distortedAngle, 0.0), 
    1.0 / max(lightSpread, 0.001));

  float distance = length(sourceToCoord);
  float maxDistance = iResolution.x * rayLength;
  float lengthFalloff = clamp((maxDistance - distance) / maxDistance, 0.0, 1.0);

  float pulse = pulsating > 0.5
    ? (0.8 + 0.2 * sin(iTime * speed * 3.0))
    : 1.0;

  float baseStrength = clamp(
    (0.45 + 0.15 * sin(distortedAngle * seedA + iTime * speed)) +
    (0.3 + 0.2 * cos(-distortedAngle * seedB + iTime * speed)),
    0.0, 1.0
  );

  return baseStrength * lengthFalloff * spreadFactor * pulse;
}

void main() {
  vec2 coord = vec2(gl_FragCoord.x, iResolution.y - gl_FragCoord.y);

  vec2 finalRayDir = rayDir;
  if (mouseInfluence > 0.0) {
    vec2 mouseScreenPos = mousePos * iResolution.xy;
    vec2 mouseDirection = normalize(mouseScreenPos - rayPos);
    finalRayDir = normalize(mix(rayDir, mouseDirection, mouseInfluence));
  }

  float strength = rayStrength(rayPos, finalRayDir, coord, 
                                36.2, 21.1, 1.5 * raysSpeed);

  vec3 color = strength * raysColor;

  if (saturation != 1.0) {
    float gray = dot(color, vec3(0.299, 0.587, 0.114));
    color = mix(vec3(gray), color, saturation);
  }

  gl_FragColor = vec4(color, strength);
}`;

            const uniforms = {
                iTime: { value: 0 },
                iResolution: { value: [1, 1] },
                rayPos: { value: [0, 0] },
                rayDir: { value: [0, 1] },
                raysColor: { value: hexToRgb(raysColor) },
                raysSpeed: { value: raysSpeed },
                lightSpread: { value: lightSpread },
                rayLength: { value: rayLength },
                pulsating: { value: pulsating ? 1.0 : 0.0 },
                fadeDistance: { value: fadeDistance },
                saturation: { value: saturation },
                mousePos: { value: [0.5, 0.5] },
                mouseInfluence: { value: mouseInfluence },
                noiseAmount: { value: noiseAmount },
                distortion: { value: distortion },
            };

            uniformsRef.current = uniforms;

            const geometry = new Triangle(gl);
            const program = new Program(gl, {
                vertex: vert,
                fragment: frag,
                uniforms,
            });

            const mesh = new Mesh(gl, { geometry, program });
            meshRef.current = mesh;

            const updatePlacement = () => {
                const { clientWidth, clientHeight } = containerRef.current;
                renderer.setSize(clientWidth, clientHeight);

                const dpr = renderer.dpr;
                const { anchor, dir } = getAnchorAndDir(
                    raysOrigin,
                    clientWidth * dpr,
                    clientHeight * dpr
                );

                uniforms.iResolution.value = [
                    clientWidth * dpr,
                    clientHeight * dpr,
                ];
                uniforms.rayPos.value = anchor;
                uniforms.rayDir.value = dir;
            };

            const isActive = () => isInViewportRef.current && isTabVisibleRef.current;

            const loop = (t) => {
                if (!isActive()) {
                    isAnimatingRef.current = false;
                    animationIdRef.current = null;
                    return;
                }
                uniforms.iTime.value = t * 0.001;

                if (followMouse) {
                    const smoothing = 0.92;
                    smoothMouseRef.current.x =
                        smoothMouseRef.current.x * smoothing +
                        mouseRef.current.x * (1 - smoothing);
                    smoothMouseRef.current.y =
                        smoothMouseRef.current.y * smoothing +
                        mouseRef.current.y * (1 - smoothing);

                    uniforms.mousePos.value = [
                        smoothMouseRef.current.x,
                        smoothMouseRef.current.y,
                    ];
                }

                renderer.render({ scene: mesh });
                animationIdRef.current = requestAnimationFrame(loop);
            };

            const startLoop = () => {
                if (isAnimatingRef.current || !isActive()) return;
                isAnimatingRef.current = true;
                animationIdRef.current = requestAnimationFrame(loop);
            };

            const stopLoop = () => {
                isAnimatingRef.current = false;
                if (animationIdRef.current !== null) {
                    cancelAnimationFrame(animationIdRef.current);
                    animationIdRef.current = null;
                }
            };

            const observer = new IntersectionObserver(
                ([entry]) => {
                    isInViewportRef.current = Boolean(entry?.isIntersecting);
                    if (isActive()) startLoop();
                    else stopLoop();
                },
                { threshold: 0.01 }
            );
            observer.observe(containerRef.current);

            const handleVisibilityChange = () => {
                isTabVisibleRef.current = document.visibilityState === 'visible';
                if (isActive()) startLoop();
                else stopLoop();
            };
            document.addEventListener('visibilitychange', handleVisibilityChange);
            handleVisibilityChange();

            requestAnimationFrame(() => {
                if (containerRef.current) updatePlacement();
            });
            window.addEventListener('resize', updatePlacement);
            startLoop();

            cleanupFunctionRef.current = () => {
                stopLoop();
                observer.disconnect();
                document.removeEventListener('visibilitychange', handleVisibilityChange);
                window.removeEventListener('resize', updatePlacement);
                renderer.gl.getExtension('WEBGL_lose_context')?.loseContext();
                renderer.gl.canvas.remove();
            };
        };

        initializeWebGL();

        return () => cleanupFunctionRef.current?.();
    }, []);

    /* =========================
       Mouse Tracking
    ========================= */

    useEffect(() => {
        if (!followMouse) return;

        const handleMouseMove = (e) => {
            const rect = containerRef.current?.getBoundingClientRect();
            if (!rect) return;
            mouseRef.current = {
                x: (e.clientX - rect.left) / rect.width,
                y: (e.clientY - rect.top) / rect.height,
            };
        };

        window.addEventListener('mousemove', handleMouseMove, { passive: true });
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [followMouse]);

    return (
        <div
            ref={containerRef}
            className={`w-full h-full pointer-events-none overflow-hidden relative ${className}`}
        />
    );
});

LightRays.displayName = 'LightRays';

/* =========================
   Example Usage Wrapper
========================= */

const Hero_1 = memo(function Hero_1() {
    const [isMobile, setIsMobile] = useState(
        () => typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches
    );
    const [isIOS, setIsIOS] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(max-width: 767px)');
        const handleChange = (event) => setIsMobile(event.matches);

        // Keep state synced on mount too.
        setIsMobile(mediaQuery.matches);
        
        // Detect iOS
        const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        setIsIOS(iOS);

        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener('change', handleChange);
            return () => mediaQuery.removeEventListener('change', handleChange);
        }

        // Safari fallback
        mediaQuery.addListener(handleChange);
        return () => mediaQuery.removeListener(handleChange);
    }, []);

    const videoRef = useRef(null);
    const [showCursor, setShowCursor] = useState(false);

    useEffect(() => {
        let idleId;
        let timeoutId;

        const enableHeavyEffects = () => {
            if (!isMobile) {
                setShowCursor(true);
            }
        };

        if ('requestIdleCallback' in window) {
            idleId = window.requestIdleCallback(enableHeavyEffects, { timeout: 600 });
        } else {
            timeoutId = window.setTimeout(enableHeavyEffects, 250);
        }

        return () => {
            if (idleId) window.cancelIdleCallback(idleId);
            if (timeoutId) window.clearTimeout(timeoutId);
        };
    }, [isMobile]);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleLoaded = () => {
            video.currentTime = 0;
            video.play();
        };

        const handleTimeUpdate = () => {
            if (video.currentTime >= 5) {
                video.currentTime = 0;
            }
        };

        video.addEventListener("loadedmetadata", handleLoaded);
        video.addEventListener("timeupdate", handleTimeUpdate);

        return () => {
            video.removeEventListener("loadedmetadata", handleLoaded);
            video.removeEventListener("timeupdate", handleTimeUpdate);
        };
    }, []);

    return (
        <>
            <style>{`
                @keyframes zoomIn {
                    0% {
                        opacity: 0;
                        transform: scale(0.5);
                    }
                    100% {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
            `}</style>
            <div
                style={{
                    width: '100%',
                    height: '80vh',
                    position: 'relative',
                    background: '#0F0F12',
                }}
            >
            {!isMobile && showCursor && (
                <Suspense fallback={null}>
                    <SplashCursor />
                </Suspense>
            )}
            {/* Light Rays Background */}
            <LightRays
                raysOrigin={isMobile ? "center" : "top-center"}
                raysColor="#00C2A8"
                raysSpeed={isMobile ? 0.8 : 1}
                lightSpread={isMobile ? 0.35 : 0.5}
                rayLength={isMobile ? 3 : 1}
                mouseInfluence={isMobile ? 0.4 : 0.4}
                noiseAmount={0}
                distortion={0}
                pulsating={false}
                fadeDistance={isMobile ? 0.85 : 1}
                saturation={1}
            />

            {/* Center Logo */}
            <div
                style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10,
                    pointerEvents: 'auto',
                }}
            >
                {isMobile && isIOS ? (
                    <img
                        src="/Nearby studio_white.webp"
                        alt="Nearby Studio"
                        style={{
                            width: "clamp(200px, 70vw, 300px)",
                            mixBlendMode: "screen",
                            background: "transparent",
                            animation: 'zoomIn 1.5s ease-out',
                        }}
                    />
                ) : (
                    <video
                        ref={videoRef}
                        src="/nearby alpha logo.webm"
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="auto"
                        fetchPriority="high"
                        style={{
                            width: "clamp(280px, 80vw, 600px)",
                            mixBlendMode: "screen",
                            background: "transparent",
                        }}
                    />
                )}
            </div>

            {/* Bottom Text */}
            <div
                style={{
                    position: 'absolute',
                    bottom: '20px',
                    width: '100%',
                    textAlign: 'center',
                }}
            >
                <span style={{ color: '#F5F5F3' }}>
                    a Studio Floor by{' '}
                    <a
                        href="https://sripadastudios.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            fontWeight: 700,
                            textDecoration: 'none',
                            color: 'inherit',
                            cursor: 'pointer',
                        }}
                    >
                        Sripada Studios
                    </a>
                </span>
            </div>
        </div>
        </>
    );
});

export default Hero_1;
