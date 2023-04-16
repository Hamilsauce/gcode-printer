/*
  Fuse Protocol
  
  Fusible: implement a fuse() method that
    takes an object with infuse() and defuse() methods
    
    - fuse(EnfusibleObject): Receives object that must have 
      an infuse() method and defuse() method
    - Calls the infuse() method on the provided object
      which extends the fusible with its behavior/data
    - Calls the defuse() method when behavior/data no longer
      required;
      
    - fuse must return a function that 
      calls the infusible's defuse() method when called.
    
  Infusible: infuse() and defuse() methods
   
    - infuse(fusibleObject): Adds/installs/extends 
      provided object with new behavior. infuse is called by 
      target fusible
    -defuse(): removes previously fused functionality
*/

export class Infusible {
  constructor(infuseFunction = (fusible) => null, defuseFunction = (fusible) => null) {
    if (!(typeof infuseFunction === 'function' && typeof defuseFunction === 'function')) throw new Error('Missing defuseFunction or infuseFunction');

    this.infuse = infuseFunction;

    this.defuse = defuseFunction;
  }

  static infusify(target, infuseFn, defuseFn) {
    Object.assign(target, {
      infuse: infuseFn.bind(target),
      defuse: defuseFn.bind(target),
    });
  }

  infuse(fusible = {}, options = {}) {
    throw 'Must define infuse in child class of view. Cannot call create on View Class.';
  }

  defuse(fusible = {}, options = {}) {
    throw 'Must define defuse in child class of view. Cannot call create on View Class.';
  }
}


export class Fusible {
  static fusify(target) {
    Object.assign(target, {
      fuse: Fusible.prototype.fuse.bind(target),
      fusions: new Map(),
    });
  }

  fuse(infusible = {}, options = {}) {
    if (!(infusible.infuse && infusible.defuse)) throw new Error('Object passed to fuse missing enfuse and defuse methods');

    infusible.infuse(this, options)

    return {
      get infusible() { return infusible },
      get fusible() { return this },
      defuse: () => {
        infusible.defuse(this)
      },
    };
  }
}