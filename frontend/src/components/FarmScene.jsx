import React, { useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, OrbitControls, Sparkles } from '@react-three/drei';
import { useReducedMotion } from '../hooks/useReducedMotion';

const zones = [
  { id: 'north', x: -1.65, z: -0.75, moisture: 62, status: 'Balanced', water: '8.4 mm' },
  { id: 'central', x: 0, z: 0, moisture: 48, status: 'Needs water', water: '12.8 mm' },
  { id: 'south', x: 1.65, z: 0.75, moisture: 71, status: 'Healthy', water: '6.1 mm' },
];

function CropRows({ activeZone, onSelect }) {
  const rows = useMemo(() => Array.from({ length: 7 }, (_, row) => (
    Array.from({ length: 12 }, (_, crop) => {
      const zone = row < 3 ? zones[0] : row > 4 ? zones[2] : zones[1];
      return { x: (crop - 5.5) * 0.46, z: (row - 3) * 0.48, zone };
    })
  )).flat(), []);

  return (
    <group>
      {rows.map(({ x, z, zone }, index) => {
        const selected = activeZone === zone.id;
        return (
          <group key={index} position={[x, 0.14, z]} onClick={(event) => {
            event.stopPropagation();
            onSelect(zone.id);
          }}>
            <mesh castShadow scale={selected ? 1.14 : 1}>
              <coneGeometry args={[0.14, 0.42, 5]} />
              <meshStandardMaterial color={selected ? '#8fd6b4' : '#3f7f63'} roughness={0.9} />
            </mesh>
            <mesh position={[0, -0.12, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[0.16, 8]} />
              <meshBasicMaterial color={selected ? '#6fb6ff' : '#245744'} transparent opacity={0.32} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

function IrrigationLines() {
  return (
    <group>
      {[-1.42, -0.47, 0.47, 1.42].map((x) => (
        <mesh key={x} position={[x, 0.07, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.025, 0.025, 3.8, 8]} />
          <meshStandardMaterial color="#6fb6ff" emissive="#1d4e80" emissiveIntensity={0.7} />
        </mesh>
      ))}
      {Array.from({ length: 14 }, (_, index) => (
        <WaterParticle key={index} position={[-1.7 + index * 0.26, 0.12, 0]} delay={index * 0.12} />
      ))}
    </group>
  );
}

function WaterParticle({ position, delay }) {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.position.z = ((clock.getElapsedTime() * 0.42 + delay) % 3.2) - 1.6;
  });
  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[0.055, 8, 8]} />
      <meshBasicMaterial color="#bfe0ff" />
    </mesh>
  );
}

function FarmModel({ activeZone, onSelect, reduced }) {
  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 5, 2]} intensity={2.1} color="#d8e7f8" />
      <pointLight position={[-3, 2, 1]} intensity={3.6} distance={8} color="#8fd6b4" />
      <Float speed={0.7} rotationIntensity={0.08} floatIntensity={0.12}>
        <group rotation={[-0.65, 0.15, 0.1]}>
          <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} onClick={() => onSelect(null)}>
            <planeGeometry args={[7.2, 4.2]} />
            <meshStandardMaterial color="#0c1a17" roughness={1} />
          </mesh>
          <CropRows activeZone={activeZone} onSelect={onSelect} />
          <IrrigationLines />
          <mesh position={[0, 0.05, -2]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[7.2, 0.08]} />
            <meshBasicMaterial color="#6fb6ff" transparent opacity={0.75} />
          </mesh>
        </group>
      </Float>
      <Sparkles count={22} scale={[7, 2.8, 4]} size={2.2} speed={0.3} color="#6fb6ff" />
      <OrbitControls enableZoom={false} enablePan={false} minPolarAngle={0.8} maxPolarAngle={1.35} autoRotate={!reduced} autoRotateSpeed={0.35} />
    </>
  );
}

function SceneFallback() {
  return (
    <div className="scene-fallback" aria-label="Illustration of connected crop rows and irrigation lines">
      {Array.from({ length: 5 }, (_, row) => <span key={row} style={{ '--row': row }} />)}
      <i />
    </div>
  );
}

export function FarmScene() {
  const [activeZone, setActiveZone] = useState('central');
  const reduced = useReducedMotion();
  const active = zones.find((zone) => zone.id === activeZone) || zones[1];

  return (
    <div className="farm-scene-wrap">
      <Canvas camera={{ position: [0, 3.6, 4.6], fov: 40 }} dpr={[1, 1.5]} fallback={<SceneFallback />}>
        <FarmModel activeZone={activeZone} onSelect={setActiveZone} reduced={reduced} />
      </Canvas>
      <div className="scene-label scene-label-top">
        <span className="live-pulse" /> LIVE FIELD MODEL
      </div>
      <button className="zone-insight" type="button" onClick={() => setActiveZone(activeZone === 'central' ? 'south' : 'central')}>
        <span className="zone-name">{active.id} zone</span>
        <strong>{active.moisture}% <small>soil moisture</small></strong>
        <span>{active.status} · {active.water} recommended</span>
      </button>
    </div>
  );
}

export function WaterDropVisual({ level = 0.62 }) {
  return (
    <div className="water-drop-visual" style={{ '--drop-level': `${Math.max(0.2, Math.min(1, level)) * 100}%` }}>
      <div className="drop-core" />
      <span className="drop-ring ring-one" />
      <span className="drop-ring ring-two" />
    </div>
  );
}

export default FarmScene;
