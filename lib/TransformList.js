import { roundTwo } from './utils.js';

export const TRANSFORM_TYPES = {
  SVG_TRANSFORM_MATRIX: 1,
  SVG_TRANSFORM_ROTATE: 4,
  SVG_TRANSFORM_SCALE: 3,
  SVG_TRANSFORM_SKEWX: 5,
  SVG_TRANSFORM_SKEWY: 6,
  SVG_TRANSFORM_TRANSLATE: 2,
  SVG_TRANSFORM_UNKNOWN: 0,
}

export const TRANSFORM_TYPE_INDEX = [
  'SVG_TRANSFORM_UNKNOWN',
  'SVG_TRANSFORM_MATRIX',
  'SVG_TRANSFORM_TRANSLATE',
  'SVG_TRANSFORM_SCALE',
  'SVG_TRANSFORM_ROTATE',
  'SVG_TRANSFORM_SKEWX',
  'SVG_TRANSFORM_SKEWY',
];


const TransformListOptions = {
  transforms: Array,
}

const TransformMatrixMap = {
  e: 'tx',
  f: 'ty',
}

const DEFAULT_TRANSFORMS = {
  transforms: [
    {
      type: 'translate',
      values: [0, 0],
      position: 0,
    },
    {
      type: 'rotate',
      values: [0, 0, 0],
      position: 1,
    },
    {
      type: 'scale',
      values: [1, 1],
      position: 2,
    },
  ]
};

export class TransformList {
  #self = null;
  #context = null;
  #element = null;
  #transforms = null;
  #transformMap = new Map();

  constructor(element, { transforms } = DEFAULT_TRANSFORMS) {
    if (!(element instanceof SVGElement)) throw new Error('!(element instanceof SVGElement), TransformList.js line 40');

    this.#element = element;

    this.#context = element.closest('svg');

    this.#self = this.#element.transform.baseVal;

    if (transforms) {
      this.init(transforms);
    }
  };

  init(transforms = []) {
    transforms.forEach(({ type, values }, i) => {
      const t = this.createTransform(type, ...(values || []))

      if (i === 0) {
        this.#self.initialize(t);
      }
      else {
        this.insert(t);
      }
    });
  }

  getMatrixAt(index = 0) {
    const { a, b, c, d, e, f } = index < this.#self.numberOfItems ? this.#self.getItem(index).matrix : null;

    return [a, b, c, d, e, f].some(_ => isNaN(_)) ? null : { a, b, c, d, e, f, }
  }

  createTransform(type, ...values) {
    type = type.toLowerCase();

    const t = this.#context.createSVGTransform();

    switch (type) {
      case 'translate': {
        t.setTranslate(...values);
        break;
      }
      case 'rotate': {
        t.setRotate(...values);
        break;
      }
      case 'scale': {
        t.setScale(...values);
        break;
      }
      default: {}
    }

    return t;
  }

  consolidate() {
    return this.#self.consolidate();
  }

  translateTo(x = 0, y = 0) {
    this.#self.replaceItem(this.createTransform('translate', x, y), 0);

    return this;
  }

  rotateTo(deg = 0, x = 0, y = 0) {
    this.#self.replaceItem(this.createTransform('rotate', deg, x, y), 1);

    return this;
  }

  scaleTo(x = 1, y = 1) {
    if (isNaN(+x)) return;

    y = isNaN(+y) ? x : y;

    this.#self.replaceItem(this.createTransform('scale', x, y), 2);

    return this;
  }

  insert(transform, beforeIndex) {
    if (!beforeIndex) {
      this.#self.appendItem(transform)
    } else {
      this.#self.insertItemBefore(transform, beforeIndex)
    }

    return this;
  }

  getItem(index) {
    return this.#self.getItem(index)
  }

  get transforms() {
    return {
      translate: this.getItem(0),
      rotate: this.getItem(1),
      scale: this.getItem(2),
    }
  }

  get transformItems() { return [...this.#self] };

  get translation() {
    return {
      x: roundTwo(this.getMatrixAt(0).e),
      y: roundTwo(this.getMatrixAt(0).f),
    }
  }

  get rotation() {
    return {
      x: roundTwo(this.getMatrixAt(1).b),
      y: roundTwo(this.getMatrixAt(1).c),
    }
  }

  get scale() {
    return {
      x: roundTwo(this.getMatrixAt(2).a),
      y: roundTwo(this.getMatrixAt(2).d),
    }
  }
}