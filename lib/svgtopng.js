import ham from 'https://hamilsauce.github.io/hamhelper/hamhelper1.0.0.js';
const { template, utils, download } = ham;


const rotateHue = (ctx, i) => {
  const roto = (Math.random() / 1) * 360;

  ctx.filter = `hue-rotate(${roto}deg)`;
};


const loadImage = (url) => new Promise((resolve, reject) => {
  const img = new Image(); // alt: document.createElement('img')
  img.addEventListener('load', () => resolve(img));
  img.addEventListener('error', (err) => reject(err));
  img.src = url;
});


const downloadBtn = document.querySelector('#save-image');


// img.src = './ham.png';


// img.onload = function() {
//   // ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
//   // const data = canvas.toDataURL('image/png');

//   // setTimeout(() => {
//   //   download('ham2.png', data)
//   //   console.log(' ', );
//   // }, 1000)

//   // if (!window.open(data)) {
//   //   document.location.href = data;
//   // }
// }

let timesRan = 0;
let cnt = 0;
console.log({ svg: window.location.href });

function gcd(srcWidth, srcHeight, ratio) {
  var ratio = Math.min(ratio / srcWidth, ratio / srcHeight);
  return { width: srcWidth * ratio, height: srcHeight * ratio };
}



downloadBtn.addEventListener('click', async (e) => {

  const canvas = document.querySelector('canvas');
  const svg = document.querySelector('svg');
  const scene = document.querySelector('#scene');
  const img = document.createElement('img');
  const ctx = canvas.getContext ? canvas.getContext('2d') : null;
  // const { width, height } = svg.getBoundingClientRect()
  // const { width, height } = svg.getBBox()
  // let { width, height } = gcd(
  //   svg.getBoundingClientRect().width,
  //   svg.getBoundingClientRect().height,
  //   Math.min(svg.getBoundingClientRect().width, svg.getBoundingClientRect().height)
  // );
  const width = 412 * 6
  const height = 600 * 6

  console.log('width, height', width, height)

  canvas.width = width
  canvas.height = height
  img.height = height
  img.width = width
  // console.log('width', width)
  // console.log(img.width);

  const svgStr = svg.outerHTML;

  var svgData = new Blob([svgStr], { type: 'image/svg+xml' });
  var DOMURL = window.URL || window.webkitURL || window;
  var b64str = DOMURL.createObjectURL(svgData);
  console.log('b64str', b64str)

  var _img = await loadImage(b64str);
  var imgH = _img.naturalHeight; // original file height
  var imgW = _img.naturalWidth; // original file width
  console.log('_img', _img)
  ctx.drawImage(_img, 0, 0, Math.round(width), Math.round(height));



  for (var i = 0; i < 1; i++) {
    ctx.drawImage(_img, 0, 0, canvas.width, canvas.height);
    const data = canvas.toDataURL('image/svg');
    rotateHue(ctx);
    const link = document.createElement('a');
    link.download = `ham${cnt}.png`;
    link.href = canvas.toDataURL();
    // console.log('link.href', link.href)
    link.click();
    link.delete;
    cnt++
  }


  const handle = setInterval(() => {
    if (cnt < 1) {
      downloadBtn.click()

    }
    else {
      clearInterval(handle)
    }
    console.log(' ', );
  }, 5000)
});