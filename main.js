
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
gradient.addColorStop(0, '#ff0055');
gradient.addColorStop(0.5, '#00ddff');
gradient.addColorStop(1, '#ff0055');

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

        // Words to cycle through
        this.words = [
            'SEAMLESS', 'MORPHING', 'ASCII', 'ART',
            'UX/UI', 'DESIGN', 'FLUID', 'DYNAMIC',
            'INTERACTIVE', 'IMMERSIVE', 'FUTURE', 'WEB'
        ];
        this.currentWordIndex = 0;
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

    morph(text) {
        const coordinates = this.getCoordinates(text);

        // Re-use existing particles
        // 1. Assign targets to existing particles
        // 2. If coords > particles, push new particles
        // 3. If particles > coords, send extras off screen or to a holding pattern

        for (let i = 0; i < coordinates.length; i++) {
            if (this.particles[i]) {
                // Particle exists, update its target
                this.particles[i].targetX = coordinates[i].x;
                this.particles[i].targetY = coordinates[i].y;
            } else {
                // Create new particle
                this.particles.push(new Particle(this, coordinates[i].x, coordinates[i].y, '#0aff0a'));
            }
        }

        // Handle excess particles
        if (this.particles.length > coordinates.length) {
            // Remove them gracefully or scatter them?
            // Simple approach: Splice them out. 
            // Better approach: Let them drift away.
            // For now, let's splice them out for performance to keep array clean, 
            // but maybe fade them out later.
            // Actually, simply hiding them or sending them to random spots looks cooler.
            // Let's send them to random spots off-screen for now.
            for (let i = coordinates.length; i < this.particles.length; i++) {
                this.particles[i].targetX = Math.random() * this.canvasWidth;
                this.particles[i].targetY = Math.random() * this.canvasHeight;
            }
        }
    }

    render(deltaTime) {
        // Auto-morph logic
        if (performance.now() - this.lastMorphTime > this.morphInterval) {
            this.currentWordIndex = (this.currentWordIndex + 1) % this.words.length;
            this.morph(this.words[this.currentWordIndex]);
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
        this.morph(this.words[this.currentWordIndex]);
    }
}

const effect = new Effect(ctx, canvas.width, canvas.height);
// Initial kick
effect.morph(effect.words[0]);

// Handle Click to Change
window.addEventListener('click', () => {
    effect.currentWordIndex = (effect.currentWordIndex + 1) % effect.words.length;
    effect.morph(effect.words[effect.currentWordIndex]);
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
