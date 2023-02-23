import { Point } from "./point";
import { Polygon } from "./polygon";

export class Square extends Polygon {
  x = 0;
  y = 0;
  angle = 0;
  ctx: CanvasRenderingContext2D;
  currentColor: string;
  vertices: Point[] =[]
  constructor(
    ctx: CanvasRenderingContext2D,
    vertices: Point[],
    angle?: number,
    currentColor?: string
  ) {
    super(ctx, vertices);
    this.ctx = ctx;
    if (angle === undefined) {
      this.angle = 0;
    } else {
      this.angle = angle;
    }

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

    this.vertices = vertices;
    this.update();
  }

  //This update function keeps tracks of the bounds and position of each object
  update() {
    this.ctx.fillStyle = this.currentColor;
    this.drawPolygon();
    this.bottomDetect();
  }
  
  drawPolygon() {
    this.ctx.beginPath();
    this.ctx.moveTo(this.vertices[0].x as number, this.vertices[0].y as number);
    for (let vertex of this.vertices) {
      this.ctx.lineTo(vertex.x, vertex.y);
    }
    this.ctx.closePath();
    this.ctx.fill();
  }

  updatePosition(verts: Point[]) {
    for (let i = 0; i <= this.vertices.length - 1; i++) {
      if (verts[i] !== undefined) {
        this.vertices[i].x = verts[i].x;
        this.vertices[i].y = verts[i].y;
      }
    }
  }

  calculateCentroid(): { x: number; y: number; } {
    let minVertex = this.findMinVertex ()
    let maxVertex = this.findMaxVertex ()

    return {x:((maxVertex.x + minVertex.x) / 2), y:(maxVertex.y + minVertex.y) / 2}
  }

  bottomDetect() {
    const bottom = this.ctx.canvas.height - this.vertices[3].y;
    if (this.y > bottom) {
      this.y = bottom;
    }
  }
}
