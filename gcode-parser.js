import { Point } from './lib/line-drawing.js';
import { Fusible, Infusible } from '../Fusible.js';

// export const loadReadableStream = async (path) => {
//   fetch(path)
//     .then((response) => response.body)
//     .then((rb) => {
//       const reader = rb.getReader();

//       return new ReadableStream({
//         start(controller) {
//           // The following function handles each data chunk
//           function push() {
//             // "done" is a Boolean and value a "Uint8Array"
//             reader.read().then(({ done, value }) => {
//               // If there is no more data to read
//               if (done) {
//                 console.warn("done", {done});
//                 controller.close();
//                 return;
//               }
//               // Get the data and send it to the browser via the controller
//               controller.enqueue(value);
//               // Check chunks by logging to the console
//               console.warn({done, value});
//               push();
//             });
//           }

//           push();
//         },
//       });
//     })
//     .then((stream) =>
//       // Respond with our stream
//       new Response(stream, { headers: { "Content-Type": "text/html" } }).text()
//     )
//     .then((result) => {
//       // Do things with result
//       // console.warn({result});
//       window._result = result
//     });

// };


// await loadReadableStream('./files/ball2.gcode')

export const loadFile = async (path) => {
  const res = (await fetch(path));
  const body = await res.body.getReader().read()

  return await (await fetch(path)).text();
};

export class GcodeParser { //extends Infusible {
  constructor(target) {}

  async loadGcode(path = '', parse = false) {
    return parse ? this.parse(await loadFile(path)) : await loadFile(path);
  }

  groupByCommandType(commands = []) {
    return commands.reduce((acc, curr, i) => {
      return {
        ...acc,
        [curr.command]: acc[curr.command] ? [...acc[curr.command], curr] : [curr],
        count: acc.count + 1
      }

    }, { count: 0 });
  }

  async countLines(gcodeString) {
    return await (gcodeString.match(/\n/g) || []).length
  }


  async parse(gcodeString) {
    console.time('newLines')

    // const newLines = gcodeString.split('\n').length
    const newLines = await this.countLines(gcodeString)


    console.timeEnd('newLines')

    console.log('newLines', newLines)

    return gcodeString.split('\n')
      .filter(_ => !_.trim().startsWith(';'))
      .map((line, index) => line.slice(0, line.indexOf(';')).trim()
        .split(' ')
        .reduce((acc, curr, i) => ({
          ...acc,
          [i === 0 ? 'command' : curr.slice(0, 1).toLowerCase()]: i === 0 ? curr : +curr.slice(1)
        }), { index })
      );
  }
}