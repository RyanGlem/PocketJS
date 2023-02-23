// This only defines the drawing of a polygon without the addition of newtonian mechanics/physical model
import { Line } from "./line";
import { Point } from "./point";
import { direction, onLine, intersection, length } from "../linear_operations";

interface Vertex {
  x: number;
  y: number;
}

export class Polygon {
  // This X and Y position will be considered it's origin (the center of the polygon)
  // The origin will be found after the vertices are created
  x = 0;
  y = 0;
  center = {x: 0.0, y:0.0};
  angle = 0.0;
  boundingBox = false;
  vertices: Vertex[];
  ctx: CanvasRenderingContext2D;
  currentColor: string;
  sides: number;
  constructor(
    ctx: CanvasRenderingContext2D,
    vertices: Vertex[],
    angle?: number,
    drawBoundingBox?: boolean,
    currentColor?: string
  ) {
    this.ctx = ctx;
    this.vertices = vertices;

    if (currentColor === undefined) {
      let R = Math.floor(Math.random() * 255);
      let G = Math.floor(Math.random() * 255);
      let B = Math.floor(Math.random() * 255);
      if (G >= 250) G - 20;
      const color = `rgb(${R}, ${G}, ${B})`;
      this.currentColor = color;
    } else {
      this.currentColor = currentColor;
    }

    if (drawBoundingBox !== undefined) {
      this.boundingBox = drawBoundingBox;
    } else {
      this.boundingBox = false;
    }

    this.center.x = parseFloat (this.calculateCentroid().x.toPrecision(6))
    this.center.y = parseFloat (this.calculateCentroid().y.toPrecision(6))
    this.angle = (angle === undefined) ? 0 : angle;
    this.sides = this.vertices.length - 1 

    if (this.angle !== 0) {
      for (let i = 0; i <= this.vertices.length - 1; i++) {
        if (i === 0) {
          const rotVerts = this.rotate(this.vertices[i], this.angle)
          this.vertices[i] = rotVerts
          this.ctx.moveTo(this.vertices[i].x, this.vertices[i].y);
        } else {
          const rotVerts = this.rotate(this.vertices[i], this.angle)
          this.vertices[i] = rotVerts
          this.ctx.lineTo(this.vertices[i].x, this.vertices[i].y);
        }
      }
    }
    this.update();
  }

  //This update function keeps tracks of the bounds, gravity and position of each square object
  update() {
    this.ctx.fillStyle = this.currentColor;
    this.drawPolygon();
    if (this.boundingBox) this.drawBoundingBox();
  }

  drawBoundingBox() {
    let minPoint = this.findMinVertex();
    let maxPoint = this.findMaxVertex();

    this.ctx.beginPath();
    this.ctx.moveTo(minPoint.x, minPoint.y);
    this.ctx.lineTo(maxPoint.x, minPoint.y);
    this.ctx.lineTo(maxPoint.x, maxPoint.y);
    this.ctx.lineTo(minPoint.x, maxPoint.y);
    this.ctx.lineTo(minPoint.x, minPoint.y);
    this.ctx.stroke();
  }

  getBoundingCoords() {
    return {min: this.findMinVertex(), max: this.findMaxVertex() }
  }

  drawPolygon() {
    this.ctx.beginPath();
    for (let i = 0; i < this.sides; i++) {
      if (i === 0) {
        this.ctx.moveTo(this.vertices[i].x, this.vertices[i].y)
      } else {
        this.ctx.lineTo(this.vertices[i].x, this.vertices[i].y)
      }
    }
    this.ctx.closePath();
    this.ctx.fill();
  }

  // Checks if a point is inside of any polygon
  checkInside (point: Point) {
    let maxPoint = this.findMaxVertex();
    let extreme: Point = { x: point.x + maxPoint.x, y: point.y };
    let ray = new Line(point, extreme);

    let count = 0;
    let i = 0;
    let sides = this.vertices.length - 1;

    do {
      // Forming a line from two consecutive points of polygon
      let side = new Line(this.vertices[i], this.vertices[i + 1]);
      if (intersection(side, ray)) {

        // We have to check if the vertex is on the same y-axis as the casted ray (point, extreme)
        let vertexCheck = { p1: point, p2: extreme };

        // If side intersects the ray cast
        if (direction(side.p1, point, side.p2) == 0) return onLine(side, point);

        if (
          direction(point, extreme, side.p1) == 0 &&
          onLine(vertexCheck, side.p1)
        )
          return false;

        count++;
      }
      i++;
    } while (i < sides);

    // When count is odd
    return count & 1;
  }

  getWidth() {
    let minPoint = this.findMinVertex();
    let maxPoint = this.findMaxVertex();
    return maxPoint.x - minPoint.x;
  }

  getHeight() {
    let minPoint = this.findMinVertex();
    let maxPoint = this.findMaxVertex();
    return maxPoint.y - minPoint.y;
  }

  findMinVertex() {
    let min = { x: Number.MAX_VALUE, y: Number.MAX_VALUE };

    for (let vertex of this.vertices) {
      min.x = Math.min(vertex.x, min.x);
      min.y = Math.min(vertex.y, min.y);
    }
    return min;
  }

  findMaxVertex() {
    let max = { x: -1, y: -1 };

    for (let vertex of this.vertices) {
      max.x = Math.max(vertex.x, max.x);
      max.y = Math.max(vertex.y, max.y);
    }
    return max;
  }

  // Updates the position in accordance to the mouse cursor offset
  updatePosition(verts: Vertex[]) {
    for (let i = 0; i < this.vertices.length; i++) {
      if (verts[i] !== undefined) {
        this.vertices[i].x = verts[i].x;
        this.vertices[i].y = verts[i].y;
      }
    }
  }

  // Find origin (center) of any polygon
  calculateCentroid(): { x: number; y: number } {
    let sides = this.vertices.length - 1;

    if (sides == 3) {
      return {
        x:
           ((this.vertices[0].x + this.vertices[1].x + this.vertices[2].x) / 3),
        y:
           ((this.vertices[0].y + this.vertices[1].y + this.vertices[2].y) / 3),
      };
    }

    if (sides == 4) {
      let top = length (this.vertices[0], this.vertices[1])
      let bottom = length (this.vertices[2], this.vertices[3])
      if (top == bottom){return {x: (this.getWidth() + this.vertices[3].x) / 2, y: (this.getHeight() + this.vertices[3].y) / 2} }
    }

    let signedArea = 0;
    let centerX = 0;
    let centerY = 0;

    // Calculate the summation signed area using the shoelace formula
    for (let i = 0; i < sides; i++) {
      let x0 = this.vertices[i].x
      let y0 = this.vertices[i].y
      let x1 = this.vertices[(i + 1) % sides].x
      let y1 = this.vertices[(i + 1) % sides].y

      let A = x0 * y1 - x1 * y0

      signedArea += A;
      centerX += (x0 + x1) * A;
      centerY += (y0 + y1) * A;
    }

    signedArea *= 0.5
    centerX /= 6.0 * signedArea
    centerY /= 6.0 * signedArea

    return {x: centerX, y: centerY};
  }

  // Simple rotational method to rotate the polygons vertices about its origin
  rotate(vertex:Point, angle:number) {

    let origin = this.calculateCentroid();
    let rotationPoints: Point;
    let rotationPointX = vertex.x - origin.x
    let rotationPointY = vertex.y - origin.y
    
    rotationPointX = parseFloat (rotationPointX.toPrecision(6))
    rotationPointY = parseFloat (rotationPointY.toPrecision(6))
    let radian = angle * Math.PI / 180

    let xAngle = (rotationPointX * Math.cos(radian) - rotationPointY * Math.sin(radian)) + origin.x;
    let yAngle = (rotationPointY * Math.cos(radian) + rotationPointX * Math.sin(radian)) + origin.y;

    rotationPoints = {x: parseFloat (xAngle.toPrecision(6)), y: parseFloat (yAngle.toPrecision(6))}
    return rotationPoints;
  }
}
