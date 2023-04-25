/*
  Creates and draws layer paths
  
  layers: Collection of all layer paths drawn or being
  drawn
  
  currentLayer: top most (last appended) path
    to which Gcode Commands are applied
  
  currentPoint: Position on currentLayer after
    last Gcode
    
  addLayer(z)
  
  moveToPoint(x,y): handles 'G0' (doesnt draw);
    Sets currentPoint to x,y;
   
    Appends 'M x,y ' to path

  printTo(x,y): handles 'G1';
    Draws line from current point to x,y;
    
    Sets currentPoint to x,y;
    
    SVG: Appends ' x,y ' to path;
  
*/

export class GcodePrinter {
  #svg = null;
  #layers = new Map();
  #z = -1;
  // #currentLayer =  // replace with Point 
  #currentPoint = { x: 0, y: 0 } // replace with Point 


  constructor(svgContext, options) {
    this.#svg = svgContext;
  }

  get currentLayer() { return this.#z < 0 ? null : this.#layers.get(this.#z) }

  get svg() { return this.#svg }
  
  get currentPoint() { return this.#currentPoint }

  _draw() {
    return {
      from() {
        return {
          to() {
            return 'x,y';
          }
        }
      }
    }
  }

  addLayer(z = 0) {
    if (!this.#layers.set(z)) {
      this.#layers.set(z, this.createLayerPath(z));
      this.#scene.append(this.#currentLayer);
    }

    this.#currentLayer = this.#layers.get(z);
  }

  draw() {}
}