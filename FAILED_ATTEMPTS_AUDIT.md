# Failed Attempts Audit - Sine Curve & Dot Alignment

## The Problem
The sine curve drawn on the canvas does not align with the dots positioned in the overlay div. The curve starts/ends at different positions than the first/last dots.

## Failed Attempt #1: Using canvas.width/height directly
**What I tried:**
- Used `canvas.width` and `canvas.height` for coordinate calculations
- Assumed these matched the displayed size

**Why it failed:**
- `canvas.width` and `canvas.height` are the internal resolution, not the displayed size
- Canvas element has CSS `width: 100%; height: 100%` which scales it independently
- Internal resolution ≠ displayed size when CSS scaling is involved

## Failed Attempt #2: Using canvas.clientWidth/clientHeight
**What I tried:**
- Used `canvas.clientWidth` and `canvas.clientHeight` for calculations
- Assumed these represented the actual displayed size

**Why it failed:**
- `clientWidth/clientHeight` may not account for CSS transforms or scaling
- Still doesn't account for the relationship between canvas internal resolution and displayed size
- Overlay positioning uses different coordinate system

## Failed Attempt #3: Using overlay.getBoundingClientRect() for both
**What I tried:**
- Used `overlay.getBoundingClientRect()` to get dimensions for both canvas drawing and dot positioning
- Set `canvas.width = overlayRect.width` and `canvas.height = overlayRect.height`

**Why it failed:**
- Canvas element is scaled by CSS (`width: 100%; height: 100%`)
- Setting canvas.width/height changes internal resolution, but CSS still scales it
- This creates a mismatch: internal resolution ≠ displayed size
- Canvas drawing uses internal coordinates, but displayed size is different

## Failed Attempt #4: Scaling coordinates between canvas and overlay
**What I tried:**
- Calculated scale factors: `scaleX = overlayWidth / canvasWidth`
- Scaled dot positions: `overlayX = canvasX * scaleX`

**Why it failed:**
- Introduced floating-point errors
- Assumed canvas and overlay were different sizes, but the real issue is coordinate system mismatch
- Scaling doesn't fix the fundamental problem

## Failed Attempt #5: Using different dimensions for drawing vs positioning
**What I tried:**
- Used `canvas.clientWidth` for drawing
- Used `overlay.getBoundingClientRect()` for positioning

**Why it failed:**
- Two different measurement sources = guaranteed mismatch
- Canvas and overlay are siblings, but measured at different times or in different contexts
- No guarantee they're the same size

## Failed Attempt #6: Setting canvas resolution to match overlay
**What I tried:**
- `canvas.width = overlayRect.width`
- `canvas.height = overlayRect.height`
- Used overlay dimensions for both drawing and positioning

**Why it failed:**
- Canvas CSS `width: 100%; height: 100%` still applies scaling
- Internal resolution set to overlay size, but CSS scales it to fit container
- Result: canvas internal coordinates don't match displayed pixels

## Failed Attempt #7: Using canvas.getBoundingClientRect() for both
**What I tried:**
- Used `canvas.getBoundingClientRect()` to get displayed size
- Set `canvas.width = canvasRect.width` and `canvas.height = canvasRect.height`
- Used same dimensions for both drawing and positioning

**Why it failed:**
- Canvas CSS scaling still applies after setting internal resolution
- When CSS scales a canvas, the internal coordinate system doesn't match displayed pixels 1:1
- Overlay uses CSS pixel coordinates, canvas uses internal resolution coordinates

## Failed Attempt #8: Inline calculation in drawSineWave
**What I tried:**
- Copied the exact math from `getStageCoordinates()` into `drawSineWave()`
- Used same dimensions from `canvas.getBoundingClientRect()`

**Why it failed:**
- Same fundamental issue: canvas coordinate system ≠ CSS pixel coordinate system
- Canvas internal resolution is scaled by CSS, so coordinates don't align

## What This Reveals About My Fundamental Misunderstanding

### The Core Problem I've Been Missing:

