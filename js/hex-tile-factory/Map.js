import { Tile } from '../hex-tile-factory/Tile'
import { MagicStack } from '../hex-tile-factory/stacks/MagicStack'
var seedrandom = require('seedrandom');

export class Map {
    constructor(options) {
        this.options = options
        this.tiles = []

        this.populateTiles()        
    }

    placeTile(tile, q, r) {

    }

    tileAt(q,r) {
        return this.tiles.find(tile => {
            return tile.options.q == q && tile.options.r == r
        })
    }

    constraintsAt(q,r) {
        let sides = [null, null, null, null, null, null]

        sides[0] = this.tileAt(q , r-1) ? this.tileAt(q , r-1).topology[3] : null
        sides[1] = this.tileAt(q - 1, r) ? this.tileAt(q - 1, r).topology[4] : null
        sides[2] = this.tileAt(q-1, r + 1) ? this.tileAt(q-1, r + 1 ).topology[5] : null
        sides[3] = this.tileAt(q, r+1) ? this.tileAt(q  , r+1).topology[0] : null
        sides[4] = this.tileAt(q + 1, r) ? this.tileAt(q + 1, r).topology[1] : null
        sides[5] = this.tileAt(q + 1, r - 1) ? this.tileAt(q + 1, r - 1).topology[2] : null

        return sides
    }

    populateTiles() {

        let radius = 100

        let size = parseInt(this.options.size)

        let creation_instance = 0

        for(let q = -size; q <= size; q++) {
            let r1 = Math.max(-size, -q -size)
            let r2 = Math.min(size, -q +size)
            for(let r = r1; r <= r2; r++) {

                let constraints = this.constraintsAt(q,r)
                creation_instance++

                this.tiles.push(new Tile({
                    topology: MagicStack.make().getConstrained(constraints),
                    iterations: this.options.iterations,
                    strategy: 'RandomOffset',
                    rotation: 0,
                    seed: this.seed,
                    q,
                    r,
                    x: r * radius * 3/2,
                    y: q * Math.sqrt(3) * radius + r * Math.sqrt(3) * radius/2,
                    creation_instance: creation_instance,
                }))
            }
        }       
    }
}