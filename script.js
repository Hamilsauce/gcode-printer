import { GcodeParser, loadFile } from './gcode-parser.js';
import { GcodePrinter } from './printer/gcode-printer.js'

import { Fusible, Infusible } from './Fusible.js';
import { GCODE_FILES } from './files/index.js';
import { TransformList, TRANSFORM_TYPES, TRANSFORM_TYPE_INDEX } from './lib/TransformList.js';
import { Point, zoom, addPanAction } from './lib/index.js';
import { appState } from './lib/AppState.js';
import { ui } from './lib/UI.js';
import { ReadableFile } from './lib/File.js';
import ham from 'https://hamilsauce.github.io/hamhelper/hamhelper1.0.0.js';

// import {longPress} from 'https://hamilsauce.github.io/hamhelper/hamhelper1.0.0.js';



const { template, utils, DOM, download, waitMs, event } = ham;

const loadGcodeFile = async (path, printPoints = false) => {
  appState.update('appTitle', 'loading...')
  
  const drawPoints = appState.select('drawPoints')
  const rawGcode = await printer.loadGcode(path)
  
  console.time('PARSE');
  const gcodeLines = await parser.parse(rawGcode)
  console.timeEnd('PARSE');
  
  const gcodeGrouped = await parser.groupByCommandType(gcodeLines)
  console.warn('gcodeGrouped', gcodeGrouped)
  
  const gcodeCoords = gcodeLines.filter(_ => !!_.x && !!_.y);
  
  // const gcodeCoords = gcodeLines.filter(_ => !!_.x && !!_.y);
  
  ui.scene.innerHTML = '';
  
  console.time('PRINT');
  await printer.print(gcodeLines);
  console.timeEnd('PRINT');
  
  let currentZ = 0;
  
  // if (drawPoints) {
  //   ui.scene.append(...(
  //     await Promise.all(
  //       gcodeCoords.map((async (code, i) => {
  //         currentZ = +code.z ? +code.z : currentZ;
  
  //         const p = document.createElementNS(ui.svg.namespaceURI, 'circle');
  
  //         p.r.baseVal.value = 0.15;
  //         p.cy.baseVal.value = (+code.x || 1);
  //         p.cx.baseVal.value = (currentZ || 0);
  
  //         if (code.command === 'G0') {
  //           p.classList.add('G0')
  //         }
  
  //         return p;
  //       }))
  //     )
  //   ));
  // }
  
  appState.update('appTitle', '3D Printer');
  
  return true;
};

ui.init(GCODE_FILES);

/*  @FUSION - Extend printer with fusibility 
      allow extension by interfacing with Infusible
*/
const printer = new GcodePrinter(ui.svg);

Fusible.fusify(printer);



/*  @FUSION - Extend parser with infusibility 
      allow Fusible to infuse itself with
      methods and data that parser exposes 
      via infuse method
*/
const parser = new GcodeParser(printer);

Infusible.infusify(parser,
  (fusible) => {
    Object.assign(fusible, {
      groupByCommandType: parser.groupByCommandType,
      loadGcode: parser.loadGcode,
    });
    
    return parser.defuse;
  },
  (fusible) => {
    delete fusible.groupByCommandType;
    delete fusible.loadGcode;
  }
);


const parserFusion = printer.fuse(parser);


ui.app.addEventListener('gcodepath:change', ({ detail }) => {
  appState.update('filepath', detail.filepath);
});

ui.drawPoints.addEventListener('drawpoints:change', ({ detail }) => {
  appState.update('drawPoints', detail.drawPoints);
});


appState.listenOn('appTitle', async (title) => {
  ui.appTitle.textContent = title;
});

appState.listenOn('rotation', async (rotation) => {
  console.log('rotation', rotation)
});

appState.listenOn('filepath', async (filepath) => {
  console.time('DRAW POINTS');
  
  printer.stop();
  
  await waitMs(500);
  
  const res = await loadGcodeFile(filepath, true);
  console.timeEnd('DRAW POINTS');
});


const pan$ = addPanAction(ui.svg, ({ x, y }) => {
  ui.svg.viewBox.baseVal.x = x;
  ui.svg.viewBox.baseVal.y = y;
});

pan$.subscribe();


let zoomDragSub = null;

setTimeout(() => {
  const svg = ui.svg;
  const scene = svg.querySelector('#scene');
  
  ui.zoom.container.addEventListener('click', e => {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    
    const vb = svg.viewBox.baseVal;
    const zoomId = e.target.closest('.app-button').id;
    const sTime = performance.now();
    
    if (zoomId === 'rotate') {
      appState.update('rotation', appState.select('rotation') + 45);
    }
    
    else if (zoomId === 'zoom-in') {
      zoom.in(svg);
    }
    
    else if (zoomId === 'zoom-out') {
      zoom.out(svg);
    }
  });
  
  ui.svg.addEventListener('click', e => {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    
    ui.zoom.container.style.opacity = 1;
    ui.origin.style.opacity = 1;
  });
  
  ui.zoom.container.addEventListener('dblclick', e => {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    
    ui.zoom.container.style.opacity = 0;
    ui.origin.style.opacity = 0;
  });
  
  
  appState.update('filepath', './data/whistle.gcode');
}, 200);