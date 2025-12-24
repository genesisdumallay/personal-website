"use client";
import { useEffect, useRef, useCallback, useState } from "react";

interface FloatingPointsProps {
  isDark?: boolean;
}

const FloatingPoints = ({ isDark = false }: FloatingPointsProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const particlesRef = useRef<
    { x: number; y: number; z: number; radius: number }[]
  >([]);
  const directionRef = useRef({ x: 0, y: 0 });
  const isMouseMovingRef = useRef(false);
  const mouseMoveTimeout = useRef<number | null>(null);
  const dimensionsRef = useRef({ width: 0, height: 0, dpr: 1 });
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const detectMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const mobileDetected =
        /android|iphone|ipad|opera mini|mobile/i.test(userAgent) ||
        navigator.maxTouchPoints > 0;

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
    const height = Math.max(
      document.documentElement.scrollHeight,
      document.documentElement.clientHeight
    );

    dimensionsRef.current = { width, height, dpr };
    setCanvasSize({ width, height });

    canvas.width = Math.max(1, Math.floor(width * dpr));
    canvas.height = Math.max(1, Math.floor(height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const numParticles = isMobile ? 400 : 700;
    const sizeFactor = isMobile ? 0.55 : 1;

    particlesRef.current = new Array(numParticles).fill(null).map(() => ({
      x: (Math.random() - 0.5) * width * 2,
      y: (Math.random() - 0.5) * height * 1.2,
      z: Math.random() * width,
      radius: (Math.random() * 3 + 1.5) * sizeFactor,
    }));
  }, [isMobile]);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("scroll", resizeCanvas, { passive: true });
    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("scroll", resizeCanvas);
    };
  }, [resizeCanvas]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const backgroundColor = isDark ? "#1e2030" : "#f3f3f3ff";
    const particleColors = isDark
      ? {
          core: "rgba(200, 200, 200, 0.8)",
          mid: "rgba(150, 180, 200, 0.6)",
          outer: "rgba(50, 50, 100, 0)",
          glowMultiplier: 2,
        }
      : {
          core: "rgba(50, 50, 50, 0.9)",
          mid: "rgba(30, 30, 30, 0.6)",
          outer: "rgba(0, 0, 0, 0)",
          glowMultiplier: 1.5,
        };

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

      for (const p of particlesRef.current) {
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
          p.x = (Math.random() - 0.5) * width * 2;
          p.y = (Math.random() - 0.5) * height * 1.2;
          p.z = Math.max(width / 2, 1);
        }

        const scale = Math.max(300 / (p.z + 300), 0.1);
        const screenX = p.x * scale + width / 2;
        const screenY = p.y * scale + height / 2;
        let size = Math.max(p.radius * scale, 0.1);
        if (p.z > width * 0.4) size *= 1.5;

        if (!isFinite(screenX) || !isFinite(screenY) || !isFinite(size))
          continue;

        const gradient = ctx.createRadialGradient(
          screenX,
          screenY,
          0,
          screenX,
          screenY,
          size * particleColors.glowMultiplier
        );
        gradient.addColorStop(0, particleColors.core);
        gradient.addColorStop(0.2, particleColors.mid);
        gradient.addColorStop(1, particleColors.outer);

        ctx.beginPath();
        ctx.arc(screenX, screenY, size, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isDark]);

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
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: canvasSize.height ? `${canvasSize.height}px` : "100%",
        pointerEvents: "none",
        zIndex: -10,
      }}
    />
  );
};

export default FloatingPoints;
