const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Original logical dimensions for drawing (aspect ratio 3:2)
let logicalWidth = 600, logicalHeight = 400;
    
// Setup sliders and info text
const alphaSlider = document.getElementById("alphaSlider");
const alphaValSpan = document.getElementById("alphaVal");
const cSlider = document.getElementById("cSlider");
const cValSpan = document.getElementById("cVal");
const infoDiv = document.getElementById("info");

// Set default slider values
const defaultAlpha = 1;
const defaultC = 0.5;
alphaSlider.value = defaultAlpha;
alphaValSpan.textContent = parseFloat(alphaSlider.value).toFixed(2);
cSlider.value = defaultC;
cValSpan.textContent = parseFloat(cSlider.value).toFixed(2);

// Function definitions: f(x) = sin(x) and f'(x) = cos(x)
function f(x) {
  return Math.sin(x);
}
function fp(x) {
  return Math.cos(x);
}

// Fixed current iterate and derivative value
const currentX = 3;
const gradAtX = fp(currentX);

// Domain for plotting: x from 0 to 6, y from -1.5 to 1.5
const xMin = 0, xMax = 6;
const yMin = -1.5, yMax = 1.5;

// Coordinate conversion functions
function toCanvasX(x) {
  return ((x - xMin) / (xMax - xMin)) * logicalWidth;
}
function toCanvasY(y) {
  return logicalHeight - ((y - yMin) / (yMax - yMin)) * logicalHeight;
}

// Draw the scene: function, current iterate, candidate point, and arrow.
function drawScene(alpha, c) {
  // Compute candidate: x_candidate = xₖ - α f'(xₖ)
  const candidateX = currentX - alpha * gradAtX;
  
  // Armijo condition: f(candidate) ≤ f(xₖ) - cα[f'(xₖ)]²
  const armijoCondition = f(candidateX) <= f(currentX) - c * alpha * gradAtX * gradAtX;
  
  // Update info text
  infoDiv.textContent = `xₖ = ${currentX.toFixed(2)}, f(xₖ) = ${f(currentX).toFixed(2)}; Candidate x = ${candidateX.toFixed(2)} ${armijoCondition ? "(Acceptable)" : "(Armijo violated!)"}`;

  // Clear canvas
  ctx.clearRect(0, 0, logicalWidth, logicalHeight);

  // Draw coordinate axes
  ctx.strokeStyle = "#aaa";
  ctx.lineWidth = 1;
  ctx.beginPath();
  let yAxisZero = toCanvasY(0);
  ctx.moveTo(0, yAxisZero);
  ctx.lineTo(logicalWidth, yAxisZero);
  let xAxisZero = toCanvasX(0);
  ctx.moveTo(xAxisZero, 0);
  ctx.lineTo(xAxisZero, logicalHeight);
  ctx.stroke();

  // Draw function f(x) = sin(x)
  ctx.strokeStyle = "blue";
  ctx.lineWidth = 2;
  ctx.beginPath();
  let first = true;
  for (let i = 0; i <= logicalWidth; i++) {
    let xVal = xMin + (i / logicalWidth) * (xMax - xMin);
    let yVal = f(xVal);
    let cx = toCanvasX(xVal);
    let cy = toCanvasY(yVal);
    if (first) {
      ctx.moveTo(cx, cy);
      first = false;
    } else {
      ctx.lineTo(cx, cy);
    }
  }
  ctx.stroke();

  // Draw current iterate as a red circle
  const curCanvasX = toCanvasX(currentX);
  const curCanvasY = toCanvasY(f(currentX));
  ctx.fillStyle = "red";
  ctx.beginPath();
  ctx.arc(curCanvasX, curCanvasY, 6, 0, 2 * Math.PI);
  ctx.fill();

  // Draw candidate point and arrow
  const candCanvasX = toCanvasX(candidateX);
  const candCanvasY = toCanvasY(f(candidateX));
  ctx.strokeStyle = armijoCondition ? "green" : "red";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(curCanvasX, curCanvasY);
  ctx.lineTo(candCanvasX, candCanvasY);
  ctx.stroke();
  ctx.fillStyle = armijoCondition ? "green" : "red";
  ctx.beginPath();
  ctx.arc(candCanvasX, candCanvasY, 6, 0, 2 * Math.PI);
  ctx.fill();

  // Draw arrowhead at candidate point
  drawArrowhead(curCanvasX, curCanvasY, candCanvasX, candCanvasY, armijoCondition ? "green" : "red");
}

// Utility: Draw an arrowhead from (x1, y1) to (x2, y2)
function drawArrowhead(x1, y1, x2, y2, color) {
  const headLength = 10;
  const angle = Math.atan2(y2 - y1, x2 - x1);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - headLength * Math.cos(angle - Math.PI / 6),
             y2 - headLength * Math.sin(angle - Math.PI / 6));
  ctx.lineTo(x2 - headLength * Math.cos(angle + Math.PI / 6),
             y2 - headLength * Math.sin(angle + Math.PI / 6));
  ctx.closePath();
  ctx.fill();
}

// Update drawing when sliders change
function updateScene() {
  const alpha = parseFloat(alphaSlider.value);
  const c = parseFloat(cSlider.value);
  alphaValSpan.textContent = alpha.toFixed(2);
  cValSpan.textContent = c.toFixed(2);
  drawScene(alpha, c);
}
alphaSlider.addEventListener("input", updateScene);
cSlider.addEventListener("input", updateScene);

// Resize canvas based on container width, maintaining the aspect ratio
function resizeCanvas() {
  const container = document.querySelector(".canvas-container");
  const containerWidth = container.clientWidth;
  // Maintain a 3:2 aspect ratio
  const containerHeight = containerWidth * (logicalHeight / logicalWidth);

  // Set logical dimensions
  logicalWidth = 600;
  logicalHeight = 400;

  // Set the canvas CSS size
  canvas.style.width = containerWidth + "px";
  canvas.style.height = containerHeight + "px";

  // Adjust the internal resolution based on devicePixelRatio
  const dpr = window.devicePixelRatio || 1;
  canvas.width = containerWidth * dpr;
  canvas.height = containerHeight * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  // Redraw scene with current slider values
  updateScene();
}

// Call resize on load and when window is resized
window.addEventListener("load", resizeCanvas);
window.addEventListener("resize", resizeCanvas);

// Initial drawing (in case resize hasn't been triggered)
updateScene();
