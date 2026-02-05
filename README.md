# SEAMLESS - ASCII Particle Animation

A stunning HTML5 Canvas-based particle animation system that renders ASCII characters flowing gracefully between different shapes and text.

## Features

- **Smooth Particle Physics**: Sub-pixel movement with easing and friction-based animation
- **ASCII Art Rendering**: Dynamic character rendering using configurable monospace fonts
- **Shape Morphing**: Smooth transitions between text and geometric shapes
- **Real Art Shapes**: Morphs into animal silhouettes (dog, cat) and geometric shapes (star, heart)
- **60fps Animation**: Powered by requestAnimationFrame for smooth, flicker-free motion
- **Responsive Design**: Automatically adapts to window resizing
- **Interactive**: Click to advance to the next shape, hover for mouse interaction effects
- **Cyberpunk Aesthetic**: Dark theme with grey particles and monospace typography

## How It Works

### Core Components

**Particle Class**
- Each ASCII character is a particle with position, velocity, and target coordinates
- Uses easing (`ease`) and friction (`friction`) for smooth movement
- Randomly cycles through ASCII characters for a digital noise effect
- Sub-pixel positioning enables smooth animation

**Effect Class (AsciiManager)**
- Manages all particles and animation state
- `getCoordinates()`: Rasterizes text to a pixel grid
- `getShapeCoordinates()`: Converts geometric shapes to particle target positions
- `morph()`: Smoothly transitions particles between targets
- Auto-morphs every 3 seconds or on click

**Animation Loop**
- Clears canvas with slight fade for trail effect
- Updates particle physics each frame
- Renders all particles as ASCII characters

## Shapes

The animation cycles through:
- **DOG** (text) → Dog silhouette
- **CAT** (text) → Cat silhouette  
- **HEART** (text) → Heart shape
- **STAR** (text) → 5-pointed star

## Usage

1. Open `index.html` in a modern browser
2. Watch the particles flow between shapes
3. Click to manually advance to the next shape
4. Move your mouse over the canvas for interactive effects
5. Resize the window - the animation adapts automatically

## Technical Details

- **Canvas Rendering**: Sub-pixel accuracy for smooth movement
- **Color Scheme**: Grey particles (#999999) on black background
- **Font**: Courier New monospace
- **Grid Gap**: 14px spacing between particle positions
- **Morph Interval**: 3000ms (automatic transitions)

## Browser Compatibility

Requires a modern browser supporting:
- HTML5 Canvas API
- requestAnimationFrame
- Canvas ImageData API
