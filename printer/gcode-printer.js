import { Point, waitMs, pointsBetween } from '../lib/index.js';
import { appState } from '../lib/AppState.js';
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
  timestamps = [];

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

  get currentCommand() { return (this.drawCommands || [])[this.#cursor] }
  get isPrinting() { return this.#isPrinting === false ? false : !!this.currentCommand; }

  createLayerPath(z) {
    const p = this.#canvas.querySelector('#layer-path-template').cloneNode(true);
    p.dataset.z = z;
    p.setAttribute('d', `M ${this.currentPoint.x},${this.currentPoint.y}`)
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
      isPrinting: this.isPrinting,
      // commands: this.#commands,
      cursor: this.#cursor,
      layers: this.#layers,
      // d: this.#currentLayer.getAttribute('d'),
      drawCommands: this.drawCommands,
      currentPoint: this.#currentPoint,
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
    if (this.timestamps.length) {

      // download('printer-timestamps.json', JSON.stringify(this.timestamps, null, 2))
    }
  }

  reset(options) {
    this.#cursor = -1;

    this.#path.setAttribute('d', '');

    this.#path.remove();

    console.warn('[PRINTER RESET]');
  }

  async #run(timestamp) {
    if (this.isPrinting) {
      let INTERVAL = 8
      const { command, x, y, z, e } = this.currentCommand;
      this.timestamps.push(timestamp)

      let d = '';

      // HANDLE LAYER RESOLUTION
      if (z) {
        d = '';
console.warn('LAYER z', z)
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

       if (this.currentPoint && command === 'G1') {
        const pts = [
        this.currentPoint,
        ...pointsBetween(this.currentPoint, { x, y }).map(_ => ({ ..._, command })),
          { command, x, y }
        ];

        const time = INTERVAL ? (4 / 16) * 100 : 0

        for (let n = 0; n < pts.length; n++) {
          const pt = pts[n];

          d = this.appendToPath(d, command, new Point(pt.x, pt.y));

          this.#currentLayer.setAttribute('d', d);
          await waitMs(INTERVAL / pts.length);
          // await waitMs(time);
        }
      }

      // else {
      //   d = this.appendToPath(d, command, new Point(x, y));
      //   this.#currentLayer.setAttribute('d', d);

      //   await waitMs(INTERVAL);
      // }

      this.#currentPoint = { x, y, z } //new Point(x, y);
      this.#cursor = this.#cursor + 1;
      this.#isPrinting = this.#isPrinting === false ? false : !!this.drawCommands[this.#cursor];
      this.#frameId = requestAnimationFrame(this.run);
    }
    else {
      this.stop();
    }
  }

  async print(commands = [], onCompleteHandler = () => null) {
    this.stop()
    this.timestamps = [];

    this.#commands = commands;
    this.drawCommands = commands.filter(({ command, x, y }) => !(isNaN(x) || isNaN(y)) && ['G0', 'G1'].includes(command));
    this.#scene.innerHTML = '';

    this.#layers = new Map(
      [
        [0, this.createLayerPath(0)],
        // ...commands
          // .filter(({ z }) => z)
          // .map(({ z, ...cmd }) => [z, this.createLayerPath(z)]),
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
      await this.run();

      // while (this.#isPrinting === true && this.#currentPoint) {
      //   currentCmd = cmds[this.#cursor];


      //   this.#cursor = this.#cursor + 1;
      //   this.#isPrinting = this.#isPrinting === false ? false : !!cmds[this.#cursor];
      // }


      // console.warn('~~~~~~~~~ Print End', this.#isPrinting);

      // this.stop();

      return this;
    }
  }
}