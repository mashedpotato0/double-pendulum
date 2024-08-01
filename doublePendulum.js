const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Initial parameters
let g = parseFloat(document.getElementById('gSlider').value);
let airResistance = parseFloat(document.getElementById('airResistanceSlider').value);
let n = parseInt(document.getElementById('numPendulumsSlider').value);
let angle = parseFloat(document.getElementById('initialAngleSlider').value);
let pendulums = [];

let lastDrawMass = document.getElementById('drawMassCheckbox').checked;
let lastDrawBars = document.getElementById('drawBarsCheckbox').checked;
let lastLength1 = parseFloat(document.getElementById('length1Slider').value);
let lastLength2 = parseFloat(document.getElementById('length2Slider').value);
let lastMass1 = parseFloat(document.getElementById('mass1Slider').value);
let lastMass2 = parseFloat(document.getElementById('mass2Slider').value);
let lastAngle = parseFloat(document.getElementById('initialAngleSlider').value);
let maxPathLength = parseInt(document.getElementById('pathLengthSlider').value);



document.getElementById('drawMassCheckbox').addEventListener('change', updateDrawingOptions);
document.getElementById('drawBarsCheckbox').addEventListener('change', updateDrawingOptions);

function updateDrawingOptions() {
    const drawMass = document.getElementById('drawMassCheckbox').checked;
    const drawBars = document.getElementById('drawBarsCheckbox').checked;

    if (drawMass !== lastDrawMass || drawBars !== lastDrawBars) {
        pendulums.forEach(pendulum => {
            pendulum.drawmass = drawMass;
            pendulum.drawbars = drawBars;
        });
        lastDrawMass = drawMass;
        lastDrawBars = drawBars;
    }
}

function updateParameters() {
    const length1 = parseFloat(document.getElementById('length1Slider').value);
    const length2 = parseFloat(document.getElementById('length2Slider').value);
    const mass1 = parseFloat(document.getElementById('mass1Slider').value);
    const mass2 = parseFloat(document.getElementById('mass2Slider').value);
    const angle = parseFloat(document.getElementById('initialAngleSlider').value);

    let updated = false;

    if (length1 !== lastLength1 || length2 !== lastLength2 ||
        mass1 !== lastMass1 || mass2 !== lastMass2 ||
        angle !== lastAngle) {
            lastLength1 = length1;
            lastLength2 = length2;
            lastMass1 = mass1;
            lastMass2 = mass2;
            lastAngle = angle;
            pendulums.forEach(pendulum => {
                pendulum.update(length1, length2, mass1, mass2);
            });
            updated = true;
    }

    if (updated) {
        updateDrawingOptions();
    }
}



class Pendulum {
    constructor(length1, length2, mass1, mass2, angle1, angle2, angle1Vel, angle2Vel, color, drawmass, drawbars) {
        this.length1 = length1;
        this.length2 = length2;
        this.mass1 = mass1;
        this.mass2 = mass2;
        this.angle1 = angle1;
        this.angle2 = angle2;
        this.angle1Vel = angle1Vel;
        this.angle2Vel = angle2Vel;
        this.color = color;
        this.drawmass = drawmass;
        this.drawbars = drawbars;
        this.path = [];
        this.maxPathLength = maxPathLength;
    }

    update(length1, length2, mass1, mass2) {
        this.length1 = length1;
        this.length2 = length2;
        this.mass1 = mass1;
        this.mass2 = mass2;
    }

