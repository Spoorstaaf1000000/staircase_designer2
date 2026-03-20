"use client";

import React, { useState, useMemo } from 'react';
import { Scale, ArrowUpRight, Ruler, AlertTriangle } from 'lucide-react';
import ThreeDViewer from '@/components/ThreeDViewer';
import InputPanel from '@/components/InputPanel';
import { StaircaseInputs, GeometryStats } from '@/types';
import { calculateGeometry } from '@/lib/geometryUtils';

const defaultInputs: StaircaseInputs = {
  totalHeight: 3200, // 3.2m
  riserHeight: 180, // 18cm
  treadDepth: 280, // 28cm
  width: 1000, // 1m
  maxConsecutiveSteps: 10,
  minHeadroom: 2000, // 2m
  stairSlabThickness: 150, // 150mm
  landingThickness: 200, // 200mm
  landingDirections: ['u-shape-left']
};

export default function Home() {
  const [inputs, setInputs] = useState<StaircaseInputs>(defaultInputs);
  const stats: GeometryStats = useMemo(() => calculateGeometry(inputs), [inputs]);

  return (
    <main className="min-h-screen grid grid-cols-1 md:grid-cols-12 overflow-hidden bg-slate-900 text-slate-100 font-sans">
      
      {/* Left Panel: Inputs */}
      <section className="md:col-span-4 lg:col-span-3 p-6 flex flex-col gap-6 custom-scrollbar overflow-y-auto border-r border-white/5 bg-slate-900 relative z-20 shadow-[4px_0_24px_rgba(0,0,0,0.3)]">
        <header className="flex items-center gap-3 border-b border-white/5 pb-5">
          <div className="bg-blue-500/10 p-2.5 rounded-xl border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
            <Scale className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white leading-tight">
              StairLogic <span className="text-blue-500">3D</span>
            </h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-bold mt-0.5">Geometry Planner</p>
          </div>
        </header>

        <InputPanel inputs={inputs} setInputs={setInputs} />
      </section>

      {/* Right Panel: 3D View and Statistics */}
      <section className="md:col-span-8 lg:col-span-9 flex flex-col relative h-screen bg-slate-950">
        
        {/* Top Info Bar: Statistics Preview */}
        <div className="absolute top-6 left-6 right-6 z-10 flex gap-4 pointer-events-none">
          <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 p-5 rounded-2xl shadow-2xl pointer-events-auto flex items-center justify-between mx-auto flex-wrap gap-y-4 shadow-[0_10px_40px_rgba(0,0,0,0.5)] w-full max-w-4xl">
            
            <div className="flex flex-col">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 mb-1">
                <ArrowUpRight className="w-3.5 h-3.5 text-blue-400"/> Total Rise
              </span>
              <span className="text-3xl font-light text-white">{stats.totalRise.toFixed(0)} <span className="text-sm text-slate-500 font-normal">mm</span></span>
            </div>
            
            <div className="w-px h-10 bg-slate-800 hidden sm:block"></div>
            
            <div className="flex flex-col">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 mb-1">
                <Ruler className="w-3.5 h-3.5 text-purple-400"/> Total Run
              </span>
              <span className="text-3xl font-light text-white">{stats.totalRunLength.toFixed(0)} <span className="text-sm text-slate-500 font-normal">mm</span></span>
            </div>
            
            <div className="w-px h-10 bg-slate-800 hidden sm:block"></div>
            
            <div className="flex flex-col">
               <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Steps / Risers</span>
               <span className="text-3xl font-light text-white">{stats.totalSteps}</span>
            </div>
            
            <div className="w-px h-10 bg-slate-800 hidden sm:block"></div>
            
            <div className="flex flex-col">
               <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Landings</span>
               <span className="text-3xl font-light text-white">{stats.numLandings}</span>
            </div>

            <div className="w-px h-10 bg-slate-800 hidden md:block"></div>
            
            <div className="flex flex-col">
               <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Actual Riser</span>
               <span className="text-xl font-medium text-blue-300">{stats.actualRiserHeight.toFixed(1)} mm</span>
            </div>
          </div>
        </div>

        {/* Warnings overlay */}
        {stats.warnings.length > 0 && (
          <div className="absolute top-[120px] left-0 right-0 z-10 flex justify-center pointer-events-none">
            <div className="bg-amber-500/10 backdrop-blur-md border border-amber-500/30 text-amber-200 px-5 py-2.5 rounded-full text-xs font-medium flex items-center gap-3 shadow-[0_5px_20px_rgba(245,158,11,0.15)] max-w-lg text-center">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
              <span>{stats.warnings[0]} {stats.warnings.length > 1 && `(+${stats.warnings.length - 1} more)`}</span>
            </div>
          </div>
        )}

        {/* The 3D Canvas wrapper */}
        <div className="flex-1 w-full h-full relative cursor-move">
            <ThreeDViewer stats={stats} />
        </div>

      </section>
    </main>
  );
}
