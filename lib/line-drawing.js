/* 
    Linear interpolation (“lerp”) gives you a 
    number between two other numbers. 
    When t = 0.0 you get the start point; 
    when t = 1.0 you get the end point. 
*/

// export class Point extends DOMPoint {
//   constructor({ x, y }) {
//     super(x, y)
//   };
// }
export class Point {
  x = null;
  y = null;

  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  toString() { return `${this.x},${this.y}`; }
}


export const diagonal_distance = (p0, p1) => {
  let dx = p1.x - p0.x,
    dy = p1.y - p0.y;
  return Math.max(Math.abs(dx), Math.abs(dy));
}

export const round_point = (p) => {
  return new Point(Math.round(p.x), Math.round(p.y));
}




export const lerp = (start, end, t) => {
  return start * (1 - t) + end * t;
}

// Here’s the code to find point x,y between
// point p0 = (x0,y0) and point p1 = (x1,y1):
export const lerp_point = (p0, p1, t) => {
  return new Point(lerp(p0.x, p1.x, t),
    lerp(p0.y, p1.y, t));
}

export const pointsBetween = (p0, p1) => {
  // console.log('p0, p1', p0, p1)

  let points = [];

  let N = diagonal_distance(p0, p1);

  // console.log('N', N)

  for (let step = 0; step <= N; step++) {
    let t = N === 0 ? 0.0 : step / N;

    // console.log('t', t)
    // console.log('lerp_point(p0, p1, t)', lerp_point(p0, p1, t))

    // points.push(round_point(lerp_point(p0, p1, t)));
    points.push(lerp_point(p0, p1, t));
  }

  return points;
}

// Let’s divide the line into 5 equal 
//line segments:

// let N = 5;

// let p0 = { x: 0, y: 1 }
// let p1 = { x: 5, y: 8 }
// let points = pointsBetween(p0, p1)

// for (let step = 0; step <= N; step++) {
//   let t = step / N;
//   points.push(lerp_point(p0, p1, t));
// }


// console.log('[...points]', [...points].map((p) => p))