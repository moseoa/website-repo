
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
gradient.addColorStop(0, '#888888');
gradient.addColorStop(0.5, '#cccccc');
gradient.addColorStop(1, '#888888');

class Particle {
    constructor(effect, x, y, brightness) {
        this.effect = effect;
        // Start very close to the target position
        const offsetAngle = Math.random() * Math.PI * 2;
        const offsetDistance = Math.random() * 15 + 3;
        this.x = x + Math.cos(offsetAngle) * offsetDistance;
        this.y = y + Math.sin(offsetAngle) * offsetDistance;
        this.color = '#999999';
        
        // Target position to fly to
        this.targetX = x;
        this.targetY = y;
        
        // Brightness determines which character to use (0-1 range)
        this.targetBrightness = brightness;
        this.brightness = brightness;

        this.size = this.effect.gap;
        this.dx = 0;
        this.dy = 0;
        this.vx = 0;
        this.vy = 0;
        this.force = 0;
        this.angle = 0;
        this.distance = 0;
        this.friction = 0.7;
        this.ease = 0.25;
        this.settled = false;

        // Character palette ordered from light to dark
        this.charPalette = ' .\',:;!*+|%S#@';
        this.char = this.getCharForBrightness(brightness);
    }

    getCharForBrightness(brightness) {
        // Map brightness (0-1) to character palette
        const index = Math.floor(brightness * (this.charPalette.length - 1));
        return this.charPalette[Math.max(0, Math.min(index, this.charPalette.length - 1))];
    }

    update() {
        this.dx = this.targetX - this.x;
        this.dy = this.targetY - this.y;
        this.distance = this.dx * this.dx + this.dy * this.dy;
        
        // Smooth brightness transition
        const brightnessDiff = this.targetBrightness - this.brightness;
        this.brightness += brightnessDiff * 0.15;
        
        // If very close to target, stop moving
        if (this.distance < 4) {
            this.settled = true;
            this.x = this.targetX;
            this.y = this.targetY;
            this.brightness = this.targetBrightness;
            this.vx = 0;
            this.vy = 0;
            return;
        }
        
        this.force = -this.effect.mouse.radius / (this.distance + 1);

        if (this.distance < this.effect.mouse.radius) {
            this.angle = Math.atan2(this.dy, this.dx);
            this.vx += this.force * Math.cos(this.angle);
            this.vy += this.force * Math.sin(this.angle);
        }

        this.x += (this.dx * this.ease) + (this.vx * this.friction);
        this.y += (this.dy * this.ease) + (this.vy * this.friction);
    }

    draw() {
        this.char = this.getCharForBrightness(this.brightness);
        this.effect.context.fillStyle = this.color;
        this.effect.context.font = this.size + 'px monospace';
        this.effect.context.fillText(this.char, this.x, this.y);
    }
}

class Effect {
    constructor(context, canvasWidth, canvasHeight) {
        this.context = context;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.textX = this.canvasWidth / 2;
        this.textY = this.canvasHeight / 2;
        this.fontSize = 100;
        this.gap = 6;

        this.particles = [];
        this.mouse = {
            radius: 20000,
            x: 0,
            y: 0
        }

        window.addEventListener('mousemove', e => {
            this.mouse.x = e.x;
            this.mouse.y = e.y;
        });

        // Content to cycle through (words and shapes)
        this.shapes = [
            { type: 'text', value: 'DOG' },
            { type: 'shape', value: 'dog' },
            { type: 'text', value: 'CAT' },
            { type: 'shape', value: 'cat' },
            { type: 'text', value: 'HEART' },
            { type: 'shape', value: 'heart' },
            { type: 'text', value: 'STAR' },
            { type: 'shape', value: 'star' }
        ];
        this.currentShapeIndex = 0;
        this.lastMorphTime = 0;
        this.morphInterval = 3000; // ms
    }

    // Convert text to coordinate map
    getCoordinates(text) {
        const offCtx = document.createElement('canvas').getContext('2d');
        offCtx.canvas.width = this.canvasWidth;
        offCtx.canvas.height = this.canvasHeight;

        offCtx.fillStyle = 'white';
        offCtx.font = 'bold ' + this.fontSize + 'px monospace';
        offCtx.textAlign = 'center';
        offCtx.textBaseline = 'middle';
        offCtx.fillText(text, this.textX, this.textY);

        const imageData = offCtx.getImageData(0, 0, this.canvasWidth, this.canvasHeight);
        const pixels = imageData.data;
        const coordinates = [];

        // First pass: collect all coordinates
        for (let y = 0; y < this.canvasHeight; y += this.gap) {
            for (let x = 0; x < this.canvasWidth; x += this.gap) {
                const index = (y * this.canvasWidth + x) * 4;
                const alpha = pixels[index + 3];
                if (alpha > 0) {
                    // Map alpha to brightness (0-1, with edges darker)
                    const brightness = Math.min(1, alpha / 255 * 0.8);
                    coordinates.push({ x, y, brightness });
                }
            }
        }
        return coordinates;
    }

