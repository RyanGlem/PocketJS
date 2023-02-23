(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
//Axis-Aligned bounding box class created from a RigidBody
Object.defineProperty(exports, "__esModule", { value: true });
exports.AABB = void 0;
class AABB {
    constructor(min, max) {
        this.min = { x: 0, y: 0 };
        this.max = { x: 0, y: 0 };
        this.min = min;
        this.max = max;
    }
}
exports.AABB = AABB;

},{}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TreeNode = void 0;
class TreeNode {
    constructor(box, left, right, objectIndex) {
        this.objectIndex = 0;
        this.parentIndex = 0;
        this.isLeaf = false;
        this.box = box;
        this.left = left === undefined ? null : left;
        this.right = right === undefined ? null : right;
        this.objectIndex = objectIndex === undefined ? 0 : objectIndex;
    }
}
exports.TreeNode = TreeNode;
class BoundingVolumeTree {
    constructor(box) {
        this.size = 0;
        this.rootIndex = 0;
        this.root = new TreeNode(box);
        this.size = 0;
    }
}

},{}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestOverlap = exports.cross = exports.dot = exports.length = exports.intersection = exports.onLine = exports.direction = exports.sub = void 0;
const line_1 = require("./objects/line");
const add = (p1, p2) => {
    return { x: p1.x + p2.x, y: p1.y + p2.y };
};
const sub = (p1, p2) => {
    return { x: p1.x - p2.x, y: p1.y - p2.y };
};
exports.sub = sub;
const direction = (a, b, c) => {
    // Equation for orientation using slope
    let val = (b.y - a.y) * (c.x - b.x) - (b.x - a.x) * (c.y - b.y);
    if (val == 0)
        return 0;
    return val > 0 ? 1 : 2;
};
exports.direction = direction;
const onLine = (line, point) => {
    if (point.x <= Math.max(line.p1.x, line.p2.x) &&
        point.x >= Math.min(line.p1.x, line.p2.x) &&
        point.y <= Math.max(line.p1.y, line.p2.y) &&
        point.y >= Math.min(line.p1.y, line.p2.y))
        return true;
    return false;
};
exports.onLine = onLine;
const intersection = (l1, l2) => {
    // Four direction for two lines and points of other line
    let dir1 = (0, exports.direction)(l1.p1, l1.p2, l2.p1);
    let dir2 = (0, exports.direction)(l1.p1, l1.p2, l2.p2);
    let dir3 = (0, exports.direction)(l2.p1, l2.p2, l1.p1);
    let dir4 = (0, exports.direction)(l2.p1, l2.p2, l1.p2);
    // When intersecting
    if (dir1 != dir2 && dir3 != dir4)
        return true;
    // When p2 of line2 are on the line1
    if (dir1 == 0 && (0, exports.onLine)(l1, l2.p1))
        return true;
    // When p1 of line2 are on the line1
    if (dir2 == 0 && (0, exports.onLine)(l1, l2.p2))
        return true;
    // When p2 of line1 are on the line2
    if (dir3 == 0 && (0, exports.onLine)(l2, l1.p1))
        return true;
    // When p1 of line1 are on the line2
    if (dir4 == 0 && (0, exports.onLine)(l2, l1.p2))
        return true;
    return false;
};
exports.intersection = intersection;
const length = (p1, p2) => {
    return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
};
exports.length = length;
const dot = (p1, p2) => {
    return (p1.x * p2.x + p1.y * p2.y);
};
exports.dot = dot;
const cross = (p1, p2) => {
    return (p1.x * p2.y - p2.x * p1.y);
};
exports.cross = cross;
// In the test overlap function, we want to check if the ray overlaps the bounding box (count >=2). If it does return true
const TestOverlap = (point, ctx, boundingBox) => {
    let maxPoint = { x: ctx.canvas.width, y: ctx.canvas.height };
    let extreme = { x: maxPoint.x, y: maxPoint.y };
    let ray = new line_1.Line(point, extreme);
    let count = 0;
    let i = 0;
    let vertices = [
        { x: boundingBox.min.x, y: boundingBox.min.y },
        { x: boundingBox.max.x, y: boundingBox.min.y },
        { x: boundingBox.max.x, y: boundingBox.max.y },
        { x: boundingBox.min.x, y: boundingBox.max.y },
        { x: boundingBox.min.x, y: boundingBox.min.y },
    ];
    let sides = vertices.length - 1;
    do {
        // Forming a line from two consecutive points of polygon
        let side = new line_1.Line(vertices[i], vertices[i + 1]);
        if ((0, exports.intersection)(side, ray)) {
            // We have to check if the vertex is on the same y-axis as the casted ray (point, extreme)
            let vertexCheck = { p1: point, p2: extreme };
            // If side intersects the ray cast
            if ((0, exports.direction)(side.p1, point, side.p2) == 0)
                return (0, exports.onLine)(side, point);
            if ((0, exports.direction)(point, extreme, side.p1) == 0 &&
                (0, exports.onLine)(vertexCheck, side.p1))
                return false;
            count++;
            // With the extreme ray, the count will always be two if the ray intersects the AABB unless the polygon is outside of the ray's range
            if (count == 2)
                return true;
        }
        i++;
    } while (i < sides);
    // When count is odd
    return count & 1;
};
exports.TestOverlap = TestOverlap;

},{"./objects/line":4}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Line = void 0;
class Line {
    constructor(p1, p2) {
        this.p1 = { x: 0, y: 0 };
        this.p2 = { x: 0, y: 0 };
        this.p1 = p1;
        this.p2 = p2;
    }
}
exports.Line = Line;

},{}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Polygon = void 0;
// This only defines the drawing of a polygon without the addition of newtonian mechanics/physical model
const line_1 = require("./line");
const linear_operations_1 = require("../linear_operations");
class Polygon {
    constructor(ctx, vertices, angle, drawBoundingBox, currentColor) {
        // This X and Y position will be considered it's origin (the center of the polygon)
        // The origin will be found after the vertices are created
        this.x = 0;
        this.y = 0;
        this.center = { x: 0.0, y: 0.0 };
        this.angle = 0.0;
        this.boundingBox = false;
        this.ctx = ctx;
        this.vertices = vertices;
        if (currentColor === undefined) {
            let R = Math.floor(Math.random() * 255);
            let G = Math.floor(Math.random() * 255);
            let B = Math.floor(Math.random() * 255);
            if (G >= 250)
                G - 20;
            const color = `rgb(${R}, ${G}, ${B})`;
            this.currentColor = color;
        }
        else {
            this.currentColor = currentColor;
        }
        if (drawBoundingBox !== undefined) {
            this.boundingBox = drawBoundingBox;
        }
        else {
            this.boundingBox = false;
        }
        this.center.x = parseFloat(this.calculateCentroid().x.toPrecision(6));
        this.center.y = parseFloat(this.calculateCentroid().y.toPrecision(6));
        this.angle = (angle === undefined) ? 0 : angle;
        this.sides = this.vertices.length - 1;
        if (this.angle !== 0) {
            for (let i = 0; i <= this.vertices.length - 1; i++) {
                if (i === 0) {
                    const rotVerts = this.rotate(this.vertices[i], this.angle);
                    this.vertices[i] = rotVerts;
                    this.ctx.moveTo(this.vertices[i].x, this.vertices[i].y);
                }
                else {
                    const rotVerts = this.rotate(this.vertices[i], this.angle);
                    this.vertices[i] = rotVerts;
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
        if (this.boundingBox)
            this.drawBoundingBox();
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
        return { min: this.findMinVertex(), max: this.findMaxVertex() };
    }
    drawPolygon() {
        this.ctx.beginPath();
        for (let i = 0; i < this.sides; i++) {
            if (i === 0) {
                this.ctx.moveTo(this.vertices[i].x, this.vertices[i].y);
            }
            else {
                this.ctx.lineTo(this.vertices[i].x, this.vertices[i].y);
            }
        }
        this.ctx.closePath();
        this.ctx.fill();
    }
    // Checks if a point is inside of any polygon
    checkInside(point) {
        let maxPoint = this.findMaxVertex();
        let extreme = { x: point.x + maxPoint.x, y: point.y };
        let ray = new line_1.Line(point, extreme);
        let count = 0;
        let i = 0;
        let sides = this.vertices.length - 1;
        do {
            // Forming a line from two consecutive points of polygon
            let side = new line_1.Line(this.vertices[i], this.vertices[i + 1]);
            if ((0, linear_operations_1.intersection)(side, ray)) {
                // We have to check if the vertex is on the same y-axis as the casted ray (point, extreme)
                let vertexCheck = { p1: point, p2: extreme };
                // If side intersects the ray cast
                if ((0, linear_operations_1.direction)(side.p1, point, side.p2) == 0)
                    return (0, linear_operations_1.onLine)(side, point);
                if ((0, linear_operations_1.direction)(point, extreme, side.p1) == 0 &&
                    (0, linear_operations_1.onLine)(vertexCheck, side.p1))
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
    updatePosition(verts) {
        for (let i = 0; i < this.vertices.length; i++) {
            if (verts[i] !== undefined) {
                this.vertices[i].x = verts[i].x;
                this.vertices[i].y = verts[i].y;
            }
        }
    }
    // Find origin (center) of any polygon
    calculateCentroid() {
        let sides = this.vertices.length - 1;
        if (sides == 3) {
            return {
                x: ((this.vertices[0].x + this.vertices[1].x + this.vertices[2].x) / 3),
                y: ((this.vertices[0].y + this.vertices[1].y + this.vertices[2].y) / 3),
            };
        }
        if (sides == 4) {
            let top = (0, linear_operations_1.length)(this.vertices[0], this.vertices[1]);
            let bottom = (0, linear_operations_1.length)(this.vertices[2], this.vertices[3]);
            if (top == bottom) {
                return { x: (this.getWidth() + this.vertices[3].x) / 2, y: (this.getHeight() + this.vertices[3].y) / 2 };
            }
        }
        let signedArea = 0;
        let centerX = 0;
        let centerY = 0;
        // Calculate the summation signed area using the shoelace formula
        for (let i = 0; i < sides; i++) {
            let x0 = this.vertices[i].x;
            let y0 = this.vertices[i].y;
            let x1 = this.vertices[(i + 1) % sides].x;
            let y1 = this.vertices[(i + 1) % sides].y;
            let A = x0 * y1 - x1 * y0;
            signedArea += A;
            centerX += (x0 + x1) * A;
            centerY += (y0 + y1) * A;
        }
        signedArea *= 0.5;
        centerX /= 6.0 * signedArea;
        centerY /= 6.0 * signedArea;
        return { x: centerX, y: centerY };
    }
    // Simple rotational method to rotate the polygons vertices about its origin
    rotate(vertex, angle) {
        let origin = this.calculateCentroid();
        let rotationPoints;
        let rotationPointX = vertex.x - origin.x;
        let rotationPointY = vertex.y - origin.y;
        rotationPointX = parseFloat(rotationPointX.toPrecision(6));
        rotationPointY = parseFloat(rotationPointY.toPrecision(6));
        let radian = angle * Math.PI / 180;
        let xAngle = (rotationPointX * Math.cos(radian) - rotationPointY * Math.sin(radian)) + origin.x;
        let yAngle = (rotationPointY * Math.cos(radian) + rotationPointX * Math.sin(radian)) + origin.y;
        rotationPoints = { x: parseFloat(xAngle.toPrecision(6)), y: parseFloat(yAngle.toPrecision(6)) };
        return rotationPoints;
    }
}
exports.Polygon = Polygon;

},{"../linear_operations":3,"./line":4}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RigidBody = void 0;
const polygon_1 = require("../objects/polygon");
const linear_operations_1 = require("../linear_operations");
class RigidBody extends polygon_1.Polygon {
    constructor(ctx, vertices, gravity = { x: 0, y: 0 }, mass, angle, position) {
        super(ctx, vertices, angle);
        this.mass = 1.0; //Kilograms
        this.angle = 0.0;
        this.torque = 0.0;
        this.moi = 0.0; //Moment of Inertia
        this.angularVelocity = 0.0;
        this.linearVelocity = { x: 0, y: 0 };
        this.ctx = ctx;
        this.vertices = vertices;
        this.position = position;
        this.moi = this.momentOfIntertia();
        this.torque = this.computeTorque(gravity);
        this.angle = angle === undefined ? 0 : angle;
        this.mass = mass === undefined ? 1 : mass;
    }
    momentOfIntertia() {
        if (this.sides == 3) {
            return (this.mass * (this.getWidth() ** 2 + this.getHeight() ** 2)) / 36;
        }
        if (this.sides == 4) {
            let top = (0, linear_operations_1.length)(this.vertices[0], this.vertices[1]);
            let bottom = (0, linear_operations_1.length)(this.vertices[2], this.vertices[3]);
            if (top == bottom)
                return (this.mass * (this.getWidth() ** 2 + this.getHeight() ** 2)) / 12;
        }
        let moi;
        let crossSummation = 0;
        let dotSummation = 0;
        let totalSummation = 0;
        let origin = this.calculateCentroid();
        for (let i = 0; i < this.sides; i++) {
            // Cross summation
            let index = (i + 1) % this.sides;
            let cS = (0, linear_operations_1.cross)((0, linear_operations_1.sub)(this.vertices[index], origin), (0, linear_operations_1.sub)(this.vertices[i], origin));
            // Dot summation
            let dS = (0, linear_operations_1.dot)((0, linear_operations_1.sub)(this.vertices[i], origin), (0, linear_operations_1.sub)(this.vertices[i], origin)) +
                (0, linear_operations_1.dot)((0, linear_operations_1.sub)(this.vertices[i], origin), (0, linear_operations_1.sub)(this.vertices[index], origin)) +
                (0, linear_operations_1.dot)((0, linear_operations_1.sub)(this.vertices[index], origin), (0, linear_operations_1.sub)(this.vertices[index], origin));
            totalSummation += cS * dS;
            crossSummation += cS;
            dotSummation += dS;
        }
        //Product of the cross and dot summation
        let productSummation = this.mass * totalSummation;
        moi = productSummation / (6 * crossSummation);
        return moi;
    }
    computeTorque(vector) {
        const armVector = this.calculateCentroid();
        return (this.torque = armVector.x * vector.y - armVector.y * vector.x);
    }
    simulate(time, gravity) {
        gravity = gravity === undefined ? { x: 0, y: 0 } : gravity;
        const linearAccel = { x: gravity.x / this.mass, y: gravity.y / this.mass };
        let vertexRotations = [];
        for (let vertex of this.vertices) {
            this.linearVelocity.x += linearAccel.x * time;
            this.linearVelocity.y += linearAccel.y * time;
            vertex.x += this.linearVelocity.x * time;
            vertex.y += this.linearVelocity.y * time;
            let angularAccel = this.torque / this.moi;
            this.angularVelocity += angularAccel * time;
            this.angle = this.angularVelocity * time;
            vertexRotations.push(this.rotate(vertex, this.angle));
        }
        this.vertices = vertexRotations;
    }
}
exports.RigidBody = RigidBody;

},{"../linear_operations":3,"../objects/polygon":5}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rigidPoly_1 = require("../rigid_bodies/rigidPoly");
const bvh_1 = require("../collisions/bvh");
const AABB_1 = require("../collisions/AABB");
const linear_operations_1 = require("../linear_operations");
const canvas = document.getElementById("container");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const gravity = { x: 0, y: 0 };
let start;
const rectVerts = (x, y, width, height) => {
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
const Collections = [];
const RigidBodies = [];
const verts1 = rectVerts(0, 0, 100, 100);
const rigidBody1 = new rigidPoly_1.RigidBody(ctx, [
    { x: 150, y: 180 },
    { x: 200, y: 195 },
    { x: 210, y: 180 },
    { x: 130, y: 140 },
    { x: 150, y: 180 },
], gravity, 4);
const rigidBody2 = new rigidPoly_1.RigidBody(ctx, verts1, gravity, 6);
const rigidBody3 = new rigidPoly_1.RigidBody(ctx, [
    { x: 100, y: 140 },
    { x: 200, y: 195 },
    { x: 130, y: 210 },
    { x: 100, y: 140 },
], gravity, 0.3);
const rigidBody4 = new rigidPoly_1.RigidBody(ctx, [
    { x: 90, y: 110 },
    { x: 110, y: 140 },
    { x: 130, y: 115 },
    { x: 90, y: 110 },
], gravity, 0.9);
const rigidBody5 = new rigidPoly_1.RigidBody(ctx, [
    { x: 100, y: 140 },
    { x: 200, y: 195 },
    { x: 130, y: 210 },
    { x: 100, y: 140 },
], gravity, 10);
const rigidBody6 = new rigidPoly_1.RigidBody(ctx, [
    { x: 150, y: 180 },
    { x: 200, y: 195 },
    { x: 300, y: 205 },
    { x: 210, y: 180 },
    { x: 130, y: 140 },
    { x: 150, y: 180 },
], gravity, 7.65);
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
let min = { x: Number.MAX_VALUE, y: Number.MAX_VALUE };
let max = { x: -1, y: -1 };
for (let rigidBody of Collections) {
    let boundsCoords = rigidBody.getBoundingCoords();
    rigidBody.gravity = 0;
    if (boundsCoords.min.x < min.x) {
        min.x = boundsCoords.min.x;
    }
    if (boundsCoords.min.y < min.y) {
        min.y = boundsCoords.min.y;
    }
    if (boundsCoords.max.x > max.x) {
        max.x = boundsCoords.max.x;
    }
    if (boundsCoords.max.y > max.y) {
        max.y = boundsCoords.max.y;
    }
}
console.log(min);
console.log(max);
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
    let nodes = [];
    let index = 0;
    // Get all AABBs of every rigidBody on the screen
    for (let rigidBody of dummyArray) {
        let boundingBox = new AABB_1.AABB(rigidBody.getBoundingCoords().min, rigidBody.getBoundingCoords().max);
        AABBs.push(boundingBox);
    }
    // Creating the first layer of rigidBody bounding box nodes
    // For the first pass AABB will be empty after going through n/2 times if it is even
    // If the length is even, only one AABB will be undefined, ergo boxB
    while (AABBs.length !== 0) {
        let boxA = AABBs.shift();
        let boxB = AABBs.shift();
        if (boxA === undefined) {
            break;
        }
        if (boxA !== undefined && boxB === undefined) {
            parentNode = new bvh_1.TreeNode(boxA);
            nodes.push(parentNode);
        }
        // Create two leaf nodes
        let left = new bvh_1.TreeNode(boxA);
        let right = new bvh_1.TreeNode(boxB);
        // Create a new TreeNode, the children will be A and B, while the parent will be the new bounding box C
        C = unionBounding(boxA, boxB);
        parentNode = new bvh_1.TreeNode(C);
        index++;
        parentNode.left = left;
        parentNode.right = right;
        nodes.push(parentNode);
    }
    // Build the node tree with any arbitrary length
    /*
    A = nodes.shift() as TreeNode
    B = nodes.shift() as TreeNode
  
    if (A !== undefined && B !== undefined) {
      C = unionBounding(A.box as AABB, B.box as AABB) as AABB
    }
    
    let root = new TreeNode(C as AABB, A, B)
    root.left = A
    root.right = B
  
    C = unionBounding(root.box as AABB, nodes.shift()?.box as AABB)
  
    parentNode = new TreeNode(C, root.left, root.right)
  
    console.log(parentNode)*/
    while (nodes.length !== 0) {
        A = nodes.shift(); // Think of A and B as the previous terms in the nodes queue
        B = nodes.shift();
        if (A === undefined) {
            break;
        }
        if (A !== undefined && B === undefined) {
            break;
        }
        C = unionBounding(A.box, B.box); // This is getting the top level root bounding box
        parentNode = new bvh_1.TreeNode(C);
        parentNode.left = A;
        parentNode.right = B;
        nodes.push(parentNode);
    }
    console.log(parentNode);
    return parentNode;
};
//AABB collision broad phrase
const unionBounding = (A, B) => {
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
    let C = new AABB_1.AABB(lowerBound, upperBound);
    return C;
};
buildDBVT();
const AreaAABB = (A) => {
    let distance = { x: A.max.x - A.min.x, y: A.max.y - A.min.y };
    return distance.x * distance.y;
};
const RayCastCheckAABB = (p1) => {
    for (let entity of Collections) {
        let A = new AABB_1.AABB(entity.getBoundingCoords().min, entity.getBoundingCoords().max);
        if ((0, linear_operations_1.TestOverlap)(p1, ctx, A) == false) {
            continue;
        }
        if (entity.checkInside(p1))
            return true;
    }
    return false;
};
const draw = (t) => {
    for (let entity of Collections) {
        entity.update();
        entity.boundingBox = true;
    }
    for (let entity of RigidBodies) {
        entity.simulate(t, gravity);
    }
};
const update = (timestamp) => {
    if (start === undefined)
        start = timestamp;
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
const drag = (event) => {
    // Get the position of the mouse cursor and subtract it by the top left coordinates to get the relative position inside the object
    // Get the position of the initial point of the mouse cursor
    let initialPoint = { x: event.offsetX, y: event.offsetY };
    let initialEntity;
    let initialVertices = [];
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
    const move = (event) => {
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

},{"../collisions/AABB":1,"../collisions/bvh":2,"../linear_operations":3,"../rigid_bodies/rigidPoly":6}]},{},[7]);
