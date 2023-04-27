import { Point, waitMs, pointsBetween } from './lib/index.js';
import { appState } from './lib/AppState.js';
import ham from 'https://hamilsauce.github.io/hamhelper/hamhelper1.0.0.js';
const { template, utils, download } = ham;
export const loadFile = async (path) => {
  return await (await fetch(path)).text();
};

export class GcodePrinter {
  #canvas = null;
  #scene = null;
  #path = null;
  #gcode = null;
  #cursor = 0;
  #commandQueue = [];
  #layers = new Map()
  #currentLayer = null;
  #currentPoint = new Point(0, 0);
  #commands = [];
  #position = { x: 0, y: 0, z: 0, e: 0 };
  #isPrinting = false;
  #frameId = null;

  constructor(canvas) {
    this.#canvas = canvas;

    this.#scene = canvas.querySelector('#scene');
    this.run = this.#run.bind(this);

    appState.listenOn('rotation', async (rotation) => {
      if (this.#currentLayer) {
        this.#currentLayer.setAttribute('transform', `rotate(${rotation})`);
      }
    });

    window._printer = this;
  }

  get currentLayer() { return this.#currentLayer }

  get currentPoint() { return this.#currentPoint }

  createLayerPath(z) {
    const p = this.#canvas.querySelector('#layer-path-template').cloneNode(true);
    p.dataset.z = z;
    p.dataset.id = 'layer' + z;

    return p;
  }

  appendToPath(d = '', command, point = new Point(0, 0)) {
    return `${d.replace('~~', '')} ${(command === 'G0' ? 'M ' : '') + point.toString()}`;
  }

  moveTo(d = '', command, point = new Point(0, 0)) {
    return `${(command === 'G0' ? 'M ' : '') + point.toString()}`;
  }

  peekState() {
    return {
      isPrinting: this.#isPrinting,
      commands: this.#commands,
      cursor: this.#cursor,
      layers: this.#layers,
      // d: this.#currentLayer.getAttribute('d'),
      drawCommands: this.drawCommands,
    }
  }

  stop(options) {
    cancelAnimationFrame(this.#frameId);
    this.#isPrinting = false;
    this.#frameId = null;
    this.lastPoint = null;
    this.#cursor = 0;
    this.#layers.clear();
    this.#currentLayer = null;
    this.#currentPoint = new Point(0, 0);

    console.warn('[PRINTER STOPPED]');
  }

  reset(options) {
    this.#cursor = -1;

    this.#path.setAttribute('d', '');

    this.#path.remove();

    console.warn('[PRINTER RESET]');
  }

  async drawPoints(commands = [], onCompleteHandler = () => null) {
    if (!(this.#isPrinting === true || currentPoint)) {
      this.stop();
    }

    else {

      const { command, x, y, z, e } = this.currentPoint;

      if (this.lastPoint && command === 'G1') {
        const pts = [
          this.lastPoint,
          ...pointsBetween(this.lastPoint, { x, y }).map(_ => ({ ..._, command })),
          { command, x, y }
        ];

        const time = this.INTERVAL ? this.INTERVAL / pts.length : 0;

        for (let n = 0; n < pts.length; n++) {
          const pt = pts[n];

          d = this.appendToPath(d, command, new Point(pt.x, pt.y));

          this.#path.setAttribute('d', d);
        }
      }

      else {
        d = this.appendToPath(d, command, new Point(x, y));

        this.#path.setAttribute('d', d);
      }

      this.lastPoint = this.currentPoint;

      this.#cursor = this.#cursor + 1;

      this.currentPoint = this.drawCommands[this.#cursor];

      this.#frameId = requestAnimationFrame(this.drawPoints.bind(this));
    }
  }



  async #run(cmd, onCompleteHandler = () => null) {
    let INTERVAL = 8
    const { command, x, y, z, e } = cmd;

    let d = ''

    // HANDLE LAYER RESOLUTION
    if (z) {
      d = '';

      if (!this.#layers.has(z)) {
        this.#layers.set(z, this.createLayerPath(z));
      }

      this.#currentLayer = this.#layers.get(z);

      if (!this.#currentLayer.parentElement) {
        this.#scene.append(this.#currentLayer);
      }
    }


    d = this.#currentLayer.getAttribute('d') || '';

    if (command == 'G0') {
      const p = document.createElementNS(this.#canvas.namespaceURI, 'circle');

      p.r.baseVal.value = 0.15;
      p.cy.baseVal.value = (+y || 1);
      p.cx.baseVal.value = (+x || 1);
      p.classList.add('G0');

      this.#scene.append(p);
    }

    // console.log('this.currentPoint', this.#currentPoint)
    if (this.currentPoint && command === 'G1') {
      const pts = [
        this.currentPoint,
        ...pointsBetween(this.currentPoint, { x, y }).map(_ => ({ ..._, command })),
        { command, x, y }
      ];

      // const time = INTERVAL ? INTERVAL / pts.length : 0;
      const time = INTERVAL ? (4 / 16) * 100 : 0
      // console.warn('time', time)  
      // console.log('pts', pts)

      for (let n = 0; n < pts.length; n++) {
        const pt = pts[n];

        d = this.appendToPath(d, command, new Point(pt.x, pt.y));


        this.#currentLayer.setAttribute('d', d);
        await waitMs(INTERVAL / pts.length);
        // await waitMs(time);
      }
    }

    else {
      d = this.appendToPath(d, command, new Point(x, y));
      this.#currentLayer.setAttribute('d', d);

      await waitMs(INTERVAL);
    }

    this.#currentPoint = { x, y, z } //new Point(x, y);

    return this.#currentPoint;
  }


  async print(commands = [], onCompleteHandler = () => null) {
    this.stop()

    this.#commands = commands;
    this.drawCommands = commands.filter(({ command, x, y }) => !(isNaN(x) || isNaN(y)) && ['G0', 'G1'].includes(command));
    this.#scene.innerHTML = '';

    this.#layers = new Map(
      [
        [0, this.createLayerPath(0)],
        ...commands
          .filter(({ z }) => z)
          .map(({ z, ...cmd }) => [z, this.createLayerPath(z)]),
      ]
    );

    this.#currentLayer = this.#layers.get(0);

    const cmds = this.drawCommands;

    if (cmds[0] && cmds[0].x && cmds[0].y) {
      let frameId = null;
      let lastPoint = null;
      let currentCmd = null;
      let d = 'M ';

      this.#scene.append(this.#currentLayer);
      this.#isPrinting = true;
      this.#cursor = 0;
      currentCmd = cmds[this.#cursor];

      const INTERVAL = 0;

      while (this.#isPrinting === true && this.#currentPoint) {
        currentCmd = cmds[this.#cursor];

        await this.run(currentCmd);

        this.#cursor = this.#cursor + 1;

        this.#isPrinting = this.#isPrinting === false ? false : !!cmds[this.#cursor];
      }

      console.warn('~~~~~~~~~ Print End', this.#isPrinting);

      this.stop();

      return this;
    }
  }
}