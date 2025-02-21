// Get the canvas and its drawing context
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Base logical dimensions for drawing
const logicalWidth = 600;
const logicalHeight = 400;
const dpr = window.devicePixelRatio || 1;
let scaleFactor = 1; // will be updated in resizeCanvas()

// Define the math domain and range for display
const xMin = -Math.PI;
const xMax = Math.PI;
const yMin = -1.5;
const yMax = 1.5;

// Conversion functions work with logical coordinates
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
const L = 1; // Lipschitz constant for sin(x)

// Initial draggable points
let pointA = { x: -1, y: f(-1) };
let pointB = { x: 1, y: f(1) };
let dragging = null;

// Draw the plot and interactive elements
function draw() {
  ctx.clearRect(0, 0, logicalWidth, logicalHeight);

  // Draw axes
  ctx.strokeStyle = "#aaa";
  ctx.lineWidth = 1;
  ctx.beginPath();
  const yZero = toCanvasY(0);
  ctx.moveTo(0, yZero);
  ctx.lineTo(logicalWidth, yZero);
  const xZero = toCanvasX(0);
  ctx.moveTo(xZero, 0);
  ctx.lineTo(xZero, logicalHeight);
  ctx.stroke();

  // Draw the sine curve
  ctx.strokeStyle = "blue";
  ctx.lineWidth = 2;
  ctx.beginPath();
  let first = true;
  for (let i = 0; i <= logicalWidth; i++) {
    const xVal = toMathX(i);
    const yVal = f(xVal);
    const canvasY = toCanvasY(yVal);
    if (first) {
      ctx.moveTo(i, canvasY);
      first = false;
    } else {
      ctx.lineTo(i, canvasY);
    }
  }
  ctx.stroke();

  // Draw red line connecting the two draggable points
  ctx.strokeStyle = "red";
  ctx.lineWidth = 2;
  ctx.beginPath();
  const ax = toCanvasX(pointA.x);
  const ay = toCanvasY(pointA.y);
  const bx = toCanvasX(pointB.x);
  const by = toCanvasY(pointB.y);
  ctx.moveTo(ax, ay);
  ctx.lineTo(bx, by);
  ctx.stroke();

  // Draw the draggable points in green
  ctx.fillStyle = "green";
  [pointA, pointB].forEach(pt => {
    const cx = toCanvasX(pt.x);
    const cy = toCanvasY(pt.y);
    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, 2 * Math.PI);
    ctx.fill();
  });

  // Calculate and display the Lipschitz ratio
  const diffY = Math.abs(pointA.y - pointB.y);
  const diffX = Math.abs(pointA.x - pointB.x);
  const ratio = diffX < 1e-6 ? L.toFixed(3) : (diffY / diffX).toFixed(3);
  ctx.fillStyle = "black";
  ctx.font = "100% Tahoma, Geneva, Verdana, sans-serif";
//   ctx.font = "16px Arial";
  const text = `(|sin(x₁)-sin(x₂)|)/(|x₁-x₂|) = ${ratio} ≤ ${L}`;
  ctx.fillText(text, 10, 20);
}

// Resize canvas and update the drawing scale
function resizeCanvas() {
  const container = document.getElementById("container");
  const containerWidth = container.clientWidth;
  scaleFactor = containerWidth / logicalWidth;
  const newCanvasWidth = containerWidth;
  const newCanvasHeight = logicalHeight * scaleFactor;

  // Set CSS sizes
  canvas.style.width = newCanvasWidth + 'px';
  canvas.style.height = newCanvasHeight + 'px';

  // Set the actual canvas dimensions considering devicePixelRatio
  canvas.width = newCanvasWidth * dpr;
  canvas.height = newCanvasHeight * dpr;

  // Apply transforms: first account for devicePixelRatio, then our logical scale
  ctx.setTransform(dpr * scaleFactor, 0, 0, dpr * scaleFactor, 0, 0);

  draw();
}

window.addEventListener('resize', resizeCanvas);
window.addEventListener('load', resizeCanvas);

// Update the draggable point based on the mouse position
function updatePointFromMouse(e) {
  const rect = canvas.getBoundingClientRect();
  const mouseX = (e.clientX - rect.left) / scaleFactor;
  const x = toMathX(mouseX);
  return { x: x, y: f(x) };
}

// Handle pointer events for dragging points
canvas.addEventListener("pointerdown", function(e) {
  const rect = canvas.getBoundingClientRect();
  const mouseX = (e.clientX - rect.left) / scaleFactor;
  const mouseY = (e.clientY - rect.top) / scaleFactor;
  const distA = Math.hypot(mouseX - toCanvasX(pointA.x), mouseY - toCanvasY(pointA.y));
  const distB = Math.hypot(mouseX - toCanvasX(pointB.x), mouseY - toCanvasY(pointB.y));
    if (distA < distB) {
        dragging = 'A';
    } else {
        dragging = 'B';
    }
});

canvas.addEventListener("pointermove", function(e) {
  if (dragging) {
    const newPt = updatePointFromMouse(e);
    if (dragging === 'A') {
      pointA = newPt;
    } else {
      pointB = newPt;
    }
    draw();
  }
});

canvas.addEventListener("mouseup", () => dragging = null);
canvas.addEventListener("mouseleave", () => dragging = null);
