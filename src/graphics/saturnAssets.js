import * as THREE from 'three';

/**
 * Procedural Photorealistic Saturn Planet & Ring Textures
 * Creates authentic Cassini-grade textures for the central planet and its iconic rings.
 */

export function createSaturnPlanetTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Realistic Saturn latitudinal cloud bands
  // Bands gradient from South Pole (y=512) to North Pole (y=0)
  const grad = ctx.createLinearGradient(0, 0, 0, 512);
  grad.addColorStop(0.00, '#4a4336'); // North polar hood (dark olive dusk)
  grad.addColorStop(0.08, '#695f4c');
  grad.addColorStop(0.18, '#b09f7a'); // North temperate zone
  grad.addColorStop(0.28, '#d4c29a'); // North tropical zone (warm creamy buff)
  grad.addColorStop(0.38, '#edd9ad'); // Equatorial zone (luminous golden champagne)
  grad.addColorStop(0.48, '#f5e4bc'); // Brightest equator
  grad.addColorStop(0.52, '#edd9ad');
  grad.addColorStop(0.62, '#d4c29a'); // South tropical zone
  grad.addColorStop(0.72, '#b8a682'); // South temperate zone
  grad.addColorStop(0.85, '#7d7059');
  grad.addColorStop(1.00, '#3a3429'); // South polar hex hood

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 512);

  // Add subtle horizontal atmospheric jet-stream striations
  ctx.save();
  for (let y = 0; y < 512; y += 2) {
    const freq = Math.sin(y * 0.12) * Math.cos(y * 0.05);
    const alpha = 0.04 + 0.03 * Math.abs(freq);
    const brightness = freq > 0 ? 255 : 50;
    ctx.fillStyle = `rgba(${brightness}, ${brightness * 0.9}, ${brightness * 0.7}, ${alpha})`;
    ctx.fillRect(0, y, 1024, 2);
  }
  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

export function createSaturnRingTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');

  // Radial gradient across the ring width (x=0 is inner edge, x=1024 is outer edge)
  const grad = ctx.createLinearGradient(0, 0, 1024, 0);

  // 1. Inner Crepe Ring (C Ring): 0% to 22%
  grad.addColorStop(0.00, 'rgba(0, 0, 0, 0.0)');
  grad.addColorStop(0.02, 'rgba(160, 140, 105, 0.18)');
  grad.addColorStop(0.18, 'rgba(175, 155, 120, 0.32)');
  grad.addColorStop(0.22, 'rgba(90, 78, 60, 0.15)'); // C-B boundary

  // 2. Main Dense Ring (B Ring - brightest): 22% to 62%
  grad.addColorStop(0.24, 'rgba(235, 215, 168, 0.92)');
  grad.addColorStop(0.38, 'rgba(255, 240, 195, 0.98)');
  grad.addColorStop(0.50, 'rgba(240, 222, 178, 0.94)');
  grad.addColorStop(0.61, 'rgba(220, 198, 150, 0.88)');

  // 3. Cassini Division (prominent dark gap): 62% to 69%
  grad.addColorStop(0.62, 'rgba(20, 18, 22, 0.12)');
  grad.addColorStop(0.65, 'rgba(6, 6, 10, 0.02)'); // Cassini deepest void
  grad.addColorStop(0.68, 'rgba(22, 20, 26, 0.14)');

  // 4. Outer Ring (A Ring): 69% to 96%
  grad.addColorStop(0.69, 'rgba(215, 192, 145, 0.85)');
  grad.addColorStop(0.82, 'rgba(205, 182, 138, 0.82)');
  grad.addColorStop(0.89, 'rgba(90, 78, 55, 0.20)'); // Encke Gap
  grad.addColorStop(0.91, 'rgba(195, 172, 128, 0.75)');
  grad.addColorStop(0.96, 'rgba(170, 148, 108, 0.60)');

  // 5. Outer edge falloff
  grad.addColorStop(0.99, 'rgba(120, 100, 70, 0.15)');
  grad.addColorStop(1.00, 'rgba(0, 0, 0, 0.0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 64);

  // Add hundreds of delicate concentric ringlets
  ctx.save();
  for (let x = 0; x < 1024; x += 2) {
    if (x >= 630 && x <= 700) continue; // Keep Cassini division clean
    const fineLine = Math.sin(x * 0.4) * 0.5 + 0.5;
    const a = fineLine * 0.07;
    ctx.fillStyle = `rgba(255, 245, 220, ${a})`;
    ctx.fillRect(x, 0, 1, 64);
  }
  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}
