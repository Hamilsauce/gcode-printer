import { GCODE_FILES } from '../files/index.js';
import { gcodePaths } from '../data/gcode-paths.js';

const isEntriesArray = (arr = []) => arr.every((item) => Array.isArray(item) && item.length === 2);


class ListenerSet extends Set {
  constructor(values) {
    super();
    
    if (Array.isArray(values)) {
      values.forEach((x, i) => {
        this.add(x)
      });
    } else this.add(values)
  }
  
  add(v) {
    super.add(v)
    return this;
  }
  
  toJSON() {
    return [...this.values()].map((_) => _.toString())
  }
}

export class ListenerRegistry extends Map {
  constructor(values = []) {
    super();
    
    if (isEntriesArray(values)) {
      values.forEach(([k, v], i) => {
        this.set(k, v)
      });
    }
  }
  
  set(propName, handlerFn) {
    if (super.has(propName)) super.get(propName).add(handlerFn)
    else super.set(propName, new ListenerSet(handlerFn))
    
    return this;
  }
  
  get(name){
    return super.get(name);
  }
  
  getEventListenerCount(name) {
    return this.get(name).size
  }
  
  toJSON() {
    return [...this.entries()]
  }
}


class AppState {
  #listeners = new ListenerRegistry();
  #fileDir = './files';
  
  #state = {
    appTitle: null,
    filepath: null,
    drawPoints: false,
    rotation: 0,
    files: new Map(GCODE_FILES.map(({ name, ...file }) => [name, file])),
  }
  
  constructor(initialState = {}) {
    this.#state = { ...this.#state, ...initialState }
  }
  
  emit(propName, data) {
   const entries = this.#listeners.get(propName)
    
   entries.values() .forEach((handler, i) => {
      handler(data)
    });
  }
  
  select(propName) { return this.#state[propName] }
  
  listenOn(propName, handlerFn) {
    if (this.#listeners.has(propName)) {
      this.#listeners.set(propName, handlerFn)//[...this.#listeners.get(propName), handlerFn])
    }
    else {
      this.#listeners.set(propName, handlerFn)
    }
    
    handlerFn(this.#state[propName]);
  }
  
  update(propName, value) {
    const propValue = this.#state[propName];
    const propType = propValue ? propValue.constructor.name.toLowerCase() : null;
    
    if (propType === 'array') {
      this.#state[propName] = [...propValue, ...value];
    }
    else if (propType === 'object') {
      this.#state[propName] = { ...propValue, ...value };
    }
    else {
      this.#state[propName] = value;
    }
    
    if (this.#listeners.has(propName)) {
      this.emit(propName, this.#state[propName])
    }
  }
}


const INITIAL_STATE = {
  appTitle: '3D Printer',
  filepath: gcodePaths[0],
}
export const appState = new AppState(INITIAL_STATE);