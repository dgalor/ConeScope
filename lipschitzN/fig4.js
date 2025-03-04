// Global variables for canvas dimensions
let logicalWidth = 600;
let logicalHeight = 400;

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const dpr = window.devicePixelRatio || 1;

// Set up sliders for α and c₂.
const alphaSlider = document.getElementById("alphaSlider");
const alphaValSpan = document.getElementById("alphaVal");
const c2Slider = document.getElementById("c2Slider");
const c2ValSpan = document.getElementById("c2Val");
const infoDiv = document.getElementById("info");

const defaultAlpha = 1;
const defaultC2 = 0.9;
alphaSlider.value = defaultAlpha;
alphaValSpan.textContent = parseFloat(alphaSlider.value).toFixed(2);
c2Slider.value = defaultC2;
c2ValSpan.textContent = parseFloat(c2Slider.value).toFixed(2);

// Domain for plotting: x from 0 to 6, y from -1.5 to 1.5.
const xMin = 0, xMax = 6;
const yMin = -1.5, yMax = 1.5;

// Define function f(x)=sin(x) and its derivative f'(x)=cos(x)
function f(x) {
  return Math.sin(x);
}
function fp(x) {
  return Math.cos(x);
}

// Fixed current iterate x = 3 and descent direction p = -cos(3)
const currentX = 3;
const gradAtX = fp(currentX);
const p = -gradAtX; // p = -cos(3)

// Coordinate conversion functions.
function toCanvasX(x) {
  return ((x - xMin) / (xMax - xMin)) * logicalWidth;
}
function toCanvasY(y) {
  return logicalHeight - ((y - yMin) / (yMax - yMin)) * logicalHeight;
}

// Draw the scene: function, current iterate, candidate point, and arrow.
function drawScene(alpha, c2) {
  // Compute candidate: x_candidate = x + α p = 3 - α*cos(3)
  const candidateX = currentX + alpha * p;
  const candidateGrad = fp(candidateX);
  
  // For the curvature condition (Strong Wolfe):
  // |∇f(x+αp)ᵀp| = |cos(candidateX)·(-cos(3))| = |cos(candidateX)|·|cos(3)|
  // and |∇f(3)ᵀp| = |cos(3)·(-cos(3))| = cos(3)².
  const leftSide = Math.abs(candidateGrad) * Math.abs(gradAtX);
  const rightSide = c2 * Math.abs(gradAtX) * Math.abs(gradAtX);
  const curvatureSatisfied = leftSide <= rightSide;
  
  // Update info text with equations:
  infoDiv.textContent =
    "Curvature Condition (Strong Wolfe):\n" +
    "----------------------------------------\n" +
    "|∇f(x+αp)ᵀ p| = |cos(3 - α·cos(3))·(-cos(3))| = " + leftSide.toFixed(3) + "\n" +
    "≤ c₂|∇f(3)ᵀ p| = c₂·|cos(3)·(-cos(3))| = " + rightSide.toFixed(3) + "\n\n" +
    "Candidate: x = 3 - α·cos(3) = " + candidateX.toFixed(3) +
    "\nCondition " + (curvatureSatisfied ? "Satisfied" : "Violated");
  
  // Clear canvas.
  ctx.clearRect(0, 0, logicalWidth, logicalHeight);

  // Draw coordinate axes.
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

  // Draw function f(x)=sin(x) in blue.
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

  // Draw current iterate as a red circle.
  const curCanvasX = toCanvasX(currentX);
  const curCanvasY = toCanvasY(f(currentX));
  ctx.fillStyle = "red";
  ctx.beginPath();
  ctx.arc(curCanvasX, curCanvasY, 6, 0, 2 * Math.PI);
  ctx.fill();

  // Draw candidate point and arrow.
  const candCanvasX = toCanvasX(candidateX);
  const candCanvasY = toCanvasY(f(candidateX));
  const color = curvatureSatisfied ? "green" : "red";

  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(curCanvasX, curCanvasY);
  ctx.lineTo(candCanvasX, candCanvasY);
  ctx.stroke();

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(candCanvasX, candCanvasY, 6, 0, 2 * Math.PI);
  ctx.fill();

  // Draw an arrowhead at the candidate point.
  drawArrowhead(curCanvasX, curCanvasY, candCanvasX, candCanvasY, color);
}

// Utility function to draw an arrowhead.
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

// Update drawing when slider values change.
function updateScene() {
  const alpha = parseFloat(alphaSlider.value);
  const c2 = parseFloat(c2Slider.value);
  alphaValSpan.textContent = alpha.toFixed(2);
  c2ValSpan.textContent = c2.toFixed(2);
  drawScene(alpha, c2);
}
alphaSlider.addEventListener("input", updateScene);
c2Slider.addEventListener("input", updateScene);

// Resize the canvas to match its container.
function resizeCanvas() {
  // Determine the available width (max 600px as set by CSS).
  const container = document.getElementById("canvasContainer");
  logicalWidth = container.clientWidth;
  logicalHeight = logicalWidth * (400 / 600); // maintain original 3:2 ratio
  
  // Adjust canvas resolution for high DPI displays.
  canvas.width = logicalWidth * dpr;
  canvas.height = logicalHeight * dpr;
  canvas.style.width = logicalWidth + "px";
  canvas.style.height = logicalHeight + "px";
  
  // Reset the transform before scaling.
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);
  
  // Redraw the scene with current slider values.
  updateScene();
}

// Initial setup.
resizeCanvas();
window.addEventListener("resize", resizeCanvas);
