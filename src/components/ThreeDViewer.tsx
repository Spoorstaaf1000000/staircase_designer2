"use client";

import React, { Suspense, useMemo } from 'react';
import * as THREE from 'three';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Box, Environment, ContactShadows, Grid, Edges, Bounds, useBounds, Html } from '@react-three/drei';
import { GeometryStats, Segment } from '@/types';

function Flight({ segment }: { segment: Segment }) {
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    const D = segment.length / segment.stepCount!;
    const R = segment.height / segment.stepCount!;
    const T = segment.stairSlabThickness || 150;
    
    s.moveTo(0, 0);
    // Draw the top steps (risers and treads)
    for (let i = 0; i < segment.stepCount!; i++) {
       s.lineTo(i * D, (i + 1) * R);
       s.lineTo((i + 1) * D, (i + 1) * R);
    }
    
    // Draw the soffit (underside) ensuring perpendicular thickness T
    const L = segment.length;
    const M = Math.sqrt(R*R + D*D);
    const dx = T * R / M;
    const dy = -T * D / M;
    
    const y_soffit_L = (R / D) * (L - dx) + dy;
    const y_soffit_0 = (R / D) * (0 - dx) + dy;
    
    // Drop vertically from the last inner corner to the soffit line
    s.lineTo(L, y_soffit_L);
    // Draw the soffit back to the start
    s.lineTo(0, y_soffit_0);
    // Close the shape vertically
    s.lineTo(0, 0);
    
    return s;
  }, [segment]);

  let rotY = 0;
  if (segment.direction === 'north') rotY = -Math.PI/2;
  else if (segment.direction === 'south') rotY = Math.PI/2;
  else if (segment.direction === 'east') rotY = 0;
  else if (segment.direction === 'west') rotY = Math.PI;

  return (
    <group position={[segment.startPos.x, segment.startPos.y, segment.startPos.z]} rotation={[0, rotY, 0]}>
      <mesh castShadow receiveShadow position={[0, 0, -segment.width/2]}>
        <extrudeGeometry args={[shape, { depth: segment.width, bevelEnabled: false }]} />
        <meshStandardMaterial color="#1e40af" roughness={0.4} metalness={0.2} />
        <Edges threshold={15} color="#60a5fa" />
      </mesh>
    </group>
  );
}

function Landing({ segment }: { segment: Segment }) {
   const thickness = segment.landingThickness || 200; 
   
   let cx = segment.startPos.x;
   let cy = segment.startPos.y - thickness / 2;
   let cz = segment.startPos.z;
   let size: [number, number, number] = [segment.width, thickness, segment.length];

   if (segment.direction === 'north') { cz += segment.length / 2; }
   else if (segment.direction === 'south') { cz -= segment.length / 2; }
   else if (segment.direction === 'east') { cx += segment.length / 2; size = [segment.length, thickness, segment.width]; }
   else if (segment.direction === 'west') { cx -= segment.length / 2; size = [segment.length, thickness, segment.width]; }
   
   if (segment.turn === 'u-shape-left') {
      if (segment.direction === 'north') { cx -= segment.width / 4; size = [segment.width, thickness, segment.length]; }
      if (segment.direction === 'south') { cx += segment.width / 4; size = [segment.width, thickness, segment.length]; }
      if (segment.direction === 'east') { cz -= segment.width / 4; size = [segment.length, thickness, segment.width]; }
      if (segment.direction === 'west') { cz += segment.width / 4; size = [segment.length, thickness, segment.width]; }
   } else if (segment.turn === 'u-shape-right') {
      if (segment.direction === 'north') { cx += segment.width / 4; size = [segment.width, thickness, segment.length]; }
      if (segment.direction === 'south') { cx -= segment.width / 4; size = [segment.width, thickness, segment.length]; }
      if (segment.direction === 'east') { cz += segment.width / 4; size = [segment.length, thickness, segment.width]; }
      if (segment.direction === 'west') { cz -= segment.width / 4; size = [segment.length, thickness, segment.width]; }
   }
   
   return (
     <Box position={[cx, cy, cz]} args={size} castShadow receiveShadow>
       <meshStandardMaterial color="#0369a1" roughness={0.3} metalness={0.1} />
       <Edges scale={1} threshold={15} color="#38bdf8" />
     </Box>
   );
}

function ViewTools() {
  const bounds = useBounds();
  const { camera } = useThree();

  return (
    <Html
      zIndexRange={[100, 0]}
      style={{
        position: 'absolute',
        top: '-40vh',
        right: '-40vw',
        width: '120px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}
    >
      <button
        onClick={(e) => { e.stopPropagation(); bounds.refresh().clip().fit(); }}
        className="bg-slate-800/90 hover:bg-slate-700/90 backdrop-blur-md text-white border border-white/20 px-3 py-2 rounded-lg text-xs font-semibold shadow-2xl transition cursor-pointer select-none flex items-center justify-center gap-2"
        title="Fit entire staircase into view"
      >
        <span>🔍</span> Fit View
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); camera.position.set(0, 5000, 0); camera.lookAt(0,0,0); }}
        className="bg-slate-800/90 hover:bg-slate-700/90 backdrop-blur-md text-white border border-white/20 px-3 py-2 rounded-lg text-xs font-semibold shadow-2xl transition cursor-pointer select-none flex items-center justify-center gap-2"
        title="View from directly above"
      >
        <span>⬇️</span> Top View
      </button>
    </Html>
  );
}

export default function ThreeDViewer({ stats }: { stats: GeometryStats }) {
  return (
    <div className="w-full h-full relative cursor-move">
      <Canvas shadows camera={{ position: [4000, 3000, 4000], fov: 45, far: 200000, near: 10 }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.7} />
          <directionalLight 
             castShadow 
             position={[5000, 10000, 2000]} 
             intensity={1.8} 
             shadow-mapSize={[4096, 4096]} 
             shadow-camera-far={30000}
             shadow-camera-left={-5000}
             shadow-camera-right={5000}
             shadow-camera-top={5000}
             shadow-camera-bottom={-5000}
          />
          <Environment preset="city" />
          
          <Bounds fit clip observe margin={1.2}>
            <group position={[0, -stats.totalRise / 2, 0]}>
               {stats.segments.map((seg) => (
                  seg.type === 'flight' 
                    ? <Flight key={seg.id} segment={seg} /> 
                    : <Landing key={seg.id} segment={seg} />
               ))}
            </group>
            <ViewTools />
          </Bounds>

          <Grid infiniteGrid fadeDistance={25000} cellColor="#334155" sectionColor="#475569" sectionSize={1000} cellSize={100} position={[0, -stats.totalRise / 2, 0]} />
          <ContactShadows position={[0, -stats.totalRise / 2, 0]} opacity={0.5} scale={20000} blur={2.5} far={10000} />

          <OrbitControls 
             makeDefault 
             maxPolarAngle={Math.PI / 2 + 0.05}
             minDistance={500}
             maxDistance={30000}
             enableDamping
             dampingFactor={0.05}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