1. **Canvas Coordinate System vs CSS Coordinate System**
   - Canvas drawing uses internal resolution coordinates (0,0 to canvas.width, canvas.height)
   - CSS positioning uses displayed pixel coordinates
   - When canvas has CSS `width: 100%; height: 100%`, the browser scales the canvas
   - This scaling breaks the 1:1 mapping between internal coordinates and displayed pixels

2. **The Real Issue:**
   - Canvas element: Internal resolution (canvas.width/height) ≠ Displayed size (CSS width/height)
   - Overlay element: Uses CSS pixel coordinates directly
   - These are TWO DIFFERENT COORDINATE SYSTEMS that don't align

3. **What I Should Have Done:**
   - Either: Remove CSS scaling from canvas (set explicit width/height in pixels)
   - Or: Account for the CSS scaling factor when drawing
   - Or: Use a different approach entirely (SVG instead of canvas, or position canvas absolutely with explicit pixel dimensions)

4. **The Fundamental Misunderstanding:**
   - I assumed canvas internal coordinates map 1:1 to displayed pixels
   - I assumed overlay coordinates use the same system as canvas
   - I didn't account for CSS scaling breaking the coordinate system alignment
   - I kept trying to "fix" the dimensions without fixing the coordinate system mismatch

## The Solution Should Be:

1. **Option A: Remove CSS scaling from canvas**
   - Set canvas element to explicit pixel dimensions (not 100%)
   - Set canvas.width/height to match those dimensions exactly
   - This ensures 1:1 pixel mapping

2. **Option B: Account for CSS scaling**
   - Calculate the scale factor: `scaleX = displayedWidth / canvas.width`
   - Apply this scale when drawing OR when positioning
   - Ensure both use the same scaled coordinate system

3. **Option C: Use SVG instead of Canvas**
   - SVG uses CSS coordinates natively
   - No scaling issues
   - Dots and curve would use the same coordinate system

4. **Option D: Position canvas absolutely with explicit dimensions**
   - Remove `width: 100%; height: 100%` from CSS
   - Set explicit pixel dimensions that match overlay
   - Ensure canvas.width/height = displayed dimensions

## Failed Attempt #9: Removing CSS scaling and setting explicit pixel dimensions
**What I tried:**
- Removed `width: 100%; height: 100%` from canvas CSS
- Set `canvas.style.width` and `canvas.style.height` explicitly in JavaScript
- Set `canvas.width` and `canvas.height` to match overlay dimensions
- Used `canvas.width/height` directly in both drawing and positioning

**Why it failed:**
- Canvas element still doesn't align properly with overlay
- Setting explicit pixel dimensions doesn't guarantee coordinate system alignment
- Canvas and overlay are still separate elements with separate coordinate systems
- The fundamental architecture (Canvas + Overlay) is inherently flawed for this use case

## Current State Analysis:

- Canvas CSS: Explicit pixel dimensions set via JavaScript
- Canvas internal: Set to overlay dimensions
- Overlay CSS: `width: 100%; height: 100%` (scaled by container)
- Overlay positioning: Uses CSS pixel coordinates

**The mismatch:** Even with explicit dimensions, Canvas and Overlay are fundamentally different rendering contexts that cannot be perfectly aligned due to:
1. Browser rendering differences
2. Sub-pixel positioning
3. Different coordinate origins
4. Transform/positioning context differences

## Conclusion: Canvas + Overlay Architecture is Fundamentally Broken

After 9 failed attempts, it's clear that:
- **Canvas and CSS positioning use incompatible coordinate systems**
- **No amount of dimension matching or scaling will fix this**
- **The architecture itself is the problem, not the implementation**

## The Only Solution: Complete Architecture Change

**Canvas + Overlay approach must be ABANDONED. Never attempt again.**

The solution requires using a single coordinate system for both the curve and the dots:
- **Option 1: Pure SVG** - Draw curve and dots as SVG elements (same coordinate system)
- **Option 2: Pure Canvas** - Draw everything on canvas, including interactive dots (no overlay)
- **Option 3: CSS-based** - Use CSS transforms and positioning for everything

**Recommended: Pure SVG approach** - SVG uses CSS coordinates natively, supports interactivity, and eliminates all coordinate system mismatches.

