//Axis-Aligned bounding box class created from a RigidBody

export class AABB {
    min = {x: 0, y:0}
    max = {x:0, y:0}

    constructor (min: {x: number, y: number}, max: {x: number, y:number}) {
        this.min = min
        this.max = max
    }

}