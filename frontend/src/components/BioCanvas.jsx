"use client";
import { useEffect, useRef, useState, useCallback } from 'react';

class Particle {
  constructor(x, y, type, canvasWidth, canvasHeight) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 0.5;
    this.vy = (Math.random() - 0.5) * 0.5;
    this.type = type;
    this.size = type === 'dna' ? 35 : type === 'molecule' ? 30 : type === 'atom' ? 20 : type === 'glucose' ? 30 : 25;
    this.originalSize = this.size;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.angle = Math.random() * Math.PI * 2;
    this.rotationSpeed = (Math.random() - 0.5) * 0.02;
    this.opacity = 0.5 + Math.random() * 0.3;
    this.originalOpacity = this.opacity;
    this.phase = Math.random() * Math.PI * 2;
    this.pulseSpeed = 0.02 + Math.random() * 0.02;
    this.clicked = false;
    this.clickScale = 1;
    this.clickOpacity = 1;
    this.spawnedParticles = [];
    this.isHovered = false;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.angle += this.rotationSpeed;
    this.phase += this.pulseSpeed;

    if (this.x < -this.size) this.x = this.canvasWidth + this.size;
    if (this.x > this.canvasWidth + this.size) this.x = -this.size;
    if (this.y < -this.size) this.y = this.canvasHeight + this.size;
    if (this.y > this.canvasHeight + this.size) this.y = -this.size;

    if (this.clicked) {
      this.clickScale += 0.08;
      this.clickOpacity -= 0.02;
      if (this.clickOpacity <= 0) {
        this.clicked = false;
        this.clickScale = 1;
        this.clickOpacity = 1;
      }
    }

