"use client";
import { useEffect, useRef, Suspense } from "react";
import { useTranslations } from "next-intl";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Truck, Plane, FileText, Shield, ArrowRight } from "lucide-react";
import * as THREE from "three";

gsap.registerPlugin(ScrollTrigger);

const URLS = {
  bg: '/images/globe/bg.jpg',
  diffuse: '/images/globe/diffuse.jpg',
  halo: '/images/globe/halo.png',
};

function RealisticGlobe() {
  const groupRef = useRef<THREE.Group>(null);
  const texture = useLoader(THREE.TextureLoader, URLS.diffuse);
  const haloTexture = useLoader(THREE.TextureLoader, URLS.halo);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {/* The Earth */}
      <mesh>
        <sphereGeometry args={[2.2, 64, 64]} />
        <meshStandardMaterial
          map={texture}
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>

      {/* The Halo (Atmosphere) */}
      <mesh scale={[1.4, 1.4, 1]} position={[0, 0, 0.1]}>
        <planeGeometry args={[5, 5]} />
        <meshBasicMaterial
          map={haloTexture}
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          opacity={0.8}
        />
      </mesh>
    </group>
  );
}

const CARDS = [
  { key: "jeep", icon: Truck, color: "#1a3d2b" },
  { key: "flight", icon: Plane, color: "#40916c" },
  { key: "visa", icon: FileText, color: "#c9a84c" },
  { key: "safety", icon: Shield, color: "#2d6a4f" },
];

export default function TransportSection() {
  const t = useTranslations("transport");
  const headRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.fromTo(headRef.current, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.9, scrollTrigger: { trigger: headRef.current, start: "top 85%" } });
    if (cardsRef.current) {
      gsap.fromTo(cardsRef.current.children, { opacity: 0, x: -50 }, { opacity: 1, x: 0, duration: 0.6, stagger: 0.15, ease: "power3.out", scrollTrigger: { trigger: cardsRef.current, start: "top 80%" } });
    }
    gsap.fromTo(canvasRef.current, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 1, ease: "power3.out", scrollTrigger: { trigger: canvasRef.current, start: "top 80%" } });
  }, []);

  return (
    <section id="transport" className="section-padding bg-slate-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div ref={headRef} className="text-center mb-16">
          <span className="section-badge">{t("title")}</span>
          <h2 className="section-title">{t("title")}</h2>
          <p className="section-subtitle">{t("subtitle")}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div ref={cardsRef} className="space-y-6">
            {CARDS.map(({ key, icon: Icon, color }) => (
              <div key={key} className="bg-white/80 backdrop-blur-md p-7 rounded-[2rem] shadow-sm border border-white flex gap-6 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg" style={{ background: `linear-gradient(135deg, ${color}, #000)`, color: "#fff" }}>
                  <Icon size={24} />
                </div>
                <div>
                  <h4 className="font-playfair font-bold text-xl mb-2 text-[#1a3d2b]">{t(`${key}_title` as any)}</h4>
                  <p className="text-gray-500 text-sm leading-relaxed mb-4">{t(`${key}_desc` as any)}</p>
                  <button onClick={() => {
                    window.dispatchEvent(new CustomEvent("select-booking-item", { detail: t(`${key}_title` as any) }));
                  }} className="inline-flex items-center gap-2 font-black text-[10px] uppercase tracking-[0.2em] cursor-pointer border-none bg-none p-0 align-baseline" style={{ color }}>
                    {t("learn_more")} <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div ref={canvasRef} className="relative h-[600px] w-full rounded-[3rem] overflow-hidden shadow-2xl bg-black">
            {/* Background Image Layer */}
            <div
              className="absolute inset-0 opacity-40 bg-cover bg-center"
              style={{ backgroundImage: `url(${URLS.bg})` }}
            />

            <Canvas camera={{ position: [0, 0, 8], fov: 40 }}>
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} intensity={1.5} color="#c9a84c" />
              <pointLight position={[-10, -10, -10]} intensity={0.5} color="#40916c" />
              <Suspense fallback={null}>
                <RealisticGlobe />
              </Suspense>
              <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
            </Canvas>
          </div>
        </div>
      </div>
    </section>
  );
}