    draw() {
        const x1 = this.length1 * Math.sin(this.angle1) + canvas.width / 2;
        const y1 = this.length1 * Math.cos(this.angle1) + canvas.height / 2;
        const x2 = x1 + this.length2 * Math.sin(this.angle2);
        const y2 = y1 + this.length2 * Math.cos(this.angle2);

        if (this.path.length > 0) {
            ctx.beginPath();
            ctx.moveTo(this.path[0].x, this.path[0].y);
            for (let i = 1; i < this.path.length; i++) {
                ctx.lineTo(this.path[i].x, this.path[i].y);
            }
            ctx.strokeStyle = this.color;
            ctx.stroke();
        }

        if (this.drawbars) {
            ctx.strokeStyle = this.color;
            ctx.beginPath();
            ctx.moveTo(canvas.width / 2, canvas.height / 2);
            ctx.lineTo(x1, y1);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        }

        if (this.drawmass) {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(x1, y1, this.mass1, 0, Math.PI * 2);
            ctx.fill();

            ctx.beginPath();
            ctx.arc(x2, y2, this.mass2, 0, Math.PI * 2);
            ctx.fill();
        }

        this.path.push({ x: x2, y: y2 });
        if (this.path.length > this.maxPathLength) {
            this.path.shift();
        }
    }

    rungeKuttaStep(dt) {
        const k1 = this.getDerivatives(this.angle1, this.angle2, this.angle1Vel, this.angle2Vel);
        const k2 = this.getDerivatives(
            this.angle1 + 0.5 * dt * k1.angle1Vel,
            this.angle2 + 0.5 * dt * k1.angle2Vel,
            this.angle1Vel + 0.5 * dt * k1.angle1Acc,
            this.angle2Vel + 0.5 * dt * k1.angle2Acc
        );
        const k3 = this.getDerivatives(
            this.angle1 + 0.5 * dt * k2.angle1Vel,
            this.angle2 + 0.5 * dt * k2.angle2Vel,
            this.angle1Vel + 0.5 * dt * k2.angle1Acc,
            this.angle2Vel + 0.5 * dt * k2.angle2Acc
        );
        const k4 = this.getDerivatives(
            this.angle1 + dt * k3.angle1Vel,
            this.angle2 + dt * k3.angle2Vel,
            this.angle1Vel + dt * k3.angle1Acc,
            this.angle2Vel + dt * k3.angle2Acc
        );

        this.angle1 += (dt / 6) * (k1.angle1Vel + 2 * k2.angle1Vel + 2 * k3.angle1Vel + k4.angle1Vel);
        this.angle2 += (dt / 6) * (k1.angle2Vel + 2 * k2.angle2Vel + 2 * k3.angle2Vel + k4.angle2Vel);
        this.angle1Vel += (dt / 6) * (k1.angle1Acc + 2 * k2.angle1Acc + 2 * k3.angle1Acc + k4.angle1Acc);
        this.angle2Vel += (dt / 6) * (k1.angle2Acc + 2 * k2.angle2Acc + 2 * k3.angle2Acc + k4.angle2Acc);
    }

    getDerivatives(angle1, angle2, angle1Vel, angle2Vel) {
        const num1 = -g * (2 * this.mass1 + this.mass2) * Math.sin(angle1);
        const num2 = -this.mass2 * g * Math.sin(angle1 - 2 * angle2);
        const num3 = -2 * Math.sin(angle1 - angle2) * this.mass2;
        const num4 = angle2Vel ** 2 * this.length2 + angle1Vel ** 2 * this.length1 * Math.cos(angle1 - angle2);
        const den = this.length1 * (2 * this.mass1 + this.mass2 - this.mass2 * Math.cos(2 * angle1 - 2 * angle2));
        const angle1Acc = (num1 + num2 + num3 * num4) / den;

        const num5 = 2 * Math.sin(angle1 - angle2);
        const num6 = angle1Vel ** 2 * this.length1 * (this.mass1 + this.mass2);
        const num7 = g * (this.mass1 + this.mass2) * Math.cos(angle1);
        const num8 = angle2Vel ** 2 * this.length2 * this.mass2 * Math.cos(angle1 - angle2);
        const angle2Acc = (num5 * (num6 + num7 + num8)) / den;

        return { angle1Vel, angle2Vel, angle1Acc, angle2Acc };
    }
}




