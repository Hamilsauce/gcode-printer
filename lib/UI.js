import { TransformList, TRANSFORM_TYPES, TRANSFORM_TYPE_INDEX } from '../../lib/TransformList.js';

import ham from 'https://hamilsauce.github.io/hamhelper/hamhelper1.0.0.js';
const { DOM } = ham;

export const ui = {
  _svgTransformList: null,
  _sceneTransformList: null,
  get transformLists() {
    return {
      svg: this._svgTransformList,
      scene: this._sceneTransformList,
    }
  },
  get app() { return document.querySelector('#app') },
  get appTitle() { return this.app.querySelector('#app-title') },
  get appHeader() { return this.app.querySelector('#app-header') },
  get appBody() { return this.app.querySelector('#app-body') },
  get save() { return this.app.querySelector('#save-image') },
  get origin() { return this.app.querySelector('#origin') },
  get controls() { return this.appBody.querySelector('#controls') },
  get fileSelect() { return this.controls.querySelector('#gcode-select') },
  get drawPoints() { return this.controls.querySelector('#draw-points') },
  get zoom() {
    return {
      container: this.appBody.querySelector('#zoom-buttons'),
      in: this.appBody.querySelector('#zoom-in'),
      out: this.appBody.querySelector('#zoom-out'),
    }
  },

  get svg() { return this.appBody.querySelector('svg') },
  get scene() { return this.svg.querySelector('#scene') },

  createSelect({ id, children, onchange }) {
    const sel = DOM.createElement({
      tag: 'select',
      elementProperties: { id, onchange },
    }, children);

    return sel;
  },

  init(fileList = []) {
    const parentBBox = this.svg.parentElement.getBoundingClientRect();

    this.svg.width.baseVal.value = parentBBox.width - parentBBox.x;
    this.svg.height.baseVal.value = parentBBox.height - parentBBox.y;

    this._svgTransformList = new TransformList(this.svg);
    this._sceneTransformList = new TransformList(this.scene);
    // console.log('this._svgTransformList', this._svgTransformList)

    this.controls.firstElementChild.append(
      this.createSelect({
        id: 'gcode-select',
        onchange: (e) => {
          e.preventDefault();
          e.stopPropagation();

          const selection = e.target.selectedOptions[0];
          console.log('selection.value', selection.value)
          e.target.dispatchEvent(new CustomEvent('gcodepath:change', {
            bubbles: true,
            detail: { filepath: selection.value }
          }));
        },
        children: fileList.map(({ path, name }, i) => DOM.createElement({
          tag: 'option',
          elementProperties: {
            textContent: name,
            value: path.startsWith('/') ? `.${path}` : `./data/${path}`
          },
        }))
      }),
    );

    this.drawPoints.addEventListener('change', ({ target }) => {
      this.dispatch(this.drawPoints, 'drawpoints:change', { drawPoints: target.checked })
    });
  },

  dispatch(target, type, detail = {}) {
    target.dispatchEvent(new CustomEvent(type, { bubbles: true, detail }));
  },
}