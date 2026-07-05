import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform vec2 uMouse;
  uniform vec2 uRes;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorC;

  vec2 hash22(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(dot(hash22(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0)),
          dot(hash22(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
      mix(dot(hash22(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)),
          dot(hash22(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x),
      u.y);
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
      v += a * noise(p);
      p *= 2.02;
      a *= 0.5;
    }
    return v * 0.5 + 0.5;
  }

  void main() {
    vec2 uv = vUv;
    vec2 p = uv;
    p.x *= uRes.x / max(uRes.y, 1.0);

    float t = uTime * 0.05;
    vec2 m = (uMouse - 0.5) * 0.5;

    vec2 q = vec2(fbm(p * 1.6 + t), fbm(p * 1.6 + vec2(5.2, 1.3) - t));
    vec2 r = vec2(
      fbm(p * 1.6 + q * 1.8 + vec2(1.7, 9.2) + 0.15 * t + m),
      fbm(p * 1.6 + q * 1.8 + vec2(8.3, 2.8) + 0.126 * t + m)
    );
    float f = fbm(p * 1.6 + r * 1.6);

    vec3 col = mix(uColorA, uColorB, clamp(f * 1.7, 0.0, 1.0));
    col = mix(col, uColorC, clamp(length(r) * 0.85 - 0.1, 0.0, 1.0));

    // warm ember hotspots
    col += uColorC * pow(clamp(f, 0.0, 1.0), 6.0) * 0.5;

    float vig = smoothstep(1.25, 0.15, length(uv - 0.5));
    col *= 0.45 + 0.55 * vig;

    gl_FragColor = vec4(col, 1.0);
  }
`;

function Backdrop() {
  const ref = useRef<THREE.ShaderMaterial>(null);
  const viewport = useThree((s) => s.viewport);
  const invalidate = useThree((s) => s.invalidate);
  const gl = useThree((s) => s.gl);

  // Drive rendering at a capped ~30fps, and pause entirely when the hero is
  // scrolled out of view. Keeps the WebGL context alive (no remount hitch).
  useEffect(() => {
    let raf = 0;
    let last = 0;
    let visible = true;
    const frameMs = 1000 / 30;

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) invalidate();
      },
      { threshold: 0 },
    );
    observer.observe(gl.domElement);

    const loop = (t: number) => {
      raf = requestAnimationFrame(loop);
      if (!visible || t - last < frameMs) return;
      last = t;
      invalidate();
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [gl, invalidate]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uRes: { value: new THREE.Vector2(1, 1) },
      uColorA: { value: new THREE.Color("#0e0a08") },
      uColorB: { value: new THREE.Color("#b94428") },
      uColorC: { value: new THREE.Color("#f0a544") },
    }),
    [],
  );

  useFrame((state, delta) => {
    if (!ref.current) return;
    const u = ref.current.uniforms;
    u.uTime.value += Math.min(delta, 0.033);
    u.uRes.value.set(state.size.width, state.size.height);
    const targetX = state.pointer.x * 0.5 + 0.5;
    const targetY = state.pointer.y * 0.5 + 0.5;
    u.uMouse.value.x += (targetX - u.uMouse.value.x) * 0.04;
    u.uMouse.value.y += (targetY - u.uMouse.value.y) * 0.04;
  });

  return (
    <mesh scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={ref}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}

export default function HeroCanvas() {
  return (
    <Canvas
      className="!absolute inset-0"
      frameloop="demand"
      dpr={[1, 1.25]}
      gl={{ antialias: false, powerPreference: "high-performance" }}
      camera={{ position: [0, 0, 5], fov: 50 }}
    >
      <Backdrop />
    </Canvas>
  );
}
