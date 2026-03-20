export type TurnDirection = 'straight' | 'l-shape-left' | 'l-shape-right' | 'u-shape-left' | 'u-shape-right';

export interface StaircaseInputs {
  totalHeight: number; // mm
  riserHeight: number; // mm
  treadDepth: number; // mm
  width: number; // mm
  maxConsecutiveSteps: number; // integer
  minHeadroom: number; // mm
  stairSlabThickness: number; // mm
  landingThickness: number; // mm
  landingDirections: TurnDirection[]; 
}

export type SegmentType = 'flight' | 'landing';

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface Segment {
  id: string;
  type: SegmentType;
  startPos: Vector3D;
  endPos: Vector3D;
  direction: 'north' | 'east' | 'south' | 'west'; 
  stepCount?: number;
  length: number; // mm
  height: number; // mm
  width: number; // mm
  stairSlabThickness?: number;
  landingThickness?: number;
  turn?: TurnDirection; 
}

export interface GeometryStats {
  totalSteps: number;
  actualRiserHeight: number; // mm
  totalRunLength: number; // mm
  totalRise: number; // mm
  numLandings: number;
  warnings: string[];
  segments: Segment[];
}
