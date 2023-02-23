import { AABB } from "./collisions/AABB"
import { Line } from "./objects/line"
import { Point } from "./objects/point"

const add = (p1: Point, p2: Point) => {
  return {x: p1.x + p2.x, y: p1.y + p2.y}
}

export const sub = (p1: Point, p2: Point) => {
  return {x: p1.x - p2.x, y: p1.y - p2.y}
}

export const direction = (a: Point, b: Point, c: Point) => {
    // Equation for orientation using slope
    let val = (b.y - a.y) * (c.x - b.x) - (b.x - a.x) * (c.y - b.y);
    if (val == 0) return 0;
    return val > 0 ? 1 : 2;
  };

export const onLine = (line: Line, point: Point) => {
    if (
      point.x <= Math.max(line.p1.x, line.p2.x) &&
      point.x >= Math.min(line.p1.x, line.p2.x) &&
      point.y <= Math.max(line.p1.y, line.p2.y) &&
      point.y >= Math.min(line.p1.y, line.p2.y)
    )
      return true;
      
    return false;
  };

export const intersection = (l1: Line, l2: Line) => {
    // Four direction for two lines and points of other line
    let dir1 = direction(l1.p1, l1.p2, l2.p1);
    let dir2 = direction(l1.p1, l1.p2, l2.p2);
    let dir3 = direction(l2.p1, l2.p2, l1.p1);
    let dir4 = direction(l2.p1, l2.p2, l1.p2);

    // When intersecting
    if (dir1 != dir2 && dir3 != dir4) return true;

    // When p2 of line2 are on the line1
    if (dir1 == 0 && onLine(l1, l2.p1)) return true;

    // When p1 of line2 are on the line1
    if (dir2 == 0 && onLine(l1, l2.p2)) return true;

    // When p2 of line1 are on the line2
    if (dir3 == 0 && onLine(l2, l1.p1)) return true;

    // When p1 of line1 are on the line2
    if (dir4 == 0 && onLine(l2, l1.p2)) return true;

    return false;
};

export const length = (p1: Point, p2: Point) => {

  return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2)
}

export const dot = (p1: Point, p2: Point) => {
  
  return (p1.x * p2.x + p1.y * p2.y)
}

export const cross = (p1: Point, p2: Point) => {

  return (p1.x * p2.y - p2.x * p1.y)
}

// In the test overlap function, we want to check if the ray overlaps the bounding box (count >=2). If it does return true
export const TestOverlap = (point: Point, ctx: CanvasRenderingContext2D, boundingBox : AABB) => {
  let maxPoint = {x: ctx.canvas.width, y:ctx.canvas.height};
  let extreme: Point = { x: maxPoint.x, y: maxPoint.y };
  let ray = new Line(point, extreme);

  let count = 0;
  let i = 0;
  
  let vertices = [
    {x: boundingBox.min.x, y:boundingBox.min.y},
    {x: boundingBox.max.x, y:boundingBox.min.y},
    {x: boundingBox.max.x, y:boundingBox.max.y},
    {x: boundingBox.min.x, y:boundingBox.max.y},
    {x: boundingBox.min.x, y:boundingBox.min.y},
  ]

  let sides = vertices.length - 1;

  do {
    // Forming a line from two consecutive points of polygon
    let side = new Line(vertices[i], vertices[i + 1]);
    if (intersection(side, ray)) {

      // We have to check if the vertex is on the same y-axis as the casted ray (point, extreme)
      let vertexCheck = { p1: point, p2: extreme};

      // If side intersects the ray cast
      if (direction(side.p1, point, side.p2) == 0) return onLine(side, point);

      if (
        direction(point, extreme, side.p1) == 0 &&
        onLine(vertexCheck, side.p1)
      )
        return false;

      count++;

      // With the extreme ray, the count will always be two if the ray intersects the AABB unless the polygon is outside of the ray's range
      if (count == 2) return true
    }
    i++;
  } while (i < sides);

  // When count is odd
  return count & 1;
}