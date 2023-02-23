import { Polygon } from "../objects/polygon";
import { Point } from "../objects/point";
import { dot, cross, sub, length } from "../linear_operations";

export class RigidBody extends Polygon {
  mass = 1.0; //Kilograms
  angle = 0.0;
  torque = 0.0;
  position: Point;
  vertices: Point[];
  moi = 0.0; //Moment of Inertia
  angularVelocity = 0.0;
  linearVelocity: Point = { x: 0, y: 0 };
  ctx: CanvasRenderingContext2D;

  constructor(
    ctx: CanvasRenderingContext2D,
    vertices: Point[],
    gravity: Point = { x: 0, y: 0 },
    mass?: number,
    angle?: number,
    position?: Point
  ) {
    super(ctx, vertices, angle);

    this.ctx = ctx;
    this.vertices = vertices;
    this.position = position as Point;
    this.moi = this.momentOfIntertia();
    this.torque = this.computeTorque(gravity);
    this.angle = angle === undefined ? 0 : angle;
    this.mass = mass === undefined ? 1 : mass
  }

  momentOfIntertia() {
    if (this.sides == 3) {
      return (this.mass * (this.getWidth() ** 2 + this.getHeight() ** 2)) / 36;
    }

    if (this.sides == 4) {
      let top = length (this.vertices[0], this.vertices[1])
      let bottom = length (this.vertices[2], this.vertices[3])
      if (top == bottom) return (this.mass * (this.getWidth() ** 2 + this.getHeight() ** 2)) / 12;
    }

    let moi;
    let crossSummation = 0;
    let dotSummation = 0;
    let totalSummation = 0
    let origin = this.calculateCentroid()
    for (let i = 0; i < this.sides; i++) {
      // Cross summation
      let index = (i + 1) % this.sides
      let cS = cross (sub (this.vertices[index], origin), sub (this.vertices[i], origin));

      // Dot summation
      let dS =
        dot(sub (this.vertices[i], origin), sub (this.vertices[i], origin)) +
        dot(sub (this.vertices[i], origin), sub (this.vertices[index], origin)) +
        dot(sub (this.vertices[index], origin), sub (this.vertices[index], origin));

        totalSummation += cS * dS
        crossSummation += cS
        dotSummation += dS
    }

    //Product of the cross and dot summation
    let productSummation = this.mass * totalSummation
    moi = productSummation / (6 * crossSummation)

    return moi
  }

  computeTorque(vector: Point) {
    const armVector = this.calculateCentroid();
    return (this.torque = armVector.x * vector.y - armVector.y * vector.x);
  }

  simulate(time: number, gravity?: Point) {
    gravity = gravity === undefined ? { x: 0, y: 0 } : gravity;

    const linearAccel = { x: gravity.x / this.mass, y: gravity.y / this.mass };
    let vertexRotations = [];
    for (let vertex of this.vertices) {
      this.linearVelocity.x += linearAccel.x * time;
      this.linearVelocity.y += linearAccel.y * time;
      vertex.x += this.linearVelocity.x * time;
      vertex.y += this.linearVelocity.y * time;

      let angularAccel = this.torque / this.moi
      this.angularVelocity += angularAccel * time;
      this.angle = this.angularVelocity * time;
      vertexRotations.push(this.rotate(vertex, this.angle));
    }
    this.vertices = vertexRotations;
  }
}
