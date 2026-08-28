"use client";

import { useEffect, useRef } from "react";

type BlobProps = {
  color: string;
  size: number;
  x: number;
  y: number;
  duration: number;
  delay: number;
};

function Blob({ color, size, x, y, duration, delay }: BlobProps) {
  return (
    <div
      className="hero-blob animate-blob-float"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        left: `${x}%`,
        top: `${y}%`,
        backgroundColor: color,
        animationDuration: `${duration}s`,
        animationDelay: `${delay}s`,
      }}
    />
  );
}

function FloatingShape({
  size,
  x,
  y,
  delay,
  duration,
  type = "circle",
}: {
  size: number;
  x: number;
  y: number;
  delay: number;
  duration: number;
  type?: "circle" | "ring" | "diamond";
}) {
  const shapeClass = {
    circle: "rounded-full",
    ring: "rounded-full border-2 border-brand-400/20",
    diamond: "rotate-45 rounded-lg",
  };

  return (
    <div
      className={`floating-shape animate-float-slow ${shapeClass[type]}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        left: `${x}%`,
        top: `${y}%`,
        background: "linear-gradient(135deg, rgba(189,127,206,0.08) 0%, rgba(117,7,135,0.04) 100%)",
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
      }}
    />
  );
}

export function HeroBackground() {
  const prefersReduced = useRef(
    typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Mesh gradient base */}
      <div className="absolute inset-0 bg-hero-mesh dark:bg-hero-mesh-dark" />

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-grid opacity-40 dark:opacity-30" />

      {/* Animated blobs (only if motion is not reduced) */}
      {!prefersReduced.current && (
        <>
          <Blob color="rgba(189,127,206,0.20)" size={400} x={5} y={15} duration={28} delay={0} />
          <Blob color="rgba(168,89,248,0.12)" size={350} x={75} y={5} duration={32} delay={2} />
          <Blob color="rgba(0,77,255,0.10)" size={380} x={45} y={65} duration={30} delay={1} />
          <Blob color="rgba(117,7,135,0.16)" size={300} x={65} y={80} duration={26} delay={3} />
          <Blob color="rgba(255,45,146,0.08)" size={320} x={15} y={75} duration={35} delay={-1} />
          <Blob color="rgba(6,182,212,0.06)" size={280} x={85} y={45} duration={38} delay={4} />
        </>
      )}

      {/* Floating geometric shapes */}
      {!prefersReduced.current && (
        <>
          <FloatingShape size={20} x={12} y={25} delay={0} duration={8} type="ring" />
          <FloatingShape size={12} x={88} y={18} delay={2} duration={10} type="circle" />
          <FloatingShape size={16} x={75} y={72} delay={1} duration={9} type="diamond" />
          <FloatingShape size={10} x={25} y={82} delay={3} duration={11} type="circle" />
          <FloatingShape size={14} x={50} y={12} delay={4} duration={7} type="ring" />
          <FloatingShape size={8} x={92} y={55} delay={2.5} duration={12} type="diamond" />
        </>
      )}

      {/* Radial vignette */}
      <div className="absolute inset-0 bg-radial-[ellipse_at_center] from-transparent via-transparent to-surface-0/50 dark:to-surface-950/60" />

      {/* Noise overlay */}
      <div className="noise-overlay" />
    </div>
  );
}

export function ParticlesBackground() {
  const prefersReduced = useRef(
    typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (prefersReduced.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
      hue: number;
    }> = [];

    const count = 50;
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * (canvas.width || 0),
        y: Math.random() * (canvas.height || 0),
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        size: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.4 + 0.1,
        hue: Math.random() > 0.5 ? 280 : Math.random() > 0.5 ? 320 : 200,
      });
    }

    let animationId: number;
    function animate() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 70%, 70%, ${p.opacity})`;
        ctx.fill();
      }

      // Draw connections between nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(189, 127, 206, ${0.06 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animationId = requestAnimationFrame(animate);
    }
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  if (prefersReduced.current) return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full"
      style={{ pointerEvents: "none" }}
      aria-hidden
    />
  );
}