    // Draw shapes and extract coordinates
    drawShape(offCtx, shapeName) {
        const cw = this.canvasWidth;
        const ch = this.canvasHeight;
        const cx = cw / 2;
        const cy = ch / 2;
        const scale = 120;

        offCtx.fillStyle = 'white';
        offCtx.strokeStyle = 'white';
        offCtx.lineWidth = 2;

        switch (shapeName) {
            case 'dog':
                // Detailed dog with more features
                // Body
                offCtx.beginPath();
                offCtx.ellipse(cx + 20, cy, scale * 1.2, scale * 0.8, 0, 0, Math.PI * 2);
                offCtx.fill();
                // Head
                offCtx.beginPath();
                offCtx.arc(cx - scale * 0.6, cy - scale * 0.7, scale * 0.5, 0, Math.PI * 2);
                offCtx.fill();
                // Snout
                offCtx.beginPath();
                offCtx.ellipse(cx - scale * 0.9, cy - scale * 0.4, scale * 0.3, scale * 0.25, 0, 0, Math.PI * 2);
                offCtx.fill();
                // Ears - left
                offCtx.beginPath();
                offCtx.ellipse(cx - scale * 1.0, cy - scale * 1.2, scale * 0.3, scale * 0.5, -0.3, 0, Math.PI * 2);
                offCtx.fill();
                // Ears - right
                offCtx.beginPath();
                offCtx.ellipse(cx - scale * 0.2, cy - scale * 1.15, scale * 0.3, scale * 0.5, 0.3, 0, Math.PI * 2);
                offCtx.fill();
                // Legs
                for (let i = 0; i < 4; i++) {
                    const legX = cx - scale * 0.2 + (i * scale * 0.35);
                    const legY = cy + scale * 0.6;
                    offCtx.beginPath();
                    offCtx.ellipse(legX, legY, scale * 0.15, scale * 0.4, 0, 0, Math.PI * 2);
                    offCtx.fill();
                }
                // Tail
                offCtx.beginPath();
                offCtx.ellipse(cx + scale * 0.9, cy - scale * 0.2, scale * 0.25, scale * 0.6, 0.4, 0, Math.PI * 2);
                offCtx.fill();
                break;
            case 'cat':
                // Detailed cat with pointed ears
                // Body
                offCtx.beginPath();
                offCtx.ellipse(cx + 10, cy, scale * 1.1, scale * 0.75, 0, 0, Math.PI * 2);
                offCtx.fill();
                // Head
                offCtx.beginPath();
                offCtx.arc(cx - scale * 0.55, cy - scale * 0.65, scale * 0.45, 0, Math.PI * 2);
                offCtx.fill();
                // Snout
                offCtx.beginPath();
                offCtx.arc(cx - scale * 0.85, cy - scale * 0.45, scale * 0.2, 0, Math.PI * 2);
                offCtx.fill();
                // Ears - left (pointed)
                offCtx.beginPath();
                offCtx.moveTo(cx - scale * 0.8, cy - scale * 1.2);
                offCtx.lineTo(cx - scale * 0.55, cy - scale * 0.75);
                offCtx.lineTo(cx - scale * 0.95, cy - scale * 0.85);
                offCtx.closePath();
                offCtx.fill();
                // Ears - right (pointed)
                offCtx.beginPath();
                offCtx.moveTo(cx - scale * 0.3, cy - scale * 1.2);
                offCtx.lineTo(cx - scale * 0.05, cy - scale * 0.75);
                offCtx.lineTo(cx - scale * 0.45, cy - scale * 0.85);
                offCtx.closePath();
                offCtx.fill();
                // Legs
                for (let i = 0; i < 4; i++) {
                    const legX = cx - scale * 0.25 + (i * scale * 0.3);
                    const legY = cy + scale * 0.55;
                    offCtx.beginPath();
                    offCtx.ellipse(legX, legY, scale * 0.12, scale * 0.35, 0, 0, Math.PI * 2);
                    offCtx.fill();
                }
                // Tail (curved)
                offCtx.beginPath();
                offCtx.ellipse(cx + scale * 0.8, cy - scale * 0.15, scale * 0.2, scale * 0.65, 0.5, 0, Math.PI * 2);
                offCtx.fill();
                break;
            case 'heart':
                // Heart shape
                const hx = cx;
                const hy = cy;
                const hs = scale * 1.2;
                offCtx.beginPath();
                offCtx.moveTo(hx, hy + hs * 0.4);
                offCtx.bezierCurveTo(hx - hs, hy - hs * 0.2, hx - hs, hy - hs * 0.6, hx - hs * 0.3, hy - hs * 0.6);
                offCtx.bezierCurveTo(hx, hy - hs, hx, hy - hs, hx, hy - hs * 0.6);
                offCtx.bezierCurveTo(hx, hy - hs, hx, hy - hs, hx + hs * 0.3, hy - hs * 0.6);
                offCtx.bezierCurveTo(hx + hs, hy - hs * 0.6, hx + hs, hy - hs * 0.2, hx, hy + hs * 0.4);
                offCtx.closePath();
                offCtx.fill();
                break;
            case 'star':
                // 5-pointed star
                const sx = cx;
                const sy = cy;
                const ss = scale * 1.3;
                offCtx.beginPath();
                for (let i = 0; i < 5; i++) {
                    const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
                    const x = sx + ss * Math.cos(angle);
                    const y = sy + ss * Math.sin(angle);
                    if (i === 0) offCtx.moveTo(x, y);
                    else offCtx.lineTo(x, y);
                    
                    const innerAngle = angle + (2 * Math.PI) / 5;
                    const ix = sx + (ss * 0.4) * Math.cos(innerAngle);
                    const iy = sy + (ss * 0.4) * Math.sin(innerAngle);
                    offCtx.lineTo(ix, iy);
                }
                offCtx.closePath();
                offCtx.fill();
                break;
        }
    }

