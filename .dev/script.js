import { GcodeParser, loadFile } from './gcode-parser.js';
const app = document.querySelector('#app');
const appBody = document.querySelector('#app-body')
const containers = document.querySelectorAll('.container')
const list = document.querySelector('#list');

const parser = new GcodeParser()

const rawGcode = await loadFile('./whistle.gcode')
console.log('rawGcode', rawGcode)


const gcodeItemEls = [...document.querySelectorAll('.gcode.item')]
const labelEls = [...document.querySelectorAll('.label')]
// console.log('gcodeItemEls', gcodeItemEls[0].textContent)


const gcodes = gcodeItemEls.map(item => {
  return {
    code: item.querySelector('h2').textContent.split(' - ')[0],
    command: item.querySelector('h2').textContent.split(' - ')[1],
    description: item.querySelector('p').textContent,
  }
})

// console.log('gcodes', gcodes)

const labels = labelEls.map(label => {
  const tooltip = label.querySelector('[data-toggle="tooltip"]')



  return tooltip ? {
    title: tooltip.title || null,
    content: tooltip.textContent || null,
  } : {
    title: label.title || null,
    content: label.textContent || null,
  }
});

// console.log('gcodeItemEls', gcodeItemEls)
list.innerHTML = ''
gcodes.forEach((code, i) => {
  const item = document.createElement('div');
  item.classList.add('code-item')
  item.innerHTML = `
  <h3>${code.code}</h3>
  <div>${code.command}</div>
  <div>${code.description}</div>
  `;

  list.append(item);
});