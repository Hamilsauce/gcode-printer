

const zoomIn = (svg) => {
  const viewBox = svg.viewBox.baseVal;
  
  viewBox.x = viewBox.x + (viewBox.width / 4);
  viewBox.y = viewBox.y + (viewBox.height / 4);
  viewBox.width = (viewBox.width / 2);
  viewBox.height = (viewBox.height / 2);
}

const zoomOut = (svg) => {
  const viewBox = svg.viewBox.baseVal;
  
  viewBox.x = viewBox.x - viewBox.width / 2;
  viewBox.y = viewBox.y - viewBox.height / 2;
  viewBox.width = viewBox.width * 2;
  viewBox.height = viewBox.height * 2;
}

export const zoom = {
  in: zoomIn,
  out: zoomOut,
}