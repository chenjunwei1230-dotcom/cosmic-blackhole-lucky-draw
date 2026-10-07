export const AccretionDiskShader = {
  vertexShader: `
    varying vec2 vPos;
    varying vec3 vWorldPos;
    void main() {
      vPos = position.xy;
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPos = worldPosition.xyz;
      gl_Position = projectionMatrix * viewMatrix * worldPosition;
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform float uInnerRadius;
    uniform float uOuterRadius;
    uniform float uCollapseProgress;
    varying vec2 vPos;
    varying vec3 vWorldPos;

    void main() {
      float r = length(vPos);
      if (r < uInnerRadius || r > uOuterRadius) discard;

      float normR = (r - uInnerRadius) / (uOuterRadius - uInnerRadius);
      float angle = atan(vPos.y, vPos.x);

      // Relativistic Keplerian differential flow (inner orbits rotate faster)
      float omega = 2.2 / sqrt(normR + 0.2);
      float spinFactor = 1.0 + uCollapseProgress * 4.0;
      float rotAngle = angle - uTime * omega * 0.4 * spinFactor;

      // Relativistic multi-harmonic plasma turbulence
      float spiral1 = sin(rotAngle * 5.0 + normR * 12.0);
      float spiral2 = cos(rotAngle * 10.0 - normR * 18.0 + uTime * 1.5);
      float plasma = 0.65 + 0.25 * spiral1 + 0.10 * spiral2;

      // Relativistic Doppler beaming (approaching left flank shines brighter)
      float doppler = 1.0 + 0.32 * sin(angle + 0.4);

      // Intense blazing photon ring at the innermost stable orbit
      float photonRing = pow(1.0 - smoothstep(0.0, 0.10, normR), 3.0) * (2.4 + uCollapseProgress * 2.0);

      // Radial fade: crisp inner event horizon cut, soft outer stellar fade
      float radialFade = smoothstep(0.0, 0.04, normR) * (1.0 - smoothstep(0.68, 1.0, normR));

      // Luxury palette: incandescent white-gold, champagne gold, deep amber, stellar void
      vec3 coreWhiteGold = vec3(1.6, 1.5, 1.2);
      vec3 champagneGold = vec3(0.96, 0.82, 0.42);
      vec3 deepAmber     = vec3(0.72, 0.38, 0.12);
      vec3 cosmicVoid    = vec3(0.08, 0.04, 0.16);

      vec3 color = mix(champagneGold, deepAmber, smoothstep(0.12, 0.60, normR));
      color = mix(color, cosmicVoid, smoothstep(0.60, 1.0, normR));
      color += coreWhiteGold * photonRing;

      // Color flaring during collapse suction
      color *= (1.0 + uCollapseProgress * 1.5);

      float alpha = radialFade * plasma * doppler * clamp(0.75 + uCollapseProgress * 0.25, 0.0, 1.0);
      gl_FragColor = vec4(color * doppler, clamp(alpha * 0.85, 0.0, 0.95));
    }
  `
};

export const SaturnRingShader = {
  vertexShader: `
    varying vec2 vPos;
    void main() {
      vPos = position.xy;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D uRingTexture;
    uniform float uInnerRadius;
    uniform float uOuterRadius;
    uniform float uTime;
    varying vec2 vPos;

    void main() {
      float r = length(vPos);
      if (r < uInnerRadius || r > uOuterRadius) discard;

      float u = (r - uInnerRadius) / (uOuterRadius - uInnerRadius);
      vec4 ringTex = texture2D(uRingTexture, vec2(u, 0.5));

      // Subtle dynamic ring shimmer
      float angle = atan(vPos.y, vPos.x);
      float shimmer = 1.0 + 0.04 * sin(angle * 28.0 + uTime * 0.5);

      gl_FragColor = vec4(ringTex.rgb * shimmer, ringTex.a);
    }
  `
};

export const ParticleShader = {
  vertexShader: `
    uniform float uTime;
    uniform float uCollapseProgress;
    attribute float aRadius;
    attribute float aAngle;
    attribute float aSpeed;
    attribute vec3 aColor;
    attribute float aSize;

    varying vec3 vColor;
    varying float vAlpha;

    void main() {
      vColor = aColor;

      float currentAngle = aAngle + aSpeed * uTime;
      float collapseFactor = exp(-uCollapseProgress * 3.5);
      float spiralBoost = uCollapseProgress * 10.0;

      float r = mix(aRadius, aRadius * collapseFactor, smoothstep(0.0, 1.0, uCollapseProgress));
      float theta = currentAngle + spiralBoost;

      vec3 pos = vec3(
        cos(theta) * r,
        sin(theta) * r * 0.45,
        sin(theta * 2.0 + uTime * 1.5) * (1.0 - uCollapseProgress) * 0.25
      );

      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      gl_Position = projectionMatrix * mvPosition;

      // 限制视角距离，防止靠近视锥体时除以零或无穷大
      float viewDist = max(-mvPosition.z, 1.0);
      gl_PointSize = clamp(aSize * (80.0 / viewDist) * (1.0 + uCollapseProgress * 0.5), 1.0, 24.0);
      
      // 靠近奇点渐隐
      vAlpha = smoothstep(0.12, 0.4, r);
    }
  `,
  fragmentShader: `
    varying vec3 vColor;
    varying float vAlpha;

    void main() {
      vec2 coord = gl_PointCoord - vec2(0.5);
      float dist = length(coord);
      if (dist > 0.5) discard;

      // 柔和边缘衰减
      float strength = pow(1.0 - smoothstep(0.0, 0.5, dist), 2.0);
      gl_FragColor = vec4(vColor, clamp(vAlpha * strength * 0.8, 0.0, 1.0));
    }
  `
};
