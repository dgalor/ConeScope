document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById('hexCanvas');
    const ctx = canvas.getContext('2d');
    const hexSize = 10; // Radius of each hexagon
    const dotSize = 6; // Radius of each dot
    const decayFactor = 0.01; // Adjust this value as needed
    const linkFactor = 0.1; // Adjust this value as needed
    const chargeRadius = 10; // Radius within which dots will be charged by the mouse
    const mouseChargeStrength = 0.1; // How much the mouse charges the dots

    let mouseX = -1, mouseY = -1; // Store mouse position
    canvas.addEventListener('mousemove', function(event) {
        const rect = canvas.getBoundingClientRect();
        mouseX = event.clientX - rect.left;
        mouseY = event.clientY - rect.top;
    });

    function distance(x1, y1, x2, y2) {
        return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    }
    const xOffset = hexSize * 3 ;
    const yOffset = hexSize * Math.sqrt(3) / 2;

    function drawLines(x, y) {
        //make linewidth small
        ctx.lineWidth = 0.1;
        // draw lines from center to each corner
        let angles = [-Math.PI / 6, Math.PI / 6, Math.PI / 2]
        for (let i = 0; i < angles.length; i++) {
            const angle = angles[i];
            const cornerX = x + hexSize * Math.cos(angle) * 2;
            const cornerY = y + hexSize * Math.sin(angle) * 2;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(cornerX, cornerY);
            ctx.stroke();
        }
    }

    function drawGrid(gridWidth, gridHeight) {
        for (let row = 0; row < gridHeight; row++) {
            for (let col = 0; col < gridWidth; col++) {
                const x = col * xOffset + (row % 2) * xOffset / 2;
                const y = row * yOffset;
                // drawDot(x, y);
                drawLines(x, y);
                
            }
        }
    }

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const gridWidth = Math.ceil(window.innerWidth / xOffset);
        const gridHeight = Math.ceil(window.innerHeight / yOffset);

        drawGrid(gridWidth, gridHeight);
    }

    let dotStates = [];

    function initializeStates(gridWidth, gridHeight) {
        dotStates = [];
        for (let row = 0; row < gridHeight; row++) {
            let rowStates = [];
            for (let col = 0; col < gridWidth; col++) {
                rowStates.push({ brightness: Math.random() }); // Random initial brightness
            }
            dotStates.push(rowStates);
        }
    }

    function getNeighbors(row, col) {
        // Define the neighbor positions in a hexagonal grid
        const offsets = [
            [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0]
        ];
        return offsets.map(offset => {
            const neighborRow = row + offset[0];
            const neighborCol = col + offset[1];
            if (neighborRow >= 0 && neighborRow < dotStates.length &&
                neighborCol >= 0 && neighborCol < dotStates[neighborRow].length) {
                return dotStates[neighborRow][neighborCol];
            }
            return null;
        }).filter(neighbor => neighbor !== null);
    }

    function updateStates() {
        for (let row = 0; row < dotStates.length; row++) {
            for (let col = 0; col < dotStates[row].length; col++) {
                const neighbors = getNeighbors(row, col);
                const averageNeighborState = neighbors.length > 0 
                    ? neighbors.reduce((sum, neighbor) => sum + neighbor.brightness, 0) / neighbors.length 
                    : 0;

                // Update based on decay and link factor
                dotStates[row][col].brightness *= (1 - decayFactor) * (1 - linkFactor); // Decay
                dotStates[row][col].brightness += averageNeighborState * linkFactor; // Influence from neighbors and loss from charging neighbors

                // Ensure brightness remains within bounds [0, 1]
                dotStates[row][col].brightness = Math.min(Math.max(dotStates[row][col].brightness, 0), 1);

                const x = col * xOffset + (row % 2) * xOffset / 2;
                const y = row * yOffset;

                if (distance(x, y, mouseX, mouseY) < chargeRadius) {
                    dotStates[row][col].brightness = Math.min(dotStates[row][col].brightness + mouseChargeStrength, 1); // Charge the dot
                }
            }
        }
    }

    function drawDot(x, y, brightness) {
        if (brightness <= 0) return;
        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.arc(x, y, dotSize * brightness, 0, 2 * Math.PI);
        ctx.fill();
    }

    function drawGrid() {
        for (let row = 0; row < dotStates.length; row++) {
            for (let col = 0; col < dotStates[row].length; col++) {
                const x = col * xOffset + (row % 2) * xOffset / 2;
                const y = row * yOffset;
                drawDot(x, y, dotStates[row][col].brightness);
                drawLines(x, y);
            }
        }
    }

    function drawCursorCircle() {
        if (mouseX !== -1 && mouseY !== -1) {
            ctx.beginPath();
            ctx.arc(mouseX, mouseY, chargeRadius, 0, 2 * Math.PI);
            ctx.stroke(); // You can customize the style of the circle if needed
        }
    }

    function animate() {
        updateStates();
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
        drawGrid();
        drawCursorCircle(); // Draw the circle around the cursor
        requestAnimationFrame(animate);
    }

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const gridWidth = Math.ceil(window.innerWidth / xOffset);
        const gridHeight = Math.ceil(window.innerHeight / yOffset);

        initializeStates(gridWidth, gridHeight);
        drawGrid();
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    requestAnimationFrame(animate); // Start the animation loop
});