function createPendulums() {
    const drawMass = document.getElementById('drawMassCheckbox').checked;
    const drawBars = document.getElementById('drawBarsCheckbox').checked;
    pendulums = Array.from({ length: n }, (_, i) => {
        const hue = (n - i / n) * 360;
        return new Pendulum(
            parseFloat(document.getElementById('length1Slider').value),
            parseFloat(document.getElementById('length2Slider').value),
            parseFloat(document.getElementById('mass1Slider').value),
            parseFloat(document.getElementById('mass2Slider').value),
            angle * Math.PI/180,
            angle * Math.PI/180 + (i + 1) / 100000,
            0,
            0,
            `hsl(${hue}, 100%, 50%)`,
            drawMass,
            drawBars
        );
    });
}

function updateParameters() {
    g = parseFloat(document.getElementById('gSlider').value);
    airResistance = parseFloat(document.getElementById('airResistanceSlider').value);
    n = parseInt(document.getElementById('numPendulumsSlider').value);
    angle = parseFloat(document.getElementById('initialAngleSlider').value);
    createPendulums();
}

document.getElementById('length1Slider').addEventListener('input', (e) => {
    document.getElementById('length1Value').textContent = e.target.value;
    updateParameters();
});
document.getElementById('length2Slider').addEventListener('input', (e) => {
    document.getElementById('length2Value').textContent = e.target.value;
    updateParameters();
});
document.getElementById('mass1Slider').addEventListener('input', (e) => {
    document.getElementById('mass1Value').textContent = e.target.value;
    updateParameters();
});
document.getElementById('mass2Slider').addEventListener('input', (e) => {
    document.getElementById('mass2Value').textContent = e.target.value;
    updateParameters();
});
document.getElementById('numPendulumsSlider').addEventListener('input', (e) => {
    document.getElementById('numPendulumsValue').textContent = e.target.value;
    updateParameters();
});
document.getElementById('gSlider').addEventListener('input', (e) => {
    document.getElementById('gValue').textContent = e.target.value;
    g = parseFloat(e.target.value);
});
document.getElementById('airResistanceSlider').addEventListener('input', (e) => {
    document.getElementById('airResistanceValue').textContent = e.target.value;
    airResistance = parseFloat(e.target.value);
});
document.getElementById('initialAngleSlider').addEventListener('input', (e) => {
    document.getElementById('initialAngleValue').textContent = e.target.value;
    angle = parseFloat(e.target.value);
    updateParameters();
});
document.getElementById('pathLengthSlider').addEventListener('input', (e) => {
    document.getElementById('pathLengthValue').textContent = e.target.value;
    maxPathLength = parseInt(e.target.value);
    updatePathLengths();
});


function updatePathLengths() {
    pendulums.forEach(pendulum => {
        pendulum.maxPathLength = maxPathLength;
        while (pendulum.path.length > maxPathLength) {
            pendulum.path.shift();
        }
    });
}


const targetFPS = 60;
const frameInterval = 1000 / targetFPS;

let lastTime = 0;
let isPaused = false;

function animate(timestamp) {
    if (!isPaused) {
        const deltaTime = timestamp - lastTime;
        if (deltaTime >= frameInterval) {
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            updateDrawingOptions();

            pendulums.forEach(pendulum => {
                pendulum.draw();
                pendulum.rungeKuttaStep(0.1);
            });

            lastTime = timestamp - (deltaTime % frameInterval);
        }
    }
    requestAnimationFrame(animate);
}

createPendulums();
requestAnimationFrame(animate);

document.getElementById('startButton').addEventListener('click', () => {
    isPaused = false;
    requestAnimationFrame(animate);
});

document.getElementById('pauseButton').addEventListener('click', () => {
    isPaused = true;
});

document.getElementById('resetButton').addEventListener('click', () => {
    isPaused = true;
    createPendulums();
    lastTime = 0;
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
});
