import { StaircaseInputs, GeometryStats, Segment, Vector3D, TurnDirection } from '../types';

export function calculateGeometry(inputs: StaircaseInputs): GeometryStats {
  const { totalHeight, riserHeight, treadDepth, width, maxConsecutiveSteps, minHeadroom, landingDirections } = inputs;
  const warnings: string[] = [];
  
  if (riserHeight <= 0 || treadDepth <= 0 || width <= 0) {
    return {
      totalSteps: 0,
      actualRiserHeight: 0,
      totalRunLength: 0,
      totalRise: 0,
      numLandings: 0,
      warnings: ["Dimensions must be positive."],
      segments: []
    };
  }

  const rawSteps = totalHeight / riserHeight;
  const totalSteps = Math.max(1, Math.round(rawSteps));
  const actualRiser = totalHeight / totalSteps;
  
  if (Math.abs(actualRiser - riserHeight) > 0.1) {
      warnings.push(`Riser height automatically adjusted from ${riserHeight.toFixed(1)}cm to ${actualRiser.toFixed(1)}cm to fit the total height.`);
  }

  const segments: Segment[] = [];
  let stepsRemaining = totalSteps;
  
  // Starting state
  let currentPos: Vector3D = { x: 0, y: 0, z: 0 };
  let currentDir: 'north' | 'east' | 'south' | 'west' = 'north'; 
  // Custom coordinate system: north = +z, east = +x, south = -z, west = -x
  let landingIndex = 0;
  let totalRunLength = 0;
  let idCounter = 0;

  while (stepsRemaining > 0) {
    const stepsInFlight = Math.min(stepsRemaining, maxConsecutiveSteps);
    const flightLength = stepsInFlight * treadDepth;
    const flightHeight = stepsInFlight * actualRiser;
    
    // Create Flight segment
    const flightEndPos = movePos(currentPos, currentDir, flightLength, flightHeight);
    segments.push({
      id: `flight-${++idCounter}`,
      type: 'flight',
      startPos: { ...currentPos },
      endPos: { ...flightEndPos },
      direction: currentDir,
      stepCount: stepsInFlight,
      length: flightLength,
      height: flightHeight,
      width: width,
      stairSlabThickness: inputs.stairSlabThickness,
    });
    
    totalRunLength += flightLength;
    currentPos = { ...flightEndPos };
    stepsRemaining -= stepsInFlight;

    // Need a landing?
    if (stepsRemaining > 0) {
      const turnDir = landingDirections[landingIndex] || 'straight';
      landingIndex++;
      
      let landingLength = width; 
      let landingWidth = width;
      let nextDir: 'north' | 'east' | 'south' | 'west' = currentDir;
      let nextPos = { ...currentPos };

      if (turnDir === 'u-shape-left' || turnDir === 'u-shape-right') {
        landingLength = width; 
        landingWidth = width * 2; // Double wide for U-turn
      }

      // Calculate where the NEXT flight starts based on the turn
      // The endPos of the landing is recorded as the start of the next flight
      if (turnDir === 'straight') {
        nextPos = movePos(currentPos, currentDir, landingLength, 0);
      } else if (turnDir === 'l-shape-left') {
        nextDir = turnLeft(currentDir);
        nextPos = movePos(currentPos, currentDir, landingLength / 2, 0);
        nextPos = movePos(nextPos, turnLeft(currentDir), width / 2, 0);
      } else if (turnDir === 'l-shape-right') {
        nextDir = turnRight(currentDir);
        nextPos = movePos(currentPos, currentDir, landingLength / 2, 0);
        nextPos = movePos(nextPos, turnRight(currentDir), width / 2, 0);
      } else if (turnDir === 'u-shape-left') {
        nextDir = turnLeft(turnLeft(currentDir));
        nextPos = movePos(currentPos, turnLeft(currentDir), width, 0);
      } else if (turnDir === 'u-shape-right') {
        nextDir = turnRight(turnRight(currentDir));
        nextPos = movePos(currentPos, turnRight(currentDir), width, 0);
      }

      segments.push({
        id: `landing-${++idCounter}`,
        type: 'landing',
        startPos: { ...currentPos },
        endPos: { ...nextPos },
        direction: currentDir,
        length: landingLength,
        height: 0,
        width: landingWidth,
        landingThickness: inputs.landingThickness,
        turn: turnDir
      });

      totalRunLength += landingLength;
      currentPos = { ...nextPos };
      currentDir = nextDir;
    }
  }

  return {
    totalSteps: totalSteps,
    actualRiserHeight: actualRiser,
    totalRunLength: totalRunLength,
    totalRise: totalHeight,
    numLandings: segments.filter(s => s.type === 'landing').length,
    warnings: warnings,
    segments: segments
  };
}

function movePos(pos: Vector3D, dir: string, distance: number, height: number): Vector3D {
  const p = { ...pos };
  p.y += height;
  if (dir === 'north') p.z += distance;
  else if (dir === 'south') p.z -= distance;
  else if (dir === 'east') p.x += distance;
  else if (dir === 'west') p.x -= distance;
  return p;
}

// Add vector algebraically
function addVec(pos: Vector3D, dir1: string, dist1: number, dir2: string, dist2: number): Vector3D {
  let p = movePos(pos, dir1, dist1, 0);
  p = movePos(p, dir2, dist2, 0);
  return p;
}

function movePosDirectionally(pos: Vector3D, forwardDir: string, forwardDist: number, height: number, leftDist: number): Vector3D {
  let p = movePos(pos, forwardDir, forwardDist, height);
  p = movePos(p, turnLeft(forwardDir), leftDist, 0);
  return p;
}

function turnLeft(dir: string): 'north' | 'east' | 'south' | 'west' {
  if (dir === 'north') return 'west';
  if (dir === 'west') return 'south';
  if (dir === 'south') return 'east';
  return 'north';
}

function turnRight(dir: string): 'north' | 'east' | 'south' | 'west' {
  if (dir === 'north') return 'east';
  if (dir === 'east') return 'south';
  if (dir === 'south') return 'west';
  return 'north';
}
