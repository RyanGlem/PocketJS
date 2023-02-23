import { Point } from "./point"

export class Line {
  p1: Point = { x: 0, y: 0 };
  p2: Point = { x: 0, y: 0 };

  constructor(p1: Point, p2: Point) {
    this.p1 = p1;
    this.p2 = p2;
  }
}
