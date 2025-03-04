const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// These variables will be updated on resize.
let logicalWidth = 600, logicalHeight = 400;
const aspectRatio = logicalHeight / logicalWidth;
const dpr = window.devicePixelRatio || 1;

// Domain and range for plotting remain unchanged.
const xMin = -Math.PI, xMax = Math.PI;
const yMin = -1.5, yMax = 1.5;

// Coordinate conversion functions.
function toCanvasX(x) {
  return ((x - xMin) / (xMax - xMin)) * logicalWidth;
}
function toCanvasY(y) {
  return logicalHeight - ((y - yMin) / (yMax - yMin)) * logicalHeight;
}
function toMathX(canvasX) {
  return xMin + (canvasX / logicalWidth) * (xMax - xMin);
}

// Our function: f(x) = sin(x)
function f(x) {
  return Math.sin(x);
}

// Lipschitz constant (will be updated via slider)
let L = parseFloat(document.getElementById("slopeSlider").value);

// Draggable apex on the curve for the cone
let apex = { x: 0, y: f(0) };
let dragging = false;

// Resize the canvas based on container size.
function resizeCanvas() {
  const container = document.getElementById("container");
  logicalWidth = container.clientWidth;
  logicalHeight = logicalWidth * aspectRatio;
  canvas.width = logicalWidth * dpr;
  canvas.height = logicalHeight * dpr;
  canvas.style.width = logicalWidth + "px";
  canvas.style.height = logicalHeight + "px";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // Reset transform and scale for dpr
  draw();
}
window.addEventListener("resize", resizeCanvas);

// Draw the entire scene
function draw() {
  // Clear canvas
  ctx.clearRect(0, 0, logicalWidth, logicalHeight);

  // Draw coordinate axes
  ctx.strokeStyle = "#aaa";
  ctx.lineWidth = 1;
  ctx.beginPath();
  // x-axis
  let yZero = toCanvasY(0);
  ctx.moveTo(0, yZero);
  ctx.lineTo(logicalWidth, yZero);
  // y-axis
  let xZero = toCanvasX(0);
  ctx.moveTo(xZero, 0);
  ctx.lineTo(xZero, logicalHeight);
  ctx.stroke();

  // Draw sine function in blue
  ctx.strokeStyle = "blue";
  ctx.lineWidth = 2;
  ctx.beginPath();
  let first = true;
  for (let i = 0; i <= logicalWidth; i++) {
    let xVal = toMathX(i);
    let yVal = f(xVal);
    let canvasY = toCanvasY(yVal);
    if (first) {
      ctx.moveTo(i, canvasY);
      first = false;
    } else {
      ctx.lineTo(i, canvasY);
    }
  }
  ctx.stroke();

  // Draw Lipschitz cone boundaries (dashed red lines)
  ctx.strokeStyle = "red";
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  // Upper boundary: y = f(apex.x) + L*(x - apex.x)
  let startX = xMin;
  let endX   = xMax;
  let yStartUpper = apex.y + L * (startX - apex.x);
  let yEndUpper   = apex.y + L * (endX - apex.x);
  ctx.moveTo(toCanvasX(startX), toCanvasY(yStartUpper));
  ctx.lineTo(toCanvasX(endX), toCanvasY(yEndUpper));
  // Lower boundary: y = f(apex.x) - L*(x - apex.x)
  ctx.moveTo(toCanvasX(startX), toCanvasY(apex.y - L * (startX - apex.x)));
  ctx.lineTo(toCanvasX(endX), toCanvasY(apex.y - L * (endX - apex.x)));
  ctx.stroke();
  ctx.setLineDash([]);

  // Draw the apex point as a black circle
  ctx.fillStyle = "black";
  let cx = toCanvasX(apex.x);
  let cy = toCanvasY(apex.y);
  ctx.beginPath();
  ctx.arc(cx, cy, 6, 0, 2 * Math.PI);
  ctx.fill();
}

// Update apex based on mouse/touch event (forcing it to lie on the curve)
function updateApex(e) {
  const rect = canvas.getBoundingClientRect();
  // Support both mouse and touch events.
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const mouseX = clientX - rect.left;
  let x = toMathX(mouseX);
  apex = { x: x, y: f(x) };
}

// Mouse event listeners for dragging the apex
canvas.addEventListener("mousedown", (e) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;
  const dist = Math.hypot(mouseX - toCanvasX(apex.x), mouseY - toCanvasY(apex.y));
  // if (dist < 10) {  // within 10 pixels
  //   dragging = true;
  // }
  // instead of 10 pixels do relative to the canvas size
  if (dist < logicalWidth * 0.1) {  // within 10% of the canvas width
    dragging = true;
  }
});
canvas.addEventListener("mousemove", (e) => {
  if (dragging) {
    updateApex(e);
    draw();
  }
});
canvas.addEventListener("mouseup", () => { dragging = false; });
canvas.addEventListener("mouseleave", () => { dragging = false; });

// Touch event listeners for mobile devices
canvas.addEventListener("touchstart", (e) => {
  const rect = canvas.getBoundingClientRect();
  const touchX = e.touches[0].clientX - rect.left;
  const touchY = e.touches[0].clientY - rect.top;
  const dist = Math.hypot(touchX - toCanvasX(apex.x), touchY - toCanvasY(apex.y));
  // if (dist < 10) {
  //   dragging = true;
  //   e.preventDefault();
  // }
  // instead of 10 pixels do relative to the canvas size
  if (dist < logicalWidth * 0.1) {  // within 10% of the canvas width
    dragging = true;
    e.preventDefault();
  }
});
canvas.addEventListener("touchmove", (e) => {
  if (dragging) {
    updateApex(e);
    draw();
    e.preventDefault();
  }
});
canvas.addEventListener("touchend", () => { dragging = false; });

// Slider to adjust L
const slopeSlider = document.getElementById("slopeSlider");
const slopeVal = document.getElementById("slopeVal");
slopeSlider.addEventListener("input", () => {
  L = parseFloat(slopeSlider.value);
  slopeVal.textContent = L.toFixed(2);
  draw();
});

// Initial setup
resizeCanvas();