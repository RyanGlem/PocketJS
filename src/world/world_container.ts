import { RigidBody } from "../rigid_bodies/rigidPoly";
import { TreeNode } from "../collisions/bvh";
import { AABB } from "../collisions/AABB";
import { Point } from "../objects/point";
import { TestOverlap } from "../linear_operations";

const canvas: HTMLCanvasElement = document.getElementById(
  "container"
) as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const gravity: Point = { x: 0, y: 0 };
let start: number;

const rectVerts = (x: number, y: number, width: number, height: number) => {
  let boundsX = x + width;
  let boundsY = y + height;
  let vertices = [
    { x: x, y: y },
    { x: boundsX, y: y },
    { x: boundsX, y: boundsY },
    { x: x, y: boundsY },
    { x: x, y: y },
  ];
  return vertices;
};

const Collections: any[] = [];
const RigidBodies: RigidBody[] = [];
const verts1 = rectVerts(0, 0, 100, 100);
const rigidBody1 = new RigidBody(
  ctx,
  [
    { x: 150, y: 180 },
    { x: 200, y: 195 },
    { x: 210, y: 180 },
    { x: 130, y: 140 },
    { x: 150, y: 180 },
  ],
  gravity,
  4
);
const rigidBody2 = new RigidBody(ctx, verts1, gravity, 6);
const rigidBody3 = new RigidBody(
  ctx,
  [
    { x: 100, y: 140 },
    { x: 200, y: 195 },
    { x: 130, y: 210 },
    { x: 100, y: 140 },
  ],
  gravity,
  0.3
);
const rigidBody4 = new RigidBody(
  ctx,
  [
    { x: 90, y: 110 },
    { x: 110, y: 140 },
    { x: 130, y: 115 },
    { x: 90, y: 110 },
  ],
  gravity,
  0.9
);
const rigidBody5 = new RigidBody(
  ctx,
  [
    { x: 100, y: 140 },
    { x: 200, y: 195 },
    { x: 130, y: 210 },
    { x: 100, y: 140 },
  ],
  gravity,
  10
);
const rigidBody6 = new RigidBody(
  ctx,
  [
    { x: 150, y: 180 },
    { x: 200, y: 195 },
    { x: 300, y: 205 },
    { x: 210, y: 180 },
    { x: 130, y: 140 },
    { x: 150, y: 180 },
  ],
  gravity,
  7.65
);

Collections.push(rigidBody1);
Collections.push(rigidBody2);
Collections.push(rigidBody3);
Collections.push(rigidBody4);
Collections.push(rigidBody5);
Collections.push(rigidBody6);
RigidBodies.push(rigidBody1);
RigidBodies.push(rigidBody2);
RigidBodies.push(rigidBody3);
RigidBodies.push(rigidBody4);
RigidBodies.push(rigidBody5);
RigidBodies.push(rigidBody6);

// We get the bounding box of each AABB of the rigid bodies. We then have to sort them from least to greatest
// I rather re-sort the RigidBodies array in place, it doesn't matter if it's sorted out of order in Collections because
// That only has to do with rendering
// Use mergeSort to sort the array
let min = {x:Number.MAX_VALUE, y: Number.MAX_VALUE}
let max = {x:-1, y:-1}

for (let rigidBody of Collections) {
  let boundsCoords = rigidBody.getBoundingCoords();

  rigidBody.gravity = 0;
  if (boundsCoords.min.x < min.x) {
    min.x = boundsCoords.min.x
  }

  if (boundsCoords.min.y < min.y) {
    min.y = boundsCoords.min.y
  }

  if (boundsCoords.max.x > max.x) {
    max.x = boundsCoords.max.x
  }

  if (boundsCoords.max.y > max.y) {
    max.y = boundsCoords.max.y
  }
}
console.log (min)
console.log (max)

// Arbitrary selection level handling for bottom-up building of a bounding volume hiearchy
// Building dynamic bounding volumte tree
// What the bottom up approach is suppose to do is merge the two closest AABBs together into one node until we get we giant bounding box.
const buildDBVT = () => {
  // Dummy array
  // Spread the state for a deep copy
  const dummyArray = [...Collections];

  // Pop off two random rigid body AABBs off the collections array at a time
  let A, B, C, parentNode;

  // The structure will now resemble
  /*
             1
            / \
           A   B
            */

  // Get all AABBs in the scene
  let AABBs = [];
  let nodes = []
  let index = 0;

  // Get all AABBs of every rigidBody on the screen
  for (let rigidBody of dummyArray) {
    let boundingBox:AABB = new AABB(rigidBody.getBoundingCoords().min, rigidBody.getBoundingCoords().max)
    AABBs.push (boundingBox)
  }

  // Creating the first layer of rigidBody bounding box nodes
  // For the first pass AABB will be empty after going through n/2 times if it is even
  // If the length is even, only one AABB will be undefined, ergo boxB
  while (AABBs.length !== 0) {
    let boxA = AABBs.shift() as AABB;
    let boxB = AABBs.shift() as AABB;

    if (boxA === undefined) {
      break;
    }

    if (boxA !== undefined && boxB === undefined) {
      parentNode = new TreeNode(boxA)
      nodes.push(parentNode)
    }

    // Create two leaf nodes
    let left = new TreeNode(boxA);
    let right = new TreeNode(boxB);

    // Create a new TreeNode, the children will be A and B, while the parent will be the new bounding box C
    C = unionBounding(boxA, boxB);

    parentNode = new TreeNode(C);
    index++

    parentNode.left = left
    parentNode.right = right

    nodes.push (parentNode)
  }

  // Build the tree with any arbitrary length
  while (nodes.length !== 0) {
    A = nodes.shift() as TreeNode // Think of A and B as the previous terms in the nodes queue
    B = nodes.shift() as TreeNode

    if (A === undefined) {
      break;
    }

    if (A !== undefined && B === undefined) {
      break;
    }

    C = unionBounding (A.box, B.box) // This is getting the top level root bounding box

    parentNode = new TreeNode (C)
    parentNode.left = A
    parentNode.right = B

    nodes.push (parentNode)
  }

  console.log (parentNode)
  return parentNode
};

//AABB collision broad phrase
const unionBounding = (A: AABB, B: AABB) => {
  //let A = new AABB (bodyA.getBoundingCoords().min, bodyA.getBoundingCoords().max)
  //let B = new AABB (bodyB.getBoundingCoords().min, bodyB.getBoundingCoords().max)
  let upperBound = {
    x: Math.max(A.max.x, B.max.x),
    y: Math.max(A.max.y, B.max.y),
  };
  let lowerBound = {
    x: Math.min(A.min.x, B.min.x),
    y: Math.min(A.min.y, B.min.y),
  };
  let C = new AABB(lowerBound, upperBound);

  return C;
};

buildDBVT();

const AreaAABB = (A: AABB) => {
  let distance = { x: A.max.x - A.min.x, y: A.max.y - A.min.y };

  return distance.x * distance.y;
};

const RayCastCheckAABB = (p1: Point): boolean => {
  for (let entity of Collections) {
    let A = new AABB(
      entity.getBoundingCoords().min,
      entity.getBoundingCoords().max
    );

    if (TestOverlap(p1, ctx, A) == false) {
      continue;
    }

    if (entity.checkInside(p1)) return true;
  }

  return false;
};

const draw = (t: number) => {
  for (let entity of Collections) {
    entity.update();
    entity.boundingBox = true;
  }

  for (let entity of RigidBodies) {
    entity.simulate(t, gravity);
  }
};

const update = (timestamp: DOMHighResTimeStamp) => {
  if (start === undefined) start = timestamp;
  const elapsed = timestamp - start;

  let time = elapsed;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Accurate representation of time
  if (time * 0.001 > 4) {
    time = 0;
  }

  // Slowing down the simulation by time because real time caclucaltions calls of the functions are too high
  draw(time * 0.00001);
  canvas.addEventListener("mousedown", drag);
  requestAnimationFrame(update);
};

const drag = (event: MouseEvent) => {
  // Get the position of the mouse cursor and subtract it by the top left coordinates to get the relative position inside the object

  // Get the position of the initial point of the mouse cursor
  let initialPoint = { x: event.offsetX, y: event.offsetY };
  let initialEntity: any;
  let initialVertices: any = [];

  // Find the entity inside of the Collections array
  for (let entity of Collections) {
    if (entity.checkInside(initialPoint)) {
      initialEntity = entity;
      break;
    }
  }

  if (initialEntity !== undefined) {
    if (initialEntity.checkInside(initialPoint)) {
      for (let vertex of initialEntity.vertices) {
        initialVertices.push({
          x: event.offsetX - vertex.x,
          y: event.offsetY - vertex.y,
        });
      }
    }
  }

  const move = (event: any) => {
    let offsetX = event.offsetX;
    let offsetY = event.offsetY;

    let movingPoint = { x: offsetX, y: offsetY };

    // Subtract the offset by the relative mouse cursor position to find the displacement
    let displacementVertices = [];
    if (initialEntity !== undefined) {
      if (initialEntity.checkInside(movingPoint)) {
        for (let initVerts of initialVertices) {
          displacementVertices.push({
            x: offsetX - initVerts.x,
            y: offsetY - initVerts.y,
          });
        }
        initialEntity.updatePosition(displacementVertices);
      }
    }
  };

  canvas.addEventListener("mousemove", move);
  canvas.onmouseup = () => {
    canvas.removeEventListener("mousemove", move);
    canvas.onmouseup = null;
  };
};

requestAnimationFrame(update);
