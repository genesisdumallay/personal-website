"use client";
import { useEffect, useRef, useCallback, useState } from "react";

const FloatingPoints = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef(null);
  const particlesRef = useRef<{ x: number; y: number; z: number; radius: number }[]>([]);
  const directionRef = useRef({ x: 0, y: 0 });
  const isMouseMovingRef = useRef(false);
  const mouseMoveTimeout = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const detectMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const mobileDetected =
        /android|iphone|ipad|opera mini|mobile/i.test(
          userAgent
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
    const width = document.documentElement.clientWidth;
    const height = document.documentElement.clientHeight * 1.1;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const numParticles = isMobile ? 400 : 700;
    const sizeFactor = isMobile ? 0.55 : 1;

    particlesRef.current = new Array(numParticles).fill().map(() => ({
      x: (Math.random() - 0.5) * width * 2,
      y: (Math.random() - 0.5) * height * 1.2,
      z: Math.random() * width,
      radius: (Math.random() * 3 + 1.5) * sizeFactor,
    }));
  }, [isMobile]);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, [resizeCanvas]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const animate = () => {
      ctx.fillStyle = "#15131a";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const { x: dirX, y: dirY } = directionRef.current;
      const speed = isMouseMovingRef.current ? 0.2 : 1;
      const angleX = dirX * 0.05 * speed;
      const angleY = dirY * 0.1 * speed;
      const cosX = Math.cos(angleX), sinX = Math.sin(angleX);
      const cosY = Math.cos(angleY), sinY = Math.sin(angleY);

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
        if (p.z < -canvas.width / 2) {
          p.x = (Math.random() - 0.5) * canvas.width * 2;
          p.y = (Math.random() - 0.5) * canvas.height * 1.2;
          p.z = Math.max(canvas.width / 2, 1);
        }

        const scale = Math.max(300 / (p.z + 300), 0.1);
        const screenX = p.x * scale + canvas.width / 2;
        const screenY = p.y * scale + canvas.height / 2;
        let size = Math.max(p.radius * scale, 0.1);
        if (p.z > canvas.width * 0.4) size *= 1.5;

        if (!isFinite(screenX) || !isFinite(screenY) || !isFinite(size)) continue;

        const gradient = ctx.createRadialGradient(screenX, screenY, 0, screenX, screenY, size * 2);
        gradient.addColorStop(0, "rgba(200, 200, 200, 0.8)");
        gradient.addColorStop(0.2, "rgba(150, 180, 200, 0.6)");
        gradient.addColorStop(1, "rgba(50, 50, 100, 0)");

        ctx.beginPath();
        ctx.arc(screenX, screenY, size, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animationRef.current);
  }, []);

  const handleMouseMove = useCallback(
    (event) => {
      if (isMobile) return;
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 3;
      directionRef.current.x += ((event.clientX - centerX) * 0.005 - directionRef.current.x) * 0.3;
      directionRef.current.y += ((event.clientY - centerY) * 0.01 - directionRef.current.y) * 0.3;
      isMouseMovingRef.current = true;
      clearTimeout(mouseMoveTimeout.current);
      mouseMoveTimeout.current = setTimeout(() => {
        isMouseMovingRef.current = false;
      }, 50);
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
        height: "100vh",
        pointerEvents: "none",
        zIndex: "-10",
        background: "#15131a"
      }}
    />
  );
};

export default FloatingPoints;
