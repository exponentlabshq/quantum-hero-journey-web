# SVG Architecture Proposal - Complete Rewrite

## Problem Statement

The Canvas + Overlay architecture has failed 9 times and cannot be fixed. Canvas and CSS positioning use incompatible coordinate systems that cannot be perfectly aligned.

## Solution: Pure SVG Architecture

Replace the entire Canvas + Overlay system with a single SVG element that handles both the sine wave and interactive dots.

## Architecture Overview

### HTML Structure
```html
<div class="visualization-wrapper">
    <!-- Replace canvas + overlay with single SVG -->
    <svg id="sineSvg" class="sine-svg" viewBox="0 0 800 400" preserveAspectRatio="xMidYMid meet">
        <!-- Axes -->
        <line class="axis" x1="120" y1="200" x2="680" y2="200" />
        <line class="axis" x1="120" y1="40" x2="120" y2="360" />
        
        <!-- Sine Wave Path -->
        <path id="sinePath" class="sine-path" d="..." stroke="currentColor" fill="none" />
        
        <!-- Stage Dots (dynamically created) -->
        <g id="stageDots"></g>
        
        <!-- Stage Labels (dynamically created) -->
        <g id="stageLabels"></g>
    </svg>
</div>
```

### CSS Changes
```css
.sine-svg {
    width: 100%;
    height: 100%;
    display: block;
}

.sine-path {
    stroke-width: 3;
    filter: drop-shadow(0 0 20px currentColor);
}

.stage-dot {
    cursor: pointer;
    transition: all 0.3s;
}

.stage-dot.active {
    r: 16;
    fill: #ffd700;
    filter: drop-shadow(0 0 30px #ffd700);
}

.stage-label {
    font-size: 0.5rem;
    pointer-events: none;
    text-anchor: middle;
}
```

### JavaScript Rewrite

#### 1. Remove Canvas/Overlay Code
- Delete `initCanvas()`, `resizeCanvas()`, `drawSineWave()`, `positionDots()`
- Remove all canvas/overlay element references

#### 2. New SVG Functions

