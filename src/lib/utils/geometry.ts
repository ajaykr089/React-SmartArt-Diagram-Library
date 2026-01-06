import { Position, Size } from '../types/diagram';

export class GeometryUtils {
  /**
   * Calculate the distance between two points
   */
  static distance(p1: Position, p2: Position): number {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  }

  /**
   * Calculate the center point between two positions
   */
  static center(p1: Position, p2: Position): Position {
    return {
      x: (p1.x + p2.x) / 2,
      y: (p1.y + p2.y) / 2
    };
  }

  /**
   * Calculate the angle between two points (in radians)
   */
  static angle(p1: Position, p2: Position): number {
    return Math.atan2(p2.y - p1.y, p2.x - p1.x);
  }

  /**
   * Check if a point is inside a rectangle
   */
  static isPointInRect(point: Position, rect: Position & Size): boolean {
    return (
      point.x >= rect.x &&
      point.x <= rect.x + rect.width &&
      point.y >= rect.y &&
      point.y <= rect.y + rect.height
    );
  }

  /**
   * Check if a point is inside a circle
   */
  static isPointInCircle(point: Position, center: Position, radius: number): boolean {
    return this.distance(point, center) <= radius;
  }

  /**
   * Calculate the intersection point of a line with a rectangle boundary
   */
  static getLineRectIntersection(
    lineStart: Position,
    lineEnd: Position,
    rect: Position & Size
  ): Position | null {
    const rectLeft = rect.x;
    const rectRight = rect.x + rect.width;
    const rectTop = rect.y;
    const rectBottom = rect.y + rect.height;

    const intersections: Position[] = [];

    // Check intersection with each side of the rectangle
    const sides = [
      // Top side
      { start: { x: rectLeft, y: rectTop }, end: { x: rectRight, y: rectTop } },
      // Right side
      { start: { x: rectRight, y: rectTop }, end: { x: rectRight, y: rectBottom } },
      // Bottom side
      { start: { x: rectLeft, y: rectBottom }, end: { x: rectRight, y: rectBottom } },
      // Left side
      { start: { x: rectLeft, y: rectTop }, end: { x: rectLeft, y: rectBottom } }
    ];

    for (const side of sides) {
      const intersection = this.getLineIntersection(lineStart, lineEnd, side.start, side.end);
      if (intersection) {
        intersections.push(intersection);
      }
    }

    if (intersections.length === 0) return null;

    // Return the intersection closest to the line start
    return intersections.reduce((closest, current) => {
      const closestDist = this.distance(lineStart, closest);
      const currentDist = this.distance(lineStart, current);
      return currentDist < closestDist ? current : closest;
    });
  }

  /**
   * Calculate the intersection point of two line segments
   */
  static getLineIntersection(
    line1Start: Position,
    line1End: Position,
    line2Start: Position,
    line2End: Position
  ): Position | null {
    const x1 = line1Start.x;
    const y1 = line1Start.y;
    const x2 = line1End.x;
    const y2 = line1End.y;
    const x3 = line2Start.x;
    const y3 = line2Start.y;
    const x4 = line2End.x;
    const y4 = line2End.y;

    const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (Math.abs(denom) < 1e-10) return null; // Lines are parallel

    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
    const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;

    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
      return {
        x: x1 + t * (x2 - x1),
        y: y1 + t * (y2 - y1)
      };
    }

    return null;
  }

  /**
   * Generate points for a regular polygon
   */
  static generatePolygonPoints(center: Position, radius: number, sides: number): Position[] {
    const points: Position[] = [];
    for (let i = 0; i < sides; i++) {
      const angle = (i * 2 * Math.PI) / sides - Math.PI / 2; // Start from top
      points.push({
        x: center.x + radius * Math.cos(angle),
        y: center.y + radius * Math.sin(angle)
      });
    }
    return points;
  }

  /**
   * Convert degrees to radians
   */
  static degToRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Convert radians to degrees
   */
  static radToDeg(radians: number): number {
    return radians * (180 / Math.PI);
  }

  /**
   * Clamp a value between min and max
   */
  static clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }

  /**
   * Calculate bounding box for multiple positions
   */
  static getBoundingBox(positions: Position[]): { x: number; y: number; width: number; height: number } {
    if (positions.length === 0) return { x: 0, y: 0, width: 0, height: 0 };

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    positions.forEach(pos => {
      minX = Math.min(minX, pos.x);
      minY = Math.min(minY, pos.y);
      maxX = Math.max(maxX, pos.x);
      maxY = Math.max(maxY, pos.y);
    });

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    };
  }
}
