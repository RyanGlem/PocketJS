import { AABB } from "./AABB";

export class TreeNode {
    box:AABB
    objectIndex:number = 0;
    parentIndex:number = 0
    left:TreeNode | null
    right:TreeNode | null
    isLeaf:boolean = false

    constructor (box:AABB, left?: TreeNode, right?: TreeNode, objectIndex? : number ) {
        this.box = box
        this.left = left === undefined ? null : left
        this.right = right === undefined ? null : right
        this.objectIndex = objectIndex === undefined ? 0 : objectIndex
    }
}

class BoundingVolumeTree {
    root:TreeNode
    size:number = 0
    rootIndex: number = 0

    constructor (box:AABB) {
        this.root = new TreeNode(box)
        this.size = 0
    }

}