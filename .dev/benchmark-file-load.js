import { fetchFile } from '../lib/utils.js';

const benchmark = async (label = 'BENCHMARK TIME', fn) => {
  console.time(label);
  
  const result = await fn();

  const lines = result.split('\n')

  console.timeEnd(label);

  return lines;
};

const filename = 'recorder'


const file = await benchmark('fetch gcode', async () => fetchFile(`../files/${filename}.gcode`))

// console.log('file', {file})