// Canvas Renderer for SYNTHOS Cinematic Video Intro
// Native 1920x1080 resolution rendered at 60 FPS

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
}

export class VideoRenderer {
  private particles: Particle[] = [];
  private width = 1920;
  private height = 1080;

  constructor() {
    this.initParticles();
  }

  private initParticles() {
    this.particles = [];
    const colors = ['#14b8a6', '#38bdf8', '#818cf8', '#a78bfa', '#ffffff'];
    for (let i = 0; i < 90; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        size: Math.random() * 2.5 + 1,
        alpha: Math.random() * 0.6 + 0.2,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
  }

  public render(ctx: CanvasRenderingContext2D, time: number, duration: number) {
    const W = this.width;
    const H = this.height;

    // Reset & Background: Deep midnight navy with subtle gradient
    const bgGrad = ctx.createRadialGradient(W / 2, H / 2, 50, W / 2, H / 2, W * 0.8);
    bgGrad.addColorStop(0, '#0c1e28');
    bgGrad.addColorStop(0.5, '#07151e');
    bgGrad.addColorStop(1, '#030a0f');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // Subtle technological grid
    ctx.save();
    ctx.strokeStyle = 'rgba(20, 184, 166, 0.05)';
    ctx.lineWidth = 1;
    const gridSize = 60;
    const gridOffset = (time * 12) % gridSize;
    for (let x = -gridSize; x < W + gridSize; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x + gridOffset, 0);
      ctx.lineTo(x + gridOffset, H);
      ctx.stroke();
    }
    for (let y = 0; y < H; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }
    ctx.restore();

    // Floating particles
    this.renderParticles(ctx, time);

    // Chapter Routing based on time
    if (time < 10) {
      this.renderChapter1_Dilemma(ctx, time, W, H);
    } else if (time < 22) {
      this.renderChapter2_Genomics(ctx, time - 10, W, H);
    } else if (time < 34) {
      this.renderChapter3_DigitalTwin(ctx, time - 22, W, H);
    } else if (time < 46) {
      this.renderChapter4_DrugNetwork(ctx, time - 34, W, H);
    } else if (time < 56) {
      this.renderChapter5_Pharmacokinetics(ctx, time - 46, W, H);
    } else {
      this.renderChapter6_Synthesis(ctx, time - 56, W, H);
    }

    // Top Cinematic HUD overlay
    this.renderCinematicHUD(ctx, time, duration, W, H);
  }

  private renderParticles(ctx: CanvasRenderingContext2D, time: number) {
    ctx.save();
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = this.width;
      if (p.x > this.width) p.x = 0;
      if (p.y < 0) p.y = this.height;
      if (p.y > this.height) p.y = 0;

      // Draw particle
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha * (0.6 + 0.4 * Math.sin(time * 2 + i));
      ctx.fill();

      // Connect nearby particles with subtle lines
      for (let j = i + 1; j < this.particles.length; j++) {
        const p2 = this.particles[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.strokeStyle = p.color;
          ctx.globalAlpha = (1 - dist / 120) * 0.15;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }
    }
    ctx.restore();
  }

