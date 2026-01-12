"use client";
import { useEffect, useRef, useCallback, useState, useMemo, memo } from "react";

interface FloatingPointsProps {
  isDark?: boolean;
}

interface ParticleColors {
  core: string;
  mid: string;
  outer: string;
  glowMultiplier: number;
}

const DARK_COLORS: ParticleColors = {
  core: "rgba(200, 200, 200, 0.8)",
  mid: "rgba(150, 180, 200, 0.6)",
  outer: "rgba(50, 50, 100, 0)",
  glowMultiplier: 2,
};

const LIGHT_COLORS: ParticleColors = {
  core: "rgba(50, 50, 50, 0.9)",
  mid: "rgba(30, 30, 30, 0.6)",
  outer: "rgba(0, 0, 0, 0)",
  glowMultiplier: 1.5,
};

const FloatingPoints = memo(function FloatingPoints({
  isDark = false,
}: FloatingPointsProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const particlesRef = useRef<
    { x: number; y: number; z: number; radius: number }[]
  >([]);
  const directionRef = useRef({ x: 0, y: 0 });
  const isMouseMovingRef = useRef(false);
  const mouseMoveTimeout = useRef<number | null>(null);
  const dimensionsRef = useRef({ width: 0, height: 0, dpr: 1 });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const detectMobile = () => {
      const mobileDetected =
        /android|iphone|ipad|opera mini|mobile/i.test(
          navigator.userAgent.toLowerCase()
        ) || navigator.maxTouchPoints > 0;
      setIsMobile(mobileDetected);
    };

    detectMobile();
    window.addEventListener("resize", detectMobile);
    return () => window.removeEventListener("resize", detectMobile);
  }, []);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio, 2);
    const width = window.innerWidth || document.documentElement.clientWidth;
    const height = window.innerHeight;

    dimensionsRef.current = { width, height, dpr };

    canvas.width = Math.max(1, Math.floor(width * dpr));
    canvas.height = Math.max(1, Math.floor(height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const numParticles = isMobile ? 400 : 700;
    const sizeFactor = isMobile ? 0.55 : 1;

    const virtualWidth = Math.max(width, 1200);
    const virtualHeight = Math.max(height, 800);

    particlesRef.current = Array.from({ length: numParticles }, () => ({
      x: (Math.random() - 0.5) * virtualWidth * 2,
      y: (Math.random() - 0.5) * virtualHeight * 1.2,
      z: Math.random() * virtualWidth,
      radius: (Math.random() * 3 + 1.5) * sizeFactor,
    }));
  }, [isMobile]);

  useEffect(() => {
    resizeCanvas();
    let resizeTimer: number;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(resizeCanvas, 200);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimer);
    };
  }, [resizeCanvas]);

  const particleColors = useMemo(
    () => (isDark ? DARK_COLORS : LIGHT_COLORS),
    [isDark]
  );

  const backgroundColor = useMemo(
    () => (isDark ? "#1e2030" : "rgba(255,255,255,0.6)"),
    [isDark]
  );

  const particleSpriteRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const sprite = document.createElement("canvas");
    sprite.width = 128;
    sprite.height = 128;
    const sCtx = sprite.getContext("2d");
    if (sCtx) {
      const half = 64;
      const gradient = sCtx.createRadialGradient(
        half,
        half,
        0,
        half,
        half,
        half
      );
      gradient.addColorStop(0, particleColors.core);
      gradient.addColorStop(0.2, particleColors.mid);
      gradient.addColorStop(1, particleColors.outer);

      sCtx.fillStyle = gradient;
      sCtx.beginPath();
      sCtx.arc(
        half,
        half,
        half / particleColors.glowMultiplier,
        0,
        Math.PI * 2
      );
      sCtx.fill();
    }
    particleSpriteRef.current = sprite;
  }, [particleColors]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const animate = () => {
      const { width, height } = dimensionsRef.current;
      if (width === 0 || height === 0) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, width, height);

      const { x: dirX, y: dirY } = directionRef.current;
      const speed = isMouseMovingRef.current ? 0.03 : 0.06;
      const angleX = dirX * 0.12 * speed;
      const angleY = dirY * 0.12 * speed;
      const cosX = Math.cos(angleX),
        sinX = Math.sin(angleX),
        cosY = Math.cos(angleY),
        sinY = Math.sin(angleY);

      const particles = particlesRef.current;
      const colors = particleColors;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (isMouseMovingRef.current) {
          const tempX = p.x * cosX - p.z * sinX;
          p.z = p.x * sinX + p.z * cosX;
          p.x = tempX;

          const tempY = p.y * cosY - p.z * sinY;
          p.z = p.y * sinY + p.z * cosY;
          p.y = tempY;
        }

        p.z -= 2 * speed;
        if (p.z < -width / 2) {
          const virtualWidth = Math.max(width, 1200);
          const virtualHeight = Math.max(height, 800);
          p.x = (Math.random() - 0.5) * virtualWidth * 2;
          p.y = (Math.random() - 0.5) * virtualHeight * 1.2;
          p.z = Math.max(virtualWidth / 2, 1);
        }

        const scale = Math.max(300 / (p.z + 300), 0.1);
        const screenX = p.x * scale + width / 2;
        const screenY = p.y * scale + height / 2;
        let pSize = Math.max(p.radius * scale, 0.1);
        if (p.z > width * 0.4) pSize *= 1.5;

        if (!isFinite(screenX) || !isFinite(screenY) || !isFinite(pSize))
          continue;

        if (particleSpriteRef.current) {
          const drawSize = pSize * particleColors.glowMultiplier;
          ctx.drawImage(
            particleSpriteRef.current,
            screenX - drawSize,
            screenY - drawSize,
            drawSize * 2,
            drawSize * 2
          );
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [backgroundColor, particleColors]);

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (isMobile) return;

      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const targetX = (event.clientX - centerX) * 0.006;
      const targetY = (event.clientY - centerY) * 0.006;
      directionRef.current.x += (targetX - directionRef.current.x) * 0.6;
      directionRef.current.y += (targetY - directionRef.current.y) * 0.6;
      isMouseMovingRef.current = true;

      if (mouseMoveTimeout.current !== null) {
        clearTimeout(mouseMoveTimeout.current);
      }
      mouseMoveTimeout.current = window.setTimeout(() => {
        isMouseMovingRef.current = false;
      }, 100);
    },
    [isMobile]
  );

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (mouseMoveTimeout.current !== null) {
        clearTimeout(mouseMoveTimeout.current);
      }
    };
  }, [handleMouseMove]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100vh",
        pointerEvents: "none",
        zIndex: -10,
      }}
    />
  );
});

export default FloatingPoints;
