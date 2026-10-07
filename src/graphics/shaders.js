export const AccretionDiskShader = {
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    varying vec2 vUv;

    void main() {
      vec2 center = vUv - vec2(0.5);
      float dist = length(center) * 2.0;

      // 核心视界纯黑镂空 (dist < 0.36)
      if (dist < 0.36 || dist > 0.98) discard;

      float angle = atan(center.y, center.x);
      
      // 等离子双螺旋流动
      float spiral = sin(angle * 5.0 - uTime * 3.5 + dist * 12.0);
      float edgeFade = smoothstep(0.36, 0.48, dist) * (1.0 - smoothstep(0.75, 0.98, dist));
      float alpha = edgeFade * (0.6 + 0.4 * spiral);

      // Luxury Champagne Gold & Deep Void event horizon
      vec3 champagne = vec3(0.92, 0.78, 0.38);
      vec3 deepVoid  = vec3(0.06, 0.14, 0.26);
      vec3 color = mix(champagne, deepVoid, smoothstep(0.40, 0.88, dist));

      // Subtle photon ring inner rim
      float innerRim = pow(1.0 - smoothstep(0.36, 0.44, dist), 2.0);
      color += vec3(0.4, 0.3, 0.1) * innerRim;

      gl_FragColor = vec4(color, clamp(alpha * 0.65, 0.0, 0.75));
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
