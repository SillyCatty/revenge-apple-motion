/**
 * Apple Motion Physics: Springs and UIKit Rubber-Banding
 * Based on Apple Human Interface Guidelines and iOS UIKit physics
 */

export const RUBBER_BAND_COEFFICIENT = 0.55;

/**
 * Calculates rubber-band resistance when dragged past a boundary
 * @param pull Pixels dragged past limit
 * @param dimension Axis dimension (screen width/height or element size)
 * @param coefficient UIKit rubber banding factor (default: 0.55)
 */
export function rubberBand(pull: number, dimension: number, coefficient = RUBBER_BAND_COEFFICIENT): number {
  if (dimension <= 0 || pull === 0) return 0;
  const offset = (1 - 1 / ((coefficient * Math.abs(pull)) / dimension + 1)) * dimension;
  return pull < 0 ? -offset : offset;
}

/**
 * Bounds a value between min and max, applying rubber-banding beyond boundaries
 */
export function rubberBanded(value: number, min: number, max: number, dimension: number): number {
  if (value > max) return max + rubberBand(value - max, dimension);
  if (value < min) return min - rubberBand(min - value, dimension);
  return value;
}

/**
 * Standard Apple Spring Configurations
 * Damping ratios:
 * - smooth: 1.0 (critically damped, calm, default)
 * - snappy: 0.85 (responsive, slight bounce)
 * - bouncy: 0.70 (playful, celebratory)
 */
export const AppleSpringConfig = {
  smooth: {
    dampingRatio: 1.0,
    stiffness: 280,
    damping: 30,
    mass: 1,
  },
  snappy: {
    dampingRatio: 0.85,
    stiffness: 350,
    damping: 28,
    mass: 1,
  },
  bouncy: {
    dampingRatio: 0.70,
    stiffness: 400,
    damping: 24,
    mass: 1,
  },
};