```javascript
// Initialize SVG
function initSVG() {
    const svg = document.getElementById('sineSvg');
    const wrapper = svg.parentElement;
    const rect = wrapper.getBoundingClientRect();
    
    // Set viewBox to match container (1:1 coordinate mapping)
    svg.setAttribute('viewBox', `0 0 ${rect.width} ${rect.height}`);
    svg.setAttribute('width', rect.width);
    svg.setAttribute('height', rect.height);
}

// Calculate sine wave path
function calculateSinePath(totalStages, width, height) {
    const { paddingX, paddingY, amplitudeRatio } = CONFIG;
    const graphWidth = width - (2 * paddingX);
    const graphHeight = height - (2 * paddingY);
    const centerY = height / 2;
    const amplitude = graphHeight * amplitudeRatio;
    
    const numPoints = 300;
    let pathData = '';
    
    for (let i = 0; i <= numPoints; i++) {
        const stageIndex = (i / numPoints) * (totalStages - 1);
        const t = (stageIndex / (totalStages - 1)) * 2 * Math.PI;
        const x = (stageIndex / (totalStages - 1)) * graphWidth + paddingX;
        const y = centerY - (Math.sin(t) * amplitude);
        
        if (i === 0) {
            pathData = `M ${x},${y}`;
        } else {
            pathData += ` L ${x},${y}`;
        }
    }
    
    return pathData;
}

// Render sine wave
function renderSineWave() {
    const svg = document.getElementById('sineSvg');
    const rect = svg.getBoundingClientRect();
    const phase = data.phases[currentPhaseIndex];
    const totalStages = phase.stages.length;
    
    const path = document.getElementById('sinePath');
    const pathData = calculateSinePath(totalStages, rect.width, rect.height);
    path.setAttribute('d', pathData);
    path.setAttribute('stroke', phase.color);
}

// Render stage dots
function renderStageDots() {
    const svg = document.getElementById('sineSvg');
    const rect = svg.getBoundingClientRect();
    const phase = data.phases[currentPhaseIndex];
    const stages = phase.stages;
    const dotsGroup = document.getElementById('stageDots');
    
    // Clear existing dots
    dotsGroup.innerHTML = '';
    
    stages.forEach((stage, index) => {
        const { x, y } = getStageCoordinates(index, stages.length, rect.width, rect.height);
        
        // Create circle element
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', x);
        circle.setAttribute('cy', y);
        circle.setAttribute('r', index === currentStageIndex ? 16 : 10);
        circle.setAttribute('fill', index === currentStageIndex ? '#ffd700' : phase.color);
        circle.setAttribute('class', 'stage-dot');
        if (index === currentStageIndex) circle.classList.add('active');
        
        // Add click handler
        circle.addEventListener('click', () => {
            currentStageIndex = index;
            updateDisplay();
            showModal();
        });
        
        dotsGroup.appendChild(circle);
    });
}

// Render stage labels
function renderStageLabels() {
    const svg = document.getElementById('sineSvg');
    const rect = svg.getBoundingClientRect();
    const phase = data.phases[currentPhaseIndex];
    const stages = phase.stages;
    const labelsGroup = document.getElementById('stageLabels');
    
    // Clear existing labels
    labelsGroup.innerHTML = '';
    
    stages.forEach((stage, index) => {
        const { x, y, centerY } = getStageCoordinates(index, stages.length, rect.width, rect.height);
        
        // Extract label text
        const match = stage.title.match(/^(\d+)\.\s*(.+)$/);
        const labelText = match ? (match[2].split(' - ')[1] || match[2]) : stage.title;
        
        // Position label above dot
        const labelY = y < centerY ? y - 15 : y + 15;
        
        // Create text element
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', x);
        text.setAttribute('y', labelY);
        text.setAttribute('class', 'stage-label');
        text.setAttribute('fill', phase.color);
        text.setAttribute('font-size', '0.5rem');
        text.textContent = labelText;
        
        // Add click handler
        text.style.cursor = 'pointer';
        text.style.pointerEvents = 'auto';
        text.addEventListener('click', () => {
            currentStageIndex = index;
            updateDisplay();
            showModal();
        });
        
        labelsGroup.appendChild(text);
    });
}

// Update display
function updateDisplay() {
    const phase = data.phases[currentPhaseIndex];
    const stage = phase.stages[currentStageIndex];
    
    // Update UI
    elements.phaseName.textContent = phase.name;
    elements.phaseName.style.color = phase.color;
    elements.phaseEra.textContent = phase.era;
    elements.stageNumber.textContent = currentStageIndex + 1;
    elements.stageTotal.textContent = phase.stages.length;
    elements.prevBtn.disabled = currentStageIndex === 0;
    elements.nextBtn.disabled = currentStageIndex === phase.stages.length - 1;
    
    // Render SVG elements
    renderSineWave();
    renderStageDots();
    renderStageLabels();
    updateTimeline();
    updateMenu();
}
```

## Benefits of SVG Approach

1. **Single Coordinate System**: Everything uses SVG viewBox coordinates
2. **Perfect Alignment**: Dots and curve use exact same coordinates
3. **Native Interactivity**: SVG elements are directly clickable
4. **No Scaling Issues**: viewBox handles responsive scaling automatically
5. **Simpler Code**: No coordinate conversion or scaling calculations
6. **Better Performance**: Browser-optimized SVG rendering
7. **Accessibility**: SVG elements can have proper ARIA attributes

## Migration Steps

1. Replace `<canvas>` and `.stage-overlay` with single `<svg>` element
2. Rewrite all drawing functions to use SVG API
3. Remove all canvas/overlay coordinate conversion code
4. Update CSS to style SVG elements
5. Test alignment (should be perfect by design)

## Why This Will Work

- SVG path and SVG circle elements use the same coordinate system (viewBox)
- No coordinate conversion needed
- No scaling issues
- Browser handles all rendering consistently
- Alignment is guaranteed by using same coordinates for both

