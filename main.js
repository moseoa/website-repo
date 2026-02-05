
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
gradient.addColorStop(0, '#888888');
gradient.addColorStop(0.5, '#cccccc');
gradient.addColorStop(1, '#888888');

class Particle {
    constructor(effect, x, y, color) {
        this.effect = effect;
        // Start at a random position initially
        this.x = Math.random() * this.effect.canvasWidth;
        this.y = Math.random() * this.effect.canvasHeight;
        this.color = color;

        // Target position to fly to
        this.targetX = x;
        this.targetY = y;

        this.size = this.effect.gap;
        this.dx = 0;
        this.dy = 0;
        this.vx = 0;
        this.vy = 0;
        this.force = 0;
        this.angle = 0;
        this.distance = 0;
        this.friction = Math.random() * 0.9 + 0.05; // High friction for precise stopping
        this.ease = Math.random() * 0.05 + 0.005;   // Low easing for smooth drift

        // ASCII Logic
        this.chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()_+-=[]{}|;:,.<>?';
        this.char = this.chars.charAt(Math.floor(Math.random() * this.chars.length));
    }

    update() {
        this.dx = this.targetX - this.x;
        this.dy = this.targetY - this.y;
        this.distance = this.dx * this.dx + this.dy * this.dy;
        this.force = -this.effect.mouse.radius / this.distance;

        if (this.distance < this.effect.mouse.radius) {
            this.angle = Math.atan2(this.dy, this.dx);
            this.vx += this.force * Math.cos(this.angle);
            this.vy += this.force * Math.sin(this.angle);
        }

        this.x += (this.dx * this.ease) + (this.vx * this.friction);
        this.y += (this.dy * this.ease) + (this.vy * this.friction);
    }

    draw() {
        // Change char occasionally for "digital noise" effect
        if (Math.random() < 0.05) {
            this.char = this.chars.charAt(Math.floor(Math.random() * this.chars.length));
        }

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
        this.gap = 14;

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

        const pixels = offCtx.getImageData(0, 0, this.canvasWidth, this.canvasHeight).data;
        const coordinates = [];

        for (let y = 0; y < this.canvasHeight; y += this.gap) {
            for (let x = 0; x < this.canvasWidth; x += this.gap) {
                const index = (y * this.canvasWidth + x) * 4;
                const alpha = pixels[index + 3];
                if (alpha > 0) {
                    coordinates.push({ x, y });
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
        const scale = 80;

        offCtx.fillStyle = 'white';
        offCtx.strokeStyle = 'white';
        offCtx.lineWidth = 3;

        switch (shapeName) {
            case 'dog':
                // Simple dog
                // Body
                offCtx.beginPath();
                offCtx.ellipse(cx, cy, scale, scale * 0.6, 0, 0, Math.PI * 2);
                offCtx.fill();
                // Head
                offCtx.beginPath();
                offCtx.arc(cx - scale * 0.5, cy - scale * 0.6, scale * 0.4, 0, Math.PI * 2);
                offCtx.fill();
                // Ears
                offCtx.beginPath();
                offCtx.arc(cx - scale * 0.8, cy - scale, scale * 0.25, 0, Math.PI * 2);
                offCtx.fill();
                offCtx.beginPath();
                offCtx.arc(cx - scale * 0.15, cy - scale, scale * 0.25, 0, Math.PI * 2);
                offCtx.fill();
                // Tail
                offCtx.beginPath();
                offCtx.arc(cx + scale * 0.8, cy, scale * 0.3, 0, Math.PI * 2);
                offCtx.fill();
                break;
            case 'cat':
                // Simple cat
                // Body
                offCtx.beginPath();
                offCtx.ellipse(cx, cy, scale, scale * 0.7, 0, 0, Math.PI * 2);
                offCtx.fill();
                // Head
                offCtx.beginPath();
                offCtx.arc(cx - scale * 0.4, cy - scale * 0.7, scale * 0.35, 0, Math.PI * 2);
                offCtx.fill();
                // Ears (triangular)
                offCtx.beginPath();
                offCtx.moveTo(cx - scale * 0.65, cy - scale * 1.1);
                offCtx.lineTo(cx - scale * 0.45, cy - scale * 0.9);
                offCtx.lineTo(cx - scale * 0.5, cy - scale * 1.2);
                offCtx.closePath();
                offCtx.fill();
                offCtx.beginPath();
                offCtx.moveTo(cx - scale * 0.15, cy - scale * 1.1);
                offCtx.lineTo(cx + scale * 0.05, cy - scale * 0.9);
                offCtx.lineTo(cx - scale * 0.1, cy - scale * 1.2);
                offCtx.closePath();
                offCtx.fill();
                // Tail
                offCtx.beginPath();
                offCtx.arc(cx + scale * 0.7, cy + scale * 0.2, scale * 0.35, 0, Math.PI * 2);
                offCtx.fill();
                break;
            case 'heart':
                // Heart shape
                const hx = cx;
                const hy = cy;
                const hs = scale * 0.8;
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
                const ss = scale;
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
        
        const pixels = offCtx.getImageData(0, 0, this.canvasWidth, this.canvasHeight).data;
        const coordinates = [];

        for (let y = 0; y < this.canvasHeight; y += this.gap) {
            for (let x = 0; x < this.canvasWidth; x += this.gap) {
                const index = (y * this.canvasWidth + x) * 4;
                const alpha = pixels[index + 3];
                if (alpha > 0) {
                    coordinates.push({ x, y });
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
                this.particles[i].targetX = coordinates[i].x;
                this.particles[i].targetY = coordinates[i].y;
            } else {
                // Create new particle
                this.particles.push(new Particle(this, coordinates[i].x, coordinates[i].y, '#999999'));
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
    ctx.fillStyle = 'rgba(0,0,0,0.1)';
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