    this.spawnedParticles = this.spawnedParticles.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.02;
      p.size *= 0.98;
      return p.life > 0;
    });
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    let scale = this.clicked ? this.clickScale : (1 + Math.sin(this.phase) * 0.08);
    if (this.isHovered) scale *= 1.15;
    
    const opacity = this.clicked ? this.clickOpacity * this.opacity : this.opacity;

    switch (this.type) {
      case 'dna':
        this.drawDNA(ctx, scale, opacity);
        break;
      case 'molecule':
        this.drawMolecule(ctx, scale, opacity);
        break;
      case 'atom':
        this.drawAtom(ctx, scale, opacity);
        break;
      case 'glucose':
        this.drawGlucose(ctx, scale, opacity);
        break;
      case 'protein':
        this.drawProtein(ctx, scale, opacity);
        break;
    }

    ctx.restore();

    this.spawnedParticles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.r}, ${p.g}, ${p.b}, ${p.life})`;
      ctx.fill();
    });
  }

  drawDNA(ctx, scale, opacity) {
    const s = this.size * scale;
    ctx.strokeStyle = `rgba(16, 185, 129, ${opacity})`;
    ctx.lineWidth = 2;

    ctx.beginPath();
    for (let i = 0; i <= 10; i++) {
      const t = i / 10;
      const y = -s / 2 + t * s;
      const x = Math.sin(t * Math.PI * 2 + this.phase) * s * 0.4;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    ctx.beginPath();
    for (let i = 0; i <= 10; i++) {
      const t = i / 10;
      const y = -s / 2 + t * s;
      const x = -Math.sin(t * Math.PI * 2 + this.phase) * s * 0.4;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    ctx.strokeStyle = `rgba(6, 182, 212, ${opacity * 0.6})`;
    for (let i = 0; i <= 10; i += 2) {
      const t = i / 10;
      const y = -s / 2 + t * s;
      const x1 = Math.sin(t * Math.PI * 2 + this.phase) * s * 0.4;
      const x2 = -Math.sin(t * Math.PI * 2 + this.phase) * s * 0.4;
      ctx.beginPath();
      ctx.moveTo(x1, y);
      ctx.lineTo(x2, y);
      ctx.stroke();
    }
  }

  drawMolecule(ctx, scale, opacity) {
    const s = this.size * scale;
    const atoms = 6;
    const radius = s * 0.6;

    ctx.strokeStyle = `rgba(59, 130, 246, ${opacity * 0.5})`;
    ctx.lineWidth = 1.5;
    for (let i = 0; i < atoms; i++) {
      const angle = (i / atoms) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
      ctx.stroke();
    }

    for (let i = 0; i < atoms; i++) {
      const angle = (i / atoms) * Math.PI * 2;
      const ax = Math.cos(angle) * radius;
      const ay = Math.sin(angle) * radius;
      
      ctx.beginPath();
      ctx.arc(ax, ay, s * 0.15, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(139, 92, 246, ${opacity})`;
      ctx.fill();
    }

    ctx.beginPath();
    ctx.arc(0, 0, s * 0.2, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(236, 72, 153, ${opacity})`;
    ctx.fill();
  }

  drawAtom(ctx, scale, opacity) {
    const s = this.size * scale;
    const orbits = 3;

    for (let i = 0; i < orbits; i++) {
      const orbitAngle = (i / orbits) * Math.PI * 2 + this.phase;
      ctx.save();
      ctx.rotate(orbitAngle);
      
      ctx.beginPath();
      ctx.ellipse(0, 0, s * 0.8, s * 0.3, 0, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(6, 182, 212, ${opacity * 0.4})`;
      ctx.lineWidth = 1;
      ctx.stroke();

      const electronAngle = this.phase * 2 + i;
      const ex = Math.cos(electronAngle) * s * 0.8;
      const ey = Math.sin(electronAngle) * s * 0.3;
      ctx.beginPath();
      ctx.arc(ex, ey, 2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(6, 182, 212, ${opacity})`;
      ctx.fill();

      ctx.restore();
    }

    ctx.beginPath();
    ctx.arc(0, 0, s * 0.25, 0, Math.PI * 2);
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, s * 0.25);
    gradient.addColorStop(0, `rgba(16, 185, 129, ${opacity})`);
    gradient.addColorStop(1, `rgba(16, 185, 129, ${opacity * 0.5})`);
    ctx.fillStyle = gradient;
    ctx.fill();
  }

  drawGlucose(ctx, scale, opacity) {
    const s = this.size * scale;
    const vertices = 6;

    ctx.beginPath();
    for (let i = 0; i < vertices; i++) {
      const angle = (i / vertices) * Math.PI * 2 - Math.PI / 2;
      const x = Math.cos(angle) * s * 0.6;
      const y = Math.sin(angle) * s * 0.5;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = `rgba(16, 185, 129, ${opacity})`;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = `rgba(16, 185, 129, ${opacity * 0.1})`;
    ctx.fill();

    for (let i = 0; i < vertices; i++) {
      const angle = (i / vertices) * Math.PI * 2 - Math.PI / 2;
      const x = Math.cos(angle) * s * 0.6;
      const y = Math.sin(angle) * s * 0.5;
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(245, 158, 11, ${opacity})`;
      ctx.fill();
    }
  }

  drawProtein(ctx, scale, opacity) {
    const s = this.size * scale;
    
    ctx.beginPath();
    for (let i = 0; i <= 360; i += 10) {
      const angle = (i * Math.PI) / 180;
      const r = s * 0.5 + Math.sin(angle * 4 + this.phase) * s * 0.1;
      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = `rgba(168, 85, 247, ${opacity * 0.3})`;
    ctx.fill();
    ctx.strokeStyle = `rgba(168, 85, 247, ${opacity})`;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  isPointInside(px, py) {
    const dx = px - this.x;
    const dy = py - this.y;
    return Math.sqrt(dx * dx + dy * dy) < this.size * 1.5;
  }

  onClick() {
    this.clicked = true;
    this.clickScale = 1;
    this.clickOpacity = 1;

    const colors = [
      { r: 16, g: 185, b: 129 },
      { r: 6, g: 182, b: 212 },
      { r: 59, g: 130, b: 246 },
      { r: 139, g: 92, b: 246 },
      { r: 236, g: 72, b: 153 },
    ];

    for (let i = 0; i < 25; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 5;
      const color = colors[Math.floor(Math.random() * colors.length)];
      this.spawnedParticles.push({
        x: this.x,
        y: this.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 4 + Math.random() * 5,
        life: 1,
        r: color.r,
        g: color.g,
        b: color.b,
      });
    }
  }
}

export default function BioCanvas({ isCanvasMode, onExitCanvas }) {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const animationRef = useRef(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const ripplesRef = useRef([]);

  const initParticles = useCallback((width, height) => {
    const types = ['dna', 'molecule', 'atom', 'glucose', 'protein'];
    const counts = { dna: 5, molecule: 10, atom: 18, glucose: 4, protein: 5 };
    const particles = [];

    Object.entries(counts).forEach(([type, count]) => {
      for (let i = 0; i < count; i++) {
        particles.push(
          new Particle(
            Math.random() * width,
            Math.random() * height,
            type,
            width,
            height
          )
        );
      }
    });

    return particles;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particlesRef.current = initParticles(canvas.width, canvas.height);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const handleMouseMove = (e) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };

    const handleClick = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      let clickedAny = false;
      particlesRef.current.forEach((particle) => {
        if (particle.isPointInside(x, y)) {
          particle.onClick();
          clickedAny = true;
        }
      });

      if (!clickedAny) {
        const colors = [
          { r: 16, g: 185, b: 129 },
          { r: 6, g: 182, b: 212 },
          { r: 59, g: 130, b: 246 },
          { r: 139, g: 92, b: 246 },
          { r: 236, g: 72, b: 153 },
        ];
        const color = colors[Math.floor(Math.random() * colors.length)];
        ripplesRef.current.push({
          x,
          y,
          radius: 0,
          maxRadius: 180,
          opacity: 0.8,
          r: color.r,
          g: color.g,
          b: color.b,
          speed: 4,
        });
      }
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleClick);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (isCanvasMode) {
        const gradient = ctx.createRadialGradient(
          canvas.width / 2,
          canvas.height / 2,
          0,
          canvas.width / 2,
          canvas.height / 2,
          canvas.width * 0.8
        );
        gradient.addColorStop(0, '#f8fafc');
        gradient.addColorStop(0.5, '#f1f5f9');
        gradient.addColorStop(1, '#e2e8f0');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = 'rgba(16, 185, 129, 0.03)';
        for (let i = 0; i < 8; i++) {
          const x = ((i * 137.5) % 1) * canvas.width;
          const y = ((i * 73.3) % 1) * canvas.height;
          const r = 100 + (i % 5) * 80;
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ripplesRef.current = ripplesRef.current.filter(ripple => {
        ripple.radius += ripple.speed;
        ripple.opacity -= 0.015;
        
        const gradient = ctx.createRadialGradient(
          ripple.x, ripple.y, ripple.radius * 0.5,
          ripple.x, ripple.y, ripple.radius
        );
        gradient.addColorStop(0, `rgba(${ripple.r}, ${ripple.g}, ${ripple.b}, 0)`);
        gradient.addColorStop(1, `rgba(${ripple.r}, ${ripple.g}, ${ripple.b}, ${ripple.opacity})`);
        
        ctx.beginPath();
        ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${ripple.r}, ${ripple.g}, ${ripple.b}, ${ripple.opacity * 0.5})`;
        ctx.lineWidth = 2;
        ctx.stroke();
        
        return ripple.opacity > 0;
      });

      particlesRef.current.forEach((particle) => {
        particle.isHovered = false;
      });

      const mouseX = mouseRef.current.x;
      const mouseY = mouseRef.current.y;

      particlesRef.current.forEach((particle) => {
        const dx = mouseX - particle.x;
        const dy = mouseY - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < particle.size * 2) {
          particle.isHovered = true;
        }
      });

      if (isCanvasMode) {
        particlesRef.current.forEach((particle, i) => {
          particlesRef.current.slice(i + 1).forEach(other => {
            const dx = particle.x - other.x;
            const dy = particle.y - other.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 150) {
              ctx.beginPath();
              ctx.moveTo(particle.x, particle.y);
              ctx.lineTo(other.x, other.y);
              ctx.strokeStyle = `rgba(15, 23, 42, ${0.12 * (1 - distance / 150)})`;
              ctx.lineWidth = 0.8;
              ctx.stroke();
            }
          });
        });
      }

      particlesRef.current.forEach((particle) => {
        particle.update();
        particle.draw(ctx);

        if (particle.isHovered) {
          const glowGradient = ctx.createRadialGradient(
            particle.x, particle.y, 0,
            particle.x, particle.y, particle.size * 2.5
          );
          glowGradient.addColorStop(0, 'rgba(16, 185, 129, 0.25)');
          glowGradient.addColorStop(0.5, 'rgba(6, 182, 212, 0.12)');
          glowGradient.addColorStop(1, 'rgba(6, 182, 212, 0)');
          
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = glowGradient;
          ctx.fill();

          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size * 2.5, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(16, 185, 129, 0.35)';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('click', handleClick);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [initParticles, isCanvasMode]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className={`fixed inset-0 transition-all duration-500 ${
          isCanvasMode ? 'pointer-events-auto z-40' : 'pointer-events-none z-0'
        }`}
        style={{ opacity: isCanvasMode ? 1 : 0.4 }}
      />
      {isCanvasMode && (
        <button
          onClick={onExitCanvas}
          className="fixed top-6 right-6 z-50 px-4 py-2 bg-white/60 backdrop-blur-md text-slate-700 rounded-lg border border-slate-200 shadow-lg hover:bg-white/80 transition-all"
        >
          退出画布模式 (ESC)
        </button>
      )}
    </>
  );
}