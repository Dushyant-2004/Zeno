"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

export default function ParticleBackground() {
  const [mounted, setMounted] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Track mouse for interactive lighting
  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", handleMouse);
    return () => window.removeEventListener("mousemove", handleMouse);
  }, []);

  // Advanced neural network canvas with interactive particles
  useEffect(() => {
    if (!mounted) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    interface Node {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      color: string;
      pulsePhase: number;
    }

    const nodes: Node[] = [];
    const colors = [
      "0, 240, 255",   // cyan
      "191, 90, 242",  // purple
      "94, 92, 230",   // blue
      "255, 55, 95",   // red/pink
      "48, 209, 88",   // green
    ];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Create more particles
    for (let i = 0; i < 60; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        radius: Math.random() * 2.5 + 0.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        pulsePhase: Math.random() * Math.PI * 2,
      });
    }

    const animate = () => {
      time += 0.008;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw subtle grid
      ctx.strokeStyle = "rgba(255,255,255,0.012)";
      ctx.lineWidth = 0.5;
      const gridSize = 60;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      // Update and draw nodes
      nodes.forEach((node) => {
        node.x += node.vx;
        node.y += node.vy;

        // Bounce off edges with padding
        if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1;

        // Subtle mouse attraction
        const dxm = mx - node.x;
        const dym = my - node.y;
        const distMouse = Math.sqrt(dxm * dxm + dym * dym);
        if (distMouse < 200) {
          node.vx += dxm * 0.00003;
          node.vy += dym * 0.00003;
        }

        // Damping
        node.vx *= 0.999;
        node.vy *= 0.999;

        // Pulse
        const pulse = Math.sin(time * 2 + node.pulsePhase) * 0.5 + 0.5;
        const r = node.radius * (1 + pulse * 0.5);

        // Glow
        const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, r * 8);
        gradient.addColorStop(0, `rgba(${node.color}, ${0.6 + pulse * 0.3})`);
        gradient.addColorStop(0.5, `rgba(${node.color}, 0.05)`);
        gradient.addColorStop(1, `rgba(${node.color}, 0)`);
        ctx.beginPath();
        ctx.arc(node.x, node.y, r * 8, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Core
        ctx.beginPath();
        ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${node.color}, ${0.7 + pulse * 0.3})`;
        ctx.fill();
      });

      // Draw connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 180) {
            const alpha = (1 - dist / 180) * 0.12;
            const grad = ctx.createLinearGradient(nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y);
            grad.addColorStop(0, `rgba(${nodes[i].color}, ${alpha})`);
            grad.addColorStop(1, `rgba(${nodes[j].color}, ${alpha})`);
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = grad;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      animationId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, [mounted]);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Mesh gradient base */}
      <div className="absolute inset-0 mesh-gradient" />

      {/* Interactive canvas */}
      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* Aurora blobs */}
      <motion.div
        className="absolute -top-[300px] -right-[200px] w-[700px] h-[700px] rounded-full opacity-30"
        style={{
          background: "radial-gradient(circle, rgba(0,240,255,0.15) 0%, rgba(191,90,242,0.08) 40%, transparent 70%)",
          filter: "blur(60px)",
        }}
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 50, 0],
          y: [0, -30, 0],
          rotate: [0, 15, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute -bottom-[300px] -left-[200px] w-[600px] h-[600px] rounded-full opacity-25"
        style={{
          background: "radial-gradient(circle, rgba(191,90,242,0.15) 0%, rgba(255,55,95,0.08) 40%, transparent 70%)",
          filter: "blur(60px)",
        }}
        animate={{
          scale: [1, 1.15, 1],
          x: [0, -30, 0],
          y: [0, 40, 0],
          rotate: [0, -10, 0],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute top-1/3 left-1/4 w-[500px] h-[500px] rounded-full opacity-15"
        style={{
          background: "radial-gradient(circle, rgba(94,92,230,0.12) 0%, transparent 60%)",
          filter: "blur(80px)",
        }}
        animate={{
          scale: [1, 1.4, 1],
          x: [0, 80, 0],
          y: [0, -40, 0],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Scanline overlay */}
      <div className="absolute inset-0 scanline opacity-50" />

      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at center, transparent 50%, rgba(3,7,18,0.5) 100%)",
        }}
      />
    </div>
  );
}
