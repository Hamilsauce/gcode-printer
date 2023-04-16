import {  Infusible } from '../../Fusible.js';


export const eventEmitter = {
  listeners = new Map(),
  emit(propName, data) {
    this.listeners.get(propName).forEach((handler, i) => {
      handler(data)
    });
  }
}

Infusible.infusify(eventEmitter,
  (fusible) => {
    Object.assign(fusible, {
      listeners: eventEmitter.listeners,
      loadGcode: eventEmitter.emit,
    });

    return eventEmitter.defuse;
  },
  (fusible) => {
    delete fusible.listeners;
    delete fusible.emit;
  }
);