  // Helper to draw the official SYNTHOS logo emblem on Canvas
  private drawOfficialEmblem(ctx: CanvasRenderingContext2D, cx: number, cy: number, scale: number, t: number) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);

    // 1. Tilted Orbital Ring with Orbiting Electron Nodes
    ctx.save();
    ctx.rotate((-24 * Math.PI) / 180);

    const orbitGrad = ctx.createLinearGradient(-90, 0, 90, 0);
    orbitGrad.addColorStop(0, '#14b8a6');
    orbitGrad.addColorStop(0.5, '#38bdf8');
    orbitGrad.addColorStop(1, '#c084fc');

    ctx.beginPath();
    ctx.ellipse(0, 0, 92, 28, 0, 0, Math.PI * 2);
    ctx.strokeStyle = orbitGrad;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Left Orbiting Electron / Atom (Mint Teal)
    const angleLeft = t * 1.5;
    const ox1 = Math.cos(angleLeft + Math.PI) * 92;
    const oy1 = Math.sin(angleLeft + Math.PI) * 28;
    ctx.beginPath();
    ctx.arc(ox1, oy1, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#2dd4bf';
    ctx.shadowColor = '#2dd4bf';
    ctx.shadowBlur = 12;
    ctx.fill();

    // Right Orbiting Electron / Atom (Lavender Purple)
    const ox2 = Math.cos(angleLeft) * 92;
    const oy2 = Math.sin(angleLeft) * 28;
    ctx.beginPath();
    ctx.arc(ox2, oy2, 5.5, 0, Math.PI * 2);
    ctx.fillStyle = '#c084fc';
    ctx.shadowColor = '#c084fc';
    ctx.shadowBlur = 12;
    ctx.fill();
    ctx.restore();

    // 2. DNA Horizontal Base-Pair Rungs (Top Loop: 3 rungs)
    ctx.shadowBlur = 0;
    const topRungs = [
      { y: -50, x1: 5, x2: 38 },
      { y: -34, x1: 8, x2: 44 },
      { y: -18, x1: 10, x2: 40 }
    ];
    topRungs.forEach((r) => {
      ctx.beginPath();
      ctx.moveTo(r.x1, r.y);
      ctx.lineTo(r.x2, r.y);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3.5;
      ctx.lineCap = 'round';
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(r.x1, r.y, 3.5, 0, Math.PI * 2);
      ctx.arc(r.x2, r.y, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = '#38bdf8';
      ctx.fill();
    });

    // 3. DNA Horizontal Base-Pair Rungs (Bottom Loop: 3 rungs)
    const botRungs = [
      { y: 20, x1: -40, x2: -6 },
      { y: 36, x1: -44, x2: -8 },
      { y: 52, x1: -38, x2: -10 }
    ];
    botRungs.forEach((r) => {
      ctx.beginPath();
      ctx.moveTo(r.x1, r.y);
      ctx.lineTo(r.x2, r.y);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3.5;
      ctx.lineCap = 'round';
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(r.x1, r.y, 3.5, 0, Math.PI * 2);
      ctx.arc(r.x2, r.y, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = '#38bdf8';
      ctx.fill();
    });

    // 4. Integrated Human Silhouette on Inner Spine
    // Head circle
    ctx.beginPath();
    ctx.arc(-22, -32, 9, 0, Math.PI * 2);
    ctx.fillStyle = '#06b6d4';
    ctx.shadowColor = '#06b6d4';
    ctx.shadowBlur = 10;
    ctx.fill();

    // Neck/Torso curve
    ctx.beginPath();
    ctx.moveTo(-22, -22);
    ctx.bezierCurveTo(-22, -14, -30, -2, -30, 8);
    ctx.bezierCurveTo(-30, 18, -20, 22, -12, 18);
    ctx.bezierCurveTo(-6, 12, -8, 0, -12, -10);
    ctx.closePath();
    ctx.fillStyle = '#0ea5e9';
    ctx.fill();

    // 5. Flowing 'S' Ribbon (Top Violet Loop + Bottom Teal Loop)
    // Top Loop: Purple-to-Indigo
    const topRibbon = ctx.createLinearGradient(-30, -80, 60, 20);
    topRibbon.addColorStop(0, '#8b5cf6');
    topRibbon.addColorStop(0.5, '#6366f1');
    topRibbon.addColorStop(1, '#3b82f6');

    ctx.beginPath();
    ctx.moveTo(-8, 2);
    ctx.bezierCurveTo(4, 16, 22, 26, 38, 14);
    ctx.bezierCurveTo(58, -2, 60, -40, 42, -62);
    ctx.bezierCurveTo(26, -82, -6, -82, -16, -64);
    ctx.bezierCurveTo(-24, -50, -16, -28, -4, -14);
    ctx.strokeStyle = topRibbon;
    ctx.lineWidth = 17;
    ctx.lineCap = 'round';
    ctx.shadowColor = '#8b5cf6';
    ctx.shadowBlur = 16;
    ctx.stroke();

    // Bottom Loop: Teal-to-Cyan-to-Emerald
    const botRibbon = ctx.createLinearGradient(40, -10, -50, 80);
    botRibbon.addColorStop(0, '#3b82f6');
    botRibbon.addColorStop(0.4, '#0ea5e9');
    botRibbon.addColorStop(0.7, '#06b6d4');
    botRibbon.addColorStop(1, '#10b981');

    ctx.beginPath();
    ctx.moveTo(-4, -14);
    ctx.bezierCurveTo(8, 0, 26, 16, 24, 36);
    ctx.bezierCurveTo(22, 56, 2, 74, -24, 72);
    ctx.bezierCurveTo(-48, 70, -58, 48, -54, 28);
    ctx.bezierCurveTo(-52, 18, -46, 12, -44, 10);
    ctx.strokeStyle = botRibbon;
    ctx.lineWidth = 17;
    ctx.lineCap = 'round';
    ctx.shadowColor = '#10b981';
    ctx.shadowBlur = 16;
    ctx.stroke();

    ctx.restore();
  }

  // --- CHAPTER 1: THE BIOLOGICAL DILEMMA (0s - 10s) ---
  private renderChapter1_Dilemma(ctx: CanvasRenderingContext2D, t: number, W: number, H: number) {
    ctx.save();
    const fadeIn = Math.min(1, t / 1.5);
    const pulse = 1 + 0.05 * Math.sin(t * 2);

    const cx = W / 2;
    const cy = H / 2 - 50;

    // Outer subtle orbital resonance rings
    for (let r = 1; r <= 3; r++) {
      ctx.beginPath();
      ctx.arc(cx, cy, 110 * r * (1 + 0.04 * Math.sin(t * 1.5 + r)), 0, Math.PI * 2);
      ctx.strokeStyle = r === 2 ? 'rgba(192, 132, 252, 0.25)' : 'rgba(45, 212, 191, 0.2)';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([8, 14]);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // Draw the new official SYNTHOS emblem
    this.drawOfficialEmblem(ctx, cx, cy, 1.45 * pulse, t);

    // Typography Overlay
    ctx.globalAlpha = fadeIn;
    ctx.textAlign = 'center';

    // Badge
    ctx.font = '700 14px "JetBrains Mono", monospace';
    ctx.fillStyle = '#2dd4bf';
    ctx.shadowBlur = 0;
    ctx.fillText('PRECISION MEDICINE & IN SILICO PHARMACOLOGY', cx, cy + 185);

    // Stylized Wordmark with target iris 'O'
    ctx.font = '800 68px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(255, 255, 255, 0.4)';
    ctx.shadowBlur = 20;
    ctx.fillText('SYNTHOS', cx, cy + 265);

    // Glowing Iris Target inside 'O'
    const oX = cx + 88;
    const oY = cy + 242;
    ctx.beginPath();
    ctx.arc(oX, oY, 10, 0, Math.PI * 2);
    ctx.fillStyle = '#38bdf8';
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 12;
    ctx.fill();

    // Tagline
    ctx.font = '400 28px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.shadowBlur = 0;
    ctx.fillText('Where Biology Meets Its Other Self.', cx, cy + 315);

    // Sub-text
    ctx.font = '400 18px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText('Constructing the personalized in silico biological twin from clinical and genomic reality.', cx, cy + 355);

    ctx.restore();
  }

  // --- CHAPTER 2: MULTI-OMIC GENOMICS & 3D DNA (10s - 22s) ---
  private renderChapter2_Genomics(ctx: CanvasRenderingContext2D, t: number, W: number, H: number) {
    ctx.save();
    const cx = W / 2 - 240;
    const cy = H / 2;

    // 3D Projected Rotating DNA Double Helix
    const numPairs = 32;
    const strandRadius = 140;
    const rotationSpeed = t * 1.8;
    const lengthY = 700;
    const startY = cy - lengthY / 2;

    // Draw base-pairs and strands
    for (let i = 0; i < numPairs; i++) {
      const y = startY + (i / (numPairs - 1)) * lengthY;
      const angle = (i * 0.28) + rotationSpeed;

      const x1 = cx + Math.cos(angle) * strandRadius;
      const z1 = Math.sin(angle); // Depth factor (-1 to 1)

      const x2 = cx + Math.cos(angle + Math.PI) * strandRadius;
      const z2 = Math.sin(angle + Math.PI);

      // Perspective alpha & scale
      const alpha1 = (z1 + 1.2) / 2.2;
      const alpha2 = (z2 + 1.2) / 2.2;

      // Base-pair rung connecting the two strands
      ctx.beginPath();
      ctx.moveTo(x1, y);
      ctx.lineTo(x2, y);
      const isTealDominant = i % 2 === 0;
      ctx.strokeStyle = isTealDominant ? 'rgba(20, 184, 166, 0.45)' : 'rgba(129, 140, 248, 0.45)';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Strand 1 node (Adenine / Thymine)
      ctx.beginPath();
      ctx.arc(x1, y, 6 * alpha1, 0, Math.PI * 2);
      ctx.fillStyle = '#14b8a6';
      ctx.shadowColor = '#14b8a6';
      ctx.shadowBlur = 12 * alpha1;
      ctx.fill();

      // Strand 2 node (Guanine / Cytosine)
      ctx.beginPath();
      ctx.arc(x2, y, 6 * alpha2, 0, Math.PI * 2);
      ctx.fillStyle = '#818cf8';
      ctx.shadowColor = '#818cf8';
      ctx.shadowBlur = 12 * alpha2;
      ctx.fill();
    }

    // Right-Hand Floating Genomic Telemetry HUD
    const hudX = W / 2 + 100;
    const hudY = cy - 220;

    ctx.textAlign = 'left';
    ctx.font = '600 14px "JetBrains Mono", monospace';
    ctx.fillStyle = '#14b8a6';
    ctx.shadowBlur = 0;
    ctx.fillText('PHARMACOGENOMIC DECODING MATRIX [CPIC TIER 1]', hudX, hudY);

    ctx.font = '800 36px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('Genomic Allele Calibration', hudX, hudY + 45);

    // Cards with polymorphic loci
    const cards = [
      {
        gene: 'CYP2D6 *4/*4',
        type: 'Poor Metabolizer (Activity Score: 0.0)',
        impact: 'Prodrug Bio-activation Failure (Codeine, Tamoxifen)',
        color: '#f43f5e',
        tag: 'CRITICAL HAZARD'
      },
      {
        gene: 'CYP2C19 *1/*17',
        type: 'Rapid Metabolizer (Enhanced Transcription)',
        impact: 'Accelerated Omeprazole & Clopidogrel Clearance',
        color: '#eab308',
        tag: 'MODERATE ADJUSTMENT'
      },
      {
        gene: 'SLCO1B1 521T>C',
        type: 'Organic Anion Transporter OATP1B1 Variant',
        impact: '221% Higher Statin Plasma AUC (Myopathy Risk)',
        color: '#a855f7',
        tag: 'CPIC LEVEL A'
      },
      {
        gene: 'VKORC1 -1639G>A',
        type: 'Vitamin K Epoxide Reductase Promoter',
        impact: 'Hyper-sensitivity to Warfarin Anticoagulation',
        color: '#06b6d4',
        tag: 'BOXED WARNING'
      }
    ];

    cards.forEach((c, idx) => {
      const cyCard = hudY + 80 + idx * 95;
      const cardAlpha = Math.min(1, Math.max(0, (t - idx * 1.5) * 1.2));

      ctx.save();
      ctx.globalAlpha = cardAlpha;

      // Card Background
      ctx.fillStyle = 'rgba(15, 43, 56, 0.85)';
      ctx.strokeStyle = c.color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(hudX, cyCard, 680, 80, 10);
      ctx.fill();
      ctx.stroke();

      // Gene name & Tag
      ctx.font = '700 18px "JetBrains Mono", monospace';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(c.gene, hudX + 24, cyCard + 32);

      // Badge
      ctx.font = '700 11px "JetBrains Mono", monospace';
      ctx.fillStyle = c.color;
      ctx.fillText(`[ ${c.tag} ]`, hudX + 220, cyCard + 32);

      // Type & Impact
      ctx.font = '400 14px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(c.type, hudX + 24, cyCard + 54);

      ctx.font = '500 13px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#cbd5e1';
      ctx.fillText(`Impact: ${c.impact}`, hudX + 24, cyCard + 70);

      ctx.restore();
    });

    ctx.restore();
  }

  // --- CHAPTER 3: THE HOLOGRAPHIC PATIENT TWIN (22s - 34s) ---
  private renderChapter3_DigitalTwin(ctx: CanvasRenderingContext2D, t: number, W: number, H: number) {
    ctx.save();
    const cx = W / 2 - 280;
    const cy = H / 2;

    // Glowing Holographic Patient Silhouette
    ctx.save();
    ctx.translate(cx, cy);

    // Scanner beam moving up and down
    const scanY = Math.sin(t * 2.5) * 320;
    ctx.beginPath();
    ctx.moveTo(-160, scanY);
    ctx.lineTo(160, scanY);
    ctx.strokeStyle = '#14b8a6';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#14b8a6';
    ctx.shadowBlur = 18;
    ctx.stroke();

    // Patient anatomical outline (Head, Torso, Limbs in wireframe)
    ctx.strokeStyle = 'rgba(20, 184, 166, 0.4)';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);

    // Head
    ctx.beginPath();
    ctx.arc(0, -260, 48, 0, Math.PI * 2);
    ctx.stroke();

    // Neck & Shoulders
    ctx.beginPath();
    ctx.moveTo(0, -212);
    ctx.lineTo(0, -180);
    ctx.moveTo(-100, -150);
    ctx.lineTo(100, -150);
    ctx.stroke();

    // Torso outline
    ctx.beginPath();
    ctx.moveTo(-90, -150);
    ctx.lineTo(-70, 70);
    ctx.lineTo(70, 70);
    ctx.lineTo(90, -150);
    ctx.closePath();
    ctx.stroke();

    // Legs
    ctx.beginPath();
    ctx.moveTo(-50, 70);
    ctx.lineTo(-60, 300);
    ctx.moveTo(50, 70);
    ctx.lineTo(60, 300);
    ctx.stroke();

    ctx.setLineDash([]);

    // Highlighted Active Organs:
    // 1. Pulsing Heart (Vascular)
    const heartPulse = 1 + 0.15 * Math.sin(t * 7);
    ctx.beginPath();
    ctx.arc(-15, -90, 18 * heartPulse, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(244, 63, 94, 0.7)';
    ctx.shadowColor = '#f43f5e';
    ctx.shadowBlur = 20;
    ctx.fill();

    // 2. Liver (CYP Metabolism)
    ctx.beginPath();
    ctx.ellipse(32, -40, 34, 22, Math.PI * 0.1, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(234, 179, 8, 0.65)';
    ctx.shadowColor = '#eab308';
    ctx.shadowBlur = 20;
    ctx.fill();

    // 3. Kidneys (Renal Clearance)
    ctx.beginPath();
    ctx.ellipse(-30, 0, 16, 24, 0, 0, Math.PI * 2);
    ctx.ellipse(30, 0, 16, 24, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(56, 189, 248, 0.7)';
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 20;
    ctx.fill();

    ctx.restore();

    // Right-Hand Biometric HUD Readouts
    const hudX = W / 2 + 60;
    const hudY = cy - 240;

    ctx.textAlign = 'left';
    ctx.font = '600 14px "JetBrains Mono", monospace';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('IN SILICO PHENOTYPE RECONSTRUCTION', hudX, hudY);

    ctx.font = '800 36px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('Organ Clearance Digital Twin', hudX, hudY + 45);

    const metrics = [
      { label: 'eGFR (2021 CKD-EPI)', value: '42.0 mL/min/1.73m²', status: 'Stage 3b Moderate-Severe CKD', color: '#f59e0b' },
      { label: 'CrCl (Cockcroft-Gault)', value: '38.6 mL/min', status: 'Dose Reduction Mandatory', color: '#f59e0b' },
      { label: 'Serum Creatinine', value: '1.68 mg/dL', status: 'Elevated Baseline (Ref 0.7-1.3)', color: '#38bdf8' },
      { label: 'Calculated Vol of Dist (Vd)', value: '0.28 L/kg (21.9 L total)', status: 'Hydration Calibrated', color: '#14b8a6' },
      { label: 'Hepatic Functional Reserve', value: 'Child-Pugh Score A (5 pts)', status: 'Preserved Albumin 3.8 g/dL', color: '#10b981' }
    ];

    metrics.forEach((m, idx) => {
      const my = hudY + 80 + idx * 80;
      ctx.save();
      ctx.fillStyle = 'rgba(15, 35, 48, 0.8)';
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(hudX, my, 720, 68, 8);
      ctx.fill();
      ctx.stroke();

      ctx.font = '500 14px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(m.label, hudX + 24, my + 28);

      ctx.font = '700 20px "JetBrains Mono", monospace';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(m.value, hudX + 24, my + 54);

      ctx.font = '600 12px "JetBrains Mono", monospace';
      ctx.fillStyle = m.color;
      ctx.textAlign = 'right';
      ctx.fillText(m.status, hudX + 696, my + 42);
      ctx.restore();
    });

    ctx.restore();
  }

  // --- CHAPTER 4: 305+ DRUG TARGET CONSTELLATION (34s - 46s) ---
  private renderChapter4_DrugNetwork(ctx: CanvasRenderingContext2D, t: number, W: number, H: number) {
    ctx.save();
    const cx = W / 2 - 260;
    const cy = H / 2;

    // Molecular Target Network Simulation
    const clusters = [
      { name: 'GPCRs (55+)', color: '#10b981', angle: 0, count: 8 },
      { name: 'Tyrosine Kinases (50+)', color: '#38bdf8', angle: (Math.PI * 2) / 5, count: 7 },
      { name: 'Enzymes & Hydrolases (60+)', color: '#f59e0b', angle: (Math.PI * 4) / 5, count: 9 },
      { name: 'Ion Channels & Transporters (50+)', color: '#a855f7', angle: (Math.PI * 6) / 5, count: 8 },
      { name: 'Nuclear & Biologics (90+)', color: '#ec4899', angle: (Math.PI * 8) / 5, count: 9 }
    ];

    // Central Core Node
    ctx.beginPath();
    ctx.arc(cx, cy, 32, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 25;
    ctx.fill();

    ctx.textAlign = 'center';
    ctx.font = '700 11px "JetBrains Mono", monospace';
    ctx.fillStyle = '#0f172a';
    ctx.fillText('305 DRUGS', cx, cy + 4);

    // Orbiting Superfamily hubs
    clusters.forEach((cl, i) => {
      const rot = cl.angle + t * 0.25;
      const hubDist = 180;
      const hx = cx + Math.cos(rot) * hubDist;
      const hy = cy + Math.sin(rot) * hubDist;

      // Connecting core spoke
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(hx, hy);
      ctx.strokeStyle = cl.color;
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.6;
      ctx.stroke();

      // Hub node
      ctx.beginPath();
      ctx.arc(hx, hy, 22, 0, Math.PI * 2);
      ctx.fillStyle = cl.color;
      ctx.shadowColor = cl.color;
      ctx.shadowBlur = 18;
      ctx.fill();

      // Satellite Drug Nodes
      for (let s = 0; s < cl.count; s++) {
        const sRot = rot + (s / cl.count) * Math.PI * 2 + t * 0.5;
        const sDist = 65 + (s % 3) * 15;
        const sx = hx + Math.cos(sRot) * sDist;
        const sy = hy + Math.sin(sRot) * sDist;

        ctx.beginPath();
        ctx.moveTo(hx, hy);
        ctx.lineTo(sx, sy);
        ctx.strokeStyle = cl.color;
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.35;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(sx, sy, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
      }
    });

    // Right-Hand Drug Intelligence Highlights
    const hudX = W / 2 + 80;
    const hudY = cy - 240;

    ctx.textAlign = 'left';
    ctx.font = '600 14px "JetBrains Mono", monospace';
    ctx.fillStyle = '#10b981';
    ctx.shadowBlur = 0;
    ctx.fillText('PHARMACOLOGICAL TARGET LIBRARY [305 MONOGRAPHS]', hudX, hudY);

    ctx.font = '800 36px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('Target-Wise Drug Classification', hudX, hudY + 45);

    const specs = [
      {
        superfamily: 'G-Protein Coupled Receptors (GPCRs)',
        examples: 'Metoprolol, Losartan, Salbutamol, Loratadine',
        count: '55 Active Monographs',
        color: '#10b981'
      },
      {
        superfamily: 'Protein & Tyrosine Kinases',
        examples: 'Imatinib, Osimertinib, Dabrafenib, Ruxolitinib',
        count: '50 Active Monographs',
        color: '#38bdf8'
      },
      {
        superfamily: 'Enzymes & Hydrolases',
        examples: 'Atorvastatin, Lisinopril, Allopurinol, Dabigatran',
        count: '60 Active Monographs',
        color: '#f59e0b'
      },
      {
        superfamily: 'Ion Channels & Membrane Transporters',
        examples: 'Amlodipine, Furosemide, Empagliflozin, Fluoxetine',
        count: '50 Active Monographs',
        color: '#a855f7'
      },
      {
        superfamily: 'Nuclear Receptors & Targeted Biologics',
        examples: 'Dexamethasone, Pembrolizumab, Dupilumab, Semaglutide',
        count: '90 Active Monographs',
        color: '#ec4899'
      }
    ];

    specs.forEach((s, idx) => {
      const sy = hudY + 80 + idx * 80;
      ctx.save();
      ctx.fillStyle = 'rgba(15, 35, 48, 0.85)';
      ctx.strokeStyle = s.color;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.roundRect(hudX, sy, 700, 68, 8);
      ctx.fill();
      ctx.stroke();

      ctx.font = '700 16px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(s.superfamily, hudX + 24, sy + 28);

      ctx.font = '400 13px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`Examples: ${s.examples}`, hudX + 24, sy + 52);

      ctx.font = '700 12px "JetBrains Mono", monospace';
      ctx.fillStyle = s.color;
      ctx.textAlign = 'right';
      ctx.fillText(s.count, hudX + 676, sy + 38);
      ctx.restore();
    });

    ctx.restore();
  }

  // --- CHAPTER 5: REAL-TIME PHARMACOKINETICS (46s - 56s) ---
  private renderChapter5_Pharmacokinetics(ctx: CanvasRenderingContext2D, t: number, W: number, H: number) {
    ctx.save();
    const cx = W / 2;
    const cy = H / 2;

    // Header
    ctx.textAlign = 'center';
    ctx.font = '600 14px "JetBrains Mono", monospace';
    ctx.fillStyle = '#f59e0b';
    ctx.shadowBlur = 0;
    ctx.fillText('DYNAMIC EXPOSURE-RESPONSE SIMULATION [PBPK ENGINE]', cx, 140);

    ctx.font = '800 38px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('Therapeutic Window & Exposure Trajectory', cx, 185);

    // Coordinate Graph Dimensions
    const gx = 280;
    const gy = 760;
    const gw = 1360;
    const gh = 440;

    // Graph Background
    ctx.fillStyle = 'rgba(15, 30, 42, 0.7)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.fillRect(gx, gy - gh, gw, gh);
    ctx.strokeRect(gx, gy - gh, gw, gh);

    // Toxic Threshold (MTC)
    const mtcY = gy - gh * 0.78;
    ctx.beginPath();
    ctx.moveTo(gx, mtcY);
    ctx.lineTo(gx + gw, mtcY);
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 6]);
    ctx.stroke();

    ctx.font = '600 12px "JetBrains Mono", monospace';
    ctx.fillStyle = '#ef4444';
    ctx.textAlign = 'left';
    ctx.fillText('MAXIMUM TOLERATED CONCENTRATION (MTC: 2.0 μg/mL) — TOXIC RISK', gx + 15, mtcY - 8);

    // Minimum Effective Threshold (MEC)
    const mecY = gy - gh * 0.32;
    ctx.beginPath();
    ctx.moveTo(gx, mecY);
    ctx.lineTo(gx + gw, mecY);
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 6]);
    ctx.stroke();

    ctx.fillStyle = '#10b981';
    ctx.fillText('MINIMUM EFFECTIVE CONCENTRATION (MEC: 0.8 μg/mL) — EFFICACY FLOOR', gx + 15, mecY + 20);

    // Safe Therapeutic Window Zone
    ctx.fillStyle = 'rgba(16, 185, 129, 0.08)';
    ctx.fillRect(gx, mtcY, gw, mecY - mtcY);

    ctx.setLineDash([]);

    // Curve 1: Standard Dose in Impaired Twin (Over-accumulation -> Toxicity!)
    ctx.beginPath();
    const progress = Math.min(1, t / 7);
    const maxPoints = Math.floor(progress * 150);

    for (let p = 0; p <= maxPoints; p++) {
      const px = gx + (p / 150) * gw;
      const xVal = (p / 150) * 48; // 0 to 48 hours
      // Multi-dose accumulation equation
      const val = 1.6 * (1 - Math.exp(-0.25 * xVal)) * (1 + 0.3 * Math.sin(xVal * 0.8));
      const py = gy - (val / 2.5) * gh;
      if (p === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 4;
    ctx.shadowColor = '#f43f5e';
    ctx.shadowBlur = 12;
    ctx.stroke();

    // Curve 2: SYNTHOS Calibrated Precision Dose (Stays safely within window)
    ctx.beginPath();
    for (let p = 0; p <= maxPoints; p++) {
      const px = gx + (p / 150) * gw;
      const xVal = (p / 150) * 48;
      // Adjusted dose: calibrated to eGFR 42 mL/min
      const val = 1.15 * (1 - Math.exp(-0.35 * xVal)) * (1 + 0.15 * Math.sin(xVal * 0.8));
      const py = gy - (val / 2.5) * gh;
      if (p === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.strokeStyle = '#14b8a6';
    ctx.lineWidth = 4;
    ctx.shadowColor = '#14b8a6';
    ctx.shadowBlur = 14;
    ctx.stroke();

    // Legend Callouts below graph
    ctx.textAlign = 'center';
    ctx.font = '600 15px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#f43f5e';
    ctx.shadowBlur = 0;
    ctx.fillText('— Unadjusted Standard Regimen: 43% Exceeds Toxic Window (Accumulation)', cx - 280, gy + 45);

    ctx.fillStyle = '#14b8a6';
    ctx.fillText('— SYNTHOS Digital-Twin Calibrated Regimen: 100% Inside Therapeutic Target', cx + 280, gy + 45);

    ctx.restore();
  }

  // --- CHAPTER 6: SYNTHESIS & GRAND FINALE (56s - 65s) ---
  private renderChapter6_Synthesis(ctx: CanvasRenderingContext2D, t: number, W: number, H: number) {
    ctx.save();
    const cx = W / 2;
    const cy = H / 2 - 45;

    const pulse = 1 + 0.06 * Math.sin(t * 2.5);

    // Draw Official SYNTHOS Emblem with glowing halo
    this.drawOfficialEmblem(ctx, cx, cy, 1.6 * pulse, t);

    // Big Bold Final Branding
    ctx.textAlign = 'center';
    ctx.font = '800 76px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(255, 255, 255, 0.4)';
    ctx.shadowBlur = 25;
    ctx.fillText('SYNTHOS', cx, cy + 185);

    // Stylized Target Iris inside 'O'
    const oX = cx + 98;
    const oY = cy + 160;
    ctx.beginPath();
    ctx.arc(oX, oY, 12, 0, Math.PI * 2);
    ctx.fillStyle = '#38bdf8';
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 15;
    ctx.fill();

    ctx.font = '500 32px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#14b8a6';
    ctx.shadowColor = '#14b8a6';
    ctx.shadowBlur = 15;
    ctx.fillText('Where Biology Meets Its Other Self.', cx, cy + 240);

    ctx.font = '400 20px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.shadowBlur = 0;
    ctx.fillText('305 Target-Classified Drug Monographs · Deterministic Digital Twins · CPIC Pharmacogenomics', cx, cy + 285);

    ctx.font = '600 16px "JetBrains Mono", monospace';
    ctx.fillStyle = '#818cf8';
    ctx.fillText('EDUCATIONAL PRECISION MEDICINE DEMONSTRATION SUITE', cx, cy + 330);

    ctx.restore();
  }

  // HUD overlay (Timestamp, Rec indicator, Resolution, Audio status)
  private renderCinematicHUD(ctx: CanvasRenderingContext2D, t: number, duration: number, W: number, H: number) {
    ctx.save();
    ctx.textAlign = 'left';
    ctx.font = '600 13px "JetBrains Mono", monospace';

    // Top-Left: SYNTHOS HUD ENGINE
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.fillText('SYNTHOS_TWIN_SIM // 4K 60FPS PROC_RENDER', 40, 45);

    // Top-Right: REC & Timecode
    ctx.textAlign = 'right';
    const mins = Math.floor(t / 60);
    const secs = Math.floor(t % 60);
    const ms = Math.floor((t % 1) * 100);
    const timeStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;

    // Blinking REC dot
    const blink = Math.floor(t * 2) % 2 === 0;
    if (blink) {
      ctx.beginPath();
      ctx.arc(W - 140, 40, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#ef4444';
      ctx.fill();
    }
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`REC ${timeStr} / 01:05.00`, W - 40, 45);

    // Bottom-Left: Security & Synthetic Watermark
    ctx.textAlign = 'left';
    ctx.font = '500 12px "JetBrains Mono", monospace';
    ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
    ctx.fillText('SYNTHETIC DEMONSTRATION // NOT FOR DIRECT CLINICAL PRESCRIBING // DETERMINISTIC CDS', 40, H - 35);

    ctx.restore();
  }
}