    getShapeCoordinates(shapeName) {
        const offCtx = document.createElement('canvas').getContext('2d');
        offCtx.canvas.width = this.canvasWidth;
        offCtx.canvas.height = this.canvasHeight;
        
        this.drawShape(offCtx, shapeName);
        
        const imageData = offCtx.getImageData(0, 0, this.canvasWidth, this.canvasHeight);
        const pixels = imageData.data;
        const coordinates = [];

        // Calculate distance field for edge detection
        for (let y = 0; y < this.canvasHeight; y += this.gap) {
            for (let x = 0; x < this.canvasWidth; x += this.gap) {
                const index = (y * this.canvasWidth + x) * 4;
                const alpha = pixels[index + 3];
                if (alpha > 0) {
                    // Calculate distance to nearest non-filled pixel (edge detection)
                    let minDist = 999;
                    for (let dy = -15; dy <= 15; dy += this.gap) {
                        for (let dx = -15; dx <= 15; dx += this.gap) {
                            const nx = x + dx;
                            const ny = y + dy;
                            if (nx >= 0 && nx < this.canvasWidth && ny >= 0 && ny < this.canvasHeight) {
                                const nIndex = (ny * this.canvasWidth + nx) * 4;
                                if (pixels[nIndex + 3] === 0) {
                                    const dist = Math.sqrt(dx * dx + dy * dy);
                                    minDist = Math.min(minDist, dist);
                                }
                            }
                        }
                    }
                    // Edges (near boundary) get darker characters, interior gets lighter
                    const brightness = Math.min(1, Math.max(0.2, minDist / 20));
                    coordinates.push({ x, y, brightness });
                }
            }
        }
        return coordinates;
    }

    morph(content) {
        let coordinates;
        if (content.type === 'text') {
            coordinates = this.getCoordinates(content.value);
        } else {
            coordinates = this.getShapeCoordinates(content.value);
        }

        // Re-use existing particles
        for (let i = 0; i < coordinates.length; i++) {
            if (this.particles[i]) {
                // Particle exists, update its target
                const coord = coordinates[i];
                this.particles[i].targetX = coord.x;
                this.particles[i].targetY = coord.y;
                this.particles[i].targetBrightness = coord.brightness;
            } else {
                // Create new particle
                const coord = coordinates[i];
                this.particles.push(new Particle(this, coord.x, coord.y, coord.brightness));
            }
        }

        // Handle excess particles
        if (this.particles.length > coordinates.length) {
            for (let i = coordinates.length; i < this.particles.length; i++) {
                this.particles[i].targetX = Math.random() * this.canvasWidth;
                this.particles[i].targetY = Math.random() * this.canvasHeight;
            }
        }
    }

    render(deltaTime) {
        // Auto-morph logic
        if (performance.now() - this.lastMorphTime > this.morphInterval) {
            this.currentShapeIndex = (this.currentShapeIndex + 1) % this.shapes.length;
            this.morph(this.shapes[this.currentShapeIndex]);
            this.lastMorphTime = performance.now();
        }

        this.particles.forEach(particle => {
            particle.update();
            particle.draw();
        });
    }

    resize(width, height) {
        this.canvasWidth = width;
        this.canvasHeight = height;
        this.textX = this.canvasWidth / 2;
        this.textY = this.canvasHeight / 2;
        // Trigger re-morph to adjust positions
        this.morph(this.shapes[this.currentShapeIndex]);
    }
}

const effect = new Effect(ctx, canvas.width, canvas.height);
// Initial kick
effect.morph(effect.shapes[0]);

// Handle Click to Change
window.addEventListener('click', () => {
    effect.currentShapeIndex = (effect.currentShapeIndex + 1) % effect.shapes.length;
    effect.morph(effect.shapes[effect.currentShapeIndex]);
    effect.lastMorphTime = performance.now(); // Reset timer
});

function animate() {
    ctx.fillStyle = 'rgba(0,0,0,0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    effect.render();
    requestAnimationFrame(animate);
}

animate();

window.addEventListener('resize', function () {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    effect.resize(canvas.width, canvas.height);
});
