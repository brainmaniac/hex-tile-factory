export class Point {
    constructor(x,y) {
        this.x = x
        this.y = y
    }
    
    asArray() {
        return [this.x, this.y]
    }
}