"use client";

import React from 'react';
import { StaircaseInputs, TurnDirection } from '@/types';

export default function InputPanel({ 
  inputs, 
  setInputs 
}: { 
  inputs: StaircaseInputs, 
  setInputs: (i: StaircaseInputs) => void 
}) {

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputs({ ...inputs, [name]: parseFloat(value) });
  };

  const handleLandingDirectionChange = (index: number, val: TurnDirection) => {
    const newDirs = [...inputs.landingDirections];
    newDirs[index] = val;
    setInputs({ ...inputs, landingDirections: newDirs });
  };

  const turnOptions: { value: TurnDirection, label: string }[] = [
    { value: 'straight', label: 'Straight' },
    { value: 'l-shape-left', label: 'L-Shape (Left)' },
    { value: 'l-shape-right', label: 'L-Shape (Right)' },
    { value: 'u-shape-left', label: 'U-Shape (Left)' },
    { value: 'u-shape-right', label: 'U-Shape (Right)' }
  ];

  return (
    <div className="flex flex-col gap-5 pb-10">
      
      <div className="bg-slate-800/60 p-5 rounded-2xl border border-white/5 backdrop-blur-sm transition hover:border-white/10 shadow-lg">
         <h2 className="text-sm font-semibold mb-4 text-blue-400 uppercase tracking-widest">Dimensions (mm)</h2>
         
         <div className="flex flex-col gap-5">
           <label className="flex flex-col gap-1.5 text-xs text-slate-300 font-medium">
             <span className="flex justify-between">Total Height <span className="text-white bg-slate-700/50 px-2 py-0.5 rounded shadow-inner">{inputs.totalHeight} mm</span></span>
             <input type="range" name="totalHeight" min="1000" max="10000" step="10" value={inputs.totalHeight} onChange={handleChange} className="accent-blue-500 w-full" />
           </label>
           
           <label className="flex flex-col gap-1.5 text-xs text-slate-300 font-medium">
             <span className="flex justify-between">Staircase Width <span className="text-white bg-slate-700/50 px-2 py-0.5 rounded shadow-inner">{inputs.width} mm</span></span>
             <input type="range" name="width" min="600" max="3000" step="10" value={inputs.width} onChange={handleChange} className="accent-blue-500 w-full" />
           </label>

           <label className="flex flex-col gap-1.5 text-xs text-slate-300 font-medium">
             <span className="flex justify-between">Target Riser Height <span className="text-white bg-slate-700/50 px-2 py-0.5 rounded shadow-inner">{inputs.riserHeight} mm</span></span>
             <input type="range" name="riserHeight" min="150" max="250" step="1" value={inputs.riserHeight} onChange={handleChange} className="accent-blue-500 w-full" />
           </label>

           <label className="flex flex-col gap-1.5 text-xs text-slate-300 font-medium">
             <span className="flex justify-between">Tread Depth <span className="text-white bg-slate-700/50 px-2 py-0.5 rounded shadow-inner">{inputs.treadDepth} mm</span></span>
             <input type="range" name="treadDepth" min="200" max="400" step="5" value={inputs.treadDepth} onChange={handleChange} className="accent-blue-500 w-full" />
           </label>
         </div>
      </div>

      <div className="bg-slate-800/60 p-5 rounded-2xl border border-white/5 backdrop-blur-sm transition hover:border-white/10 shadow-lg">
         <h2 className="text-sm font-semibold mb-4 text-purple-400 uppercase tracking-widest">Constraints & Landings</h2>
         
         <div className="flex flex-col gap-5">
           <label className="flex flex-col gap-1.5 text-xs text-slate-300 font-medium">
             <span className="flex justify-between">Max Consecutive Steps <span className="text-white bg-slate-700/50 px-2 py-0.5 rounded shadow-inner">{inputs.maxConsecutiveSteps}</span></span>
             <input type="range" name="maxConsecutiveSteps" min="3" max="30" step="1" value={inputs.maxConsecutiveSteps} onChange={handleChange} className="accent-purple-500 w-full" />
           </label>

           <label className="flex flex-col gap-1.5 text-xs text-slate-300 font-medium">
             <span className="flex justify-between">Minimum Headroom <span className="text-white bg-slate-700/50 px-2 py-0.5 rounded shadow-inner">{inputs.minHeadroom} mm</span></span>
             <input type="range" name="minHeadroom" min="1800" max="3000" step="50" value={inputs.minHeadroom} onChange={handleChange} className="accent-purple-500 w-full" />
           </label>

           <label className="flex flex-col gap-1.5 text-xs text-slate-300 font-medium">
             <span className="flex justify-between">Stair Slab Thickness <span className="text-white bg-slate-700/50 px-2 py-0.5 rounded shadow-inner">{inputs.stairSlabThickness} mm</span></span>
             <input type="range" name="stairSlabThickness" min="50" max="300" step="10" value={inputs.stairSlabThickness} onChange={handleChange} className="accent-blue-500 w-full" />
           </label>

           <label className="flex flex-col gap-1.5 text-xs text-slate-300 font-medium">
             <span className="flex justify-between">Landing Thickness <span className="text-white bg-slate-700/50 px-2 py-0.5 rounded shadow-inner">{inputs.landingThickness} mm</span></span>
             <input type="range" name="landingThickness" min="50" max="300" step="10" value={inputs.landingThickness} onChange={handleChange} className="accent-blue-500 w-full" />
           </label>

           <div className="mt-3 bg-slate-900/40 p-3 rounded-xl border border-white/5">
              <span className="text-xs text-slate-300 font-medium mb-3 block">Landing Configurations</span>
              {inputs.landingDirections.map((dir, i) => (
                 <div key={i} className="mb-2 flex items-center gap-3 bg-slate-800/80 p-2 rounded-lg border border-slate-700/50 shadow-sm">
                    <span className="text-xs text-slate-400 font-semibold shrink-0 w-16">Landing {i+1}</span>
                    <select 
                       value={dir} 
                       onChange={(e) => handleLandingDirectionChange(i, e.target.value as TurnDirection)}
                       className="bg-transparent text-sm text-white w-full outline-none focus:ring-0 cursor-pointer"
                    >
                      {turnOptions.map(opt => <option key={opt.value} value={opt.value} className="bg-slate-800 text-white">{opt.label}</option>)}
                    </select>
                 </div>
              ))}
              <div className="flex justify-between mt-4">
                 <button 
                   onClick={() => setInputs({...inputs, landingDirections: [...inputs.landingDirections, 'straight']})}
                   className="text-[11px] font-bold uppercase tracking-wider bg-slate-700/80 hover:bg-blue-600 border border-slate-600 hover:border-blue-500 text-white py-1.5 px-3 rounded-lg transition-all"
                 >
                   + Add Landing
                 </button>
                 {inputs.landingDirections.length > 0 && (
                   <button 
                     onClick={() => setInputs({...inputs, landingDirections: inputs.landingDirections.slice(0, -1)})}
                     className="text-[11px] font-bold uppercase tracking-wider bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-transparent hover:border-red-500/30 py-1.5 px-3 rounded-lg transition-all"
                   >
                     Remove Last
                   </button>
                 )}
              </div>
           </div>
         </div>
      </div>

    </div>
  );
}
