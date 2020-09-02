import { HexagonFactory} from './HexagonFactory'
import { SectionFactory} from './SectionFactory'
import { Point } from './Point'
import Delaunator from 'delaunator';
let jsts = require('jsts')

export class Tile {    
    constructor(options) {
        this.encoded = options.encoded

        this.backgroundHexagon = HexagonFactory.make()

        this.sections = SectionFactory.make(this.encoded)

        this.randomize()

        var reader = new jsts.io.WKTReader()
        var a = reader.read('POINT (-20 0)')
        var b = reader.read('POINT (20 0)')
        a = a.buffer(40)
        console.log(a, b)
    }

    static fromEncoded(encoded) {
        let instance = new Tile({
            encoded
        })

        return instance
    }

    hasSections() {
        return true;
    }

    isSixSided() {
        return false;
    }
    
    randomize() {
        [0].forEach(iteration => {
            this.sections.forEach(section => {
                this.densify(section)
                for(let i = 1; i+1 < section.innerBorder.points.length; i++) {
                    let point = section.innerBorder.points[i]
                    this.randomizePoint(point, iteration)
                }
            })
        })

    }

    densify(section) {
        for(let i = section.innerBorder.length() -1; i > 0; i=i-2) {   
            section.innerBorder.points.splice(i,0, new Point(
                (section.innerBorder.points[i-1].x+section.innerBorder.points[i].x)/2,
                (section.innerBorder.points[i-1].y+section.innerBorder.points[i].y)/2,
            ))
        }
    }

    randomizePoint(point, iteration) {
        
        const points = [
            [point.x, point.y], // Ensures our point is at index 0 to easily find it
            ...this.allPoints().map(p => p.asArray()) // Any duplicates will be ignored
        ]

        //console.log(points.flatMap(p => [p[0], p[1]]));

        const delaunay = Delaunator.from(points);
        let triangles = delaunay.triangles
        let connectedTriangles = []

        for (let i = 0; i < triangles.length; i += 3) {
            let pi0 = triangles[i];
            let pi1 = triangles[i+1];
            let pi2 = triangles[i+2];

            if([pi0,pi1,pi2].includes(0)) {
                connectedTriangles.push([
                    // Build area
                    points[pi0],
                    points[pi1],
                    points[pi2]
                ]);
            }
        }

        let selectedTriangleIndex = Math.floor(Math.random() * connectedTriangles.length);
        let selectedTriangle = connectedTriangles[selectedTriangleIndex];
        
        // Triangels might overlap with other sections!
        // Need to perform buffer and clip forbidden areas
        // CLIPPING
        //https://github.com/mfogel/polygon-clipping#readme
        // BUFFER
        //http://bjornharrtell.github.io/jsts/

        let newPoint = new Point(
            (selectedTriangle[0][0]+selectedTriangle[1][0]+selectedTriangle[2][0])/3,
            (selectedTriangle[0][1]+selectedTriangle[1][1]+selectedTriangle[2][1])/3,
        )
        
        point.x = newPoint.x
        point.y = newPoint.y
    }

    allPoints() {
        return [
            ...this.backgroundHexagon.asPoints(),
            ...this.sections.flatMap(s => s.asLine().asPoints())
        ]
    }

    triangleArea(p0,p1,p2) {
        var sides = prompt("Triangle side lengths in cm (number,number,number)"),
            nsides = sides.split(","),
            a = parseFloat(nsides[0]),
            b = parseFloat(nsides[1]),
            c = parseFloat(nsides[2]),
            s = (a + b + c) / 2,
            area = Math.sqrt(s * (s - a) * (s - b) * (s - c));
        alert("The triangle's area is " + area + " square cm");
        return area; // return the area
    }    
}