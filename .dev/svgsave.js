const download = (href, name) =>{
  const link = document.createElement('a');
  link.download = name;
  link.style.opacity = "0";
  document.body.append(link);
  link.href = href;
  link.click();
  link.remove();
}

function gcd(srcWidth, srcHeight, ratio) {
  var ratio = Math.min(ratio / srcWidth, ratio / srcHeight);
  return { width: srcWidth * ratio, height: srcHeight * ratio };
}

export function SVGPNG(svg, cb) {
  let img = document.createElement("img");
  let url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
  img.src = url;
  img.setAttribute("style", "position:fixed;left:-200vw;");

console.log('url', url)  
  // img.onload = function onload() {
    let canvas = document.createElement("canvas");
    let ctx = canvas.getContext("2d");
    let { width, height } = gcd(
      img.width,
      img.height,
      document.querySelector("#ratio")?.value || Math.min(img.width, img.height)
    );
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(img, 0, 0, width, height);
    let src = canvas.toDataURL("image/png");
    cb(src, canvas, img);
    download(src, 'fuk.png')
    // img.remove();
    // URL.revokeObjectURL(url);
  // };
  document.body.appendChild(img);
}

function onPaste(e) {
  document.getElementById("output").value = "";
  SVGPNG(document.getElementById("input").value, (src) => {
    document.querySelector("#preview").src = src;
    document.getElementById("output").value = src;
    document.querySelector(".preview").style.backgroundImage = `url('${src}')`;
  });
}

// document.getElementById("input").addEventListener("input", onPaste);
// document.getElementById("ratio").addEventListener("input", onPaste);
