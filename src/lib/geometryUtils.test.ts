import { describe, expect, it } from 'vitest';

import { calculateGeometry } from './geometryUtils';
import { StaircaseInputs } from '../types';

const baseInputs: StaircaseInputs = {
  totalHeight: 3000,
  riserHeight: 180,
  treadDepth: 250,
  width: 1000,
  maxConsecutiveSteps: 10,
  minHeadroom: 2000,
  stairSlabThickness: 180,
  landingThickness: 180,
  landingDirections: ['straight', 'l-shape-left', 'u-shape-right'],
};

describe('calculateGeometry', () => {
  it('returns validation warning for non-positive dimensions', () => {
    const result = calculateGeometry({
      ...baseInputs,
      riserHeight: 0,
    });

    expect(result.totalSteps).toBe(0);
    expect(result.segments).toHaveLength(0);
    expect(result.warnings).toContain('Dimensions must be positive.');
  });

  it('calculates rounded steps and adjusted riser warning', () => {
    const result = calculateGeometry(baseInputs);

    // 3000 / 180 = 16.666..., rounded to 17
    expect(result.totalSteps).toBe(17);
    expect(result.actualRiserHeight).toBeCloseTo(3000 / 17, 6);
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings[0]).toContain('Riser height automatically adjusted');
  });

  it('creates expected number of landings and segment order', () => {
    const result = calculateGeometry(baseInputs);

    // 17 steps with max 10 creates two flights and one landing in-between.
    expect(result.numLandings).toBe(1);
    expect(result.segments).toHaveLength(3);
    expect(result.segments[0].type).toBe('flight');
    expect(result.segments[1].type).toBe('landing');
    expect(result.segments[2].type).toBe('flight');
  });

  it('applies landing direction when creating next flight direction', () => {
    const result = calculateGeometry({
      ...baseInputs,
      totalHeight: 4000,
      riserHeight: 200,
      maxConsecutiveSteps: 8,
      landingDirections: ['l-shape-right', 'u-shape-left'],
    });

    // 20 steps at max 8 => flights of 8,8,4 with two landings
    expect(result.numLandings).toBe(2);

    const firstFlight = result.segments[0];
    const secondFlight = result.segments[2];
    const thirdFlight = result.segments[4];

    expect(firstFlight.type).toBe('flight');
    expect(secondFlight.type).toBe('flight');
    expect(thirdFlight.type).toBe('flight');

    // Start heading north, then right turn => east, then U-left => west.
    expect(firstFlight.direction).toBe('north');
    expect(secondFlight.direction).toBe('east');
    expect(thirdFlight.direction).toBe('west');
  });
});
