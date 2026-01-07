# Product Requirements Document: Quantum Hero's Journey Interactive Web Visualization

## 1. Executive Summary

Create an interactive web-based e-learning visualization that displays the Hero's Journey of Quantum Computing across three historical phases (Pre-Classical, Classical, Quantum), with 12 stages per phase mapped onto a sine wave curve. The visualization must be fully interactive, responsive, and provide detailed information for each stage.

## 2. Goals

- **Primary Goal**: Create an engaging, educational visualization that teaches the evolution of quantum computing through the Hero's Journey framework
- **Secondary Goal**: Demonstrate the mathematical beauty of the sine wave as a metaphor for narrative structure
- **Tertiary Goal**: Provide a no-scroll, landscape-optimized interface that works on desktop and tablet devices

## 3. Core Requirements

### 3.1 Visual Requirements

#### 3.1.1 Sine Wave Visualization
- **REQ-V-001**: Display a sine wave curve that spans from x=0 to x=2π (one full cycle)
- **REQ-V-002**: The sine wave must have sufficient vertical amplitude (height) to clearly separate all 12 stage dots
- **REQ-V-003**: The sine wave must be tall enough that text labels on dots do not overlap
- **REQ-V-004**: The sine wave must be drawn using HTML5 Canvas API
- **REQ-V-005**: The sine wave color must match the current phase color

#### 3.1.2 Stage Dots
- **REQ-V-006**: Each of the 12 stages must be represented by a clickable dot positioned exactly on the sine curve
- **REQ-V-007**: Dots must align perfectly with the sine wave - no misalignment allowed
- **REQ-V-008**: Dots must be positioned at mathematically correct points: Stage 1 at (0, 0), Stage 12 at (2π, 0)
- **REQ-V-009**: Dots must be evenly distributed along the x-axis from 0 to 2π
- **REQ-V-010**: Active stage dot must be highlighted in gold (#ffd700)
- **REQ-V-011**: Inactive dots must use the phase color

#### 3.1.3 Stage Labels
- **REQ-V-012**: Each dot must have a text label showing the descriptive part of the stage title
- **REQ-V-013**: Labels must be positioned directly above or below their dots (above if dot is below center, below if dot is above center)
- **REQ-V-014**: Labels must be small enough to prevent overlap with adjacent labels
- **REQ-V-015**: Labels must be fully visible (no truncation with "...")
- **REQ-V-016**: Labels for first and last dots must not run off the page edges
- **REQ-V-017**: Labels must be readable with appropriate font size (minimum 0.5rem)
- **REQ-V-018**: Labels must be clickable and trigger the details modal

#### 3.1.4 Layout
- **REQ-V-019**: The visualization must not require scrolling in landscape orientation
- **REQ-V-020**: The phase title and era must always be visible and not covered by the visualization
- **REQ-V-021**: The canvas area must use available vertical space efficiently
- **REQ-V-022**: The sine wave must use maximum vertical space to spread dots apart

### 3.2 Functional Requirements

#### 3.2.1 Navigation
- **REQ-F-001**: Users must be able to navigate between stages using Previous/Next buttons
- **REQ-F-002**: Users must be able to click directly on dots to jump to that stage
- **REQ-F-003**: Users must be able to click on labels to jump to that stage
- **REQ-F-004**: Keyboard navigation must work (Arrow Left/Right for stage navigation)
- **REQ-F-005**: Users must be able to switch between phases using phase selector chips
- **REQ-F-006**: A slide-out menu must provide navigation to any phase/stage

#### 3.2.2 Information Display
- **REQ-F-007**: Clicking a dot or label must open a modal with detailed stage information
- **REQ-F-008**: The modal must display the full stage title and all bullet points
- **REQ-F-009**: Users must be able to close the modal with Escape key or close button
- **REQ-F-010**: The "Details" button must open the modal for the current stage

#### 3.2.3 Timeline
- **REQ-F-011**: A timeline at the bottom must show all 36 stages (3 phases × 12 stages)
- **REQ-F-012**: The timeline must highlight the current stage
- **REQ-F-013**: Timeline markers must be clickable to jump to that stage

### 3.3 Technical Requirements

#### 3.3.1 Coordinate System
- **REQ-T-001**: Canvas coordinate system must use pixel-based coordinates
- **REQ-T-002**: Overlay coordinate system must align perfectly with canvas coordinates
- **REQ-T-003**: Both sine wave drawing and dot positioning must use the EXACT same calculation function
- **REQ-T-004**: Coordinate calculations must account for:
  - Canvas internal dimensions (canvas.width, canvas.height)
  - Canvas CSS dimensions (may differ due to device pixel ratio)
  - Overlay dimensions (must match canvas CSS dimensions)
  - Padding values (horizontal and vertical)
  - Amplitude ratio (0.9 for maximum vertical spread)

#### 3.3.2 Performance
- **REQ-T-005**: The visualization must render smoothly without lag
- **REQ-T-006**: Canvas redraws must be efficient
- **REQ-T-007**: Overlay updates must not cause layout thrashing

#### 3.3.3 Responsiveness
- **REQ-T-008**: The visualization must adapt to window resizing
- **REQ-T-009**: Canvas and overlay must maintain alignment after resize
- **REQ-T-010**: All calculations must be recalculated on resize

## 4. Constraints

### 4.1 Technical Constraints
- Must work in modern browsers (Chrome, Firefox, Safari, Edge)
- Must use vanilla JavaScript (no frameworks required)
- Must use HTML5 Canvas for drawing
- Must use CSS for styling and layout
- Must use JSON for data storage

### 4.2 Design Constraints
- No scrolling required in landscape mode
- Must fit within viewport height (100vh minus header, controls, timeline)
- Must maintain aspect ratio and readability

### 4.3 Data Constraints
- 3 phases, each with 12 stages
- Each stage has a title and array of detail strings
- Total of 36 stages across all phases

## 5. Success Criteria

### 5.1 Alignment Accuracy
- **CRITICAL**: Dots must align with sine curve with zero visible misalignment
- Dots must be positioned at mathematically correct points on the curve
- Labels must be positioned correctly relative to their dots

### 5.2 Visual Clarity
- All labels must be readable without overlap
- Sine wave must be tall enough to provide clear vertical separation
- No text truncation or overflow

### 5.3 User Experience
- Navigation must be intuitive and responsive
- Modal must display information clearly
- Timeline must provide clear visual feedback

### 5.4 Technical Quality
- Code must be maintainable and well-documented
- Coordinate calculations must be centralized and reusable
- No hardcoded magic numbers (use constants)

## 6. Implementation Approach

### 6.1 ⚠️ FAILED APPROACHES (DO NOT USE)

#### 6.1.1 Canvas + Overlay Architecture (ABANDONED)
**Status: COMPLETE FAILURE - 9 failed attempts**

This approach attempted to:
- Draw sine wave on HTML5 Canvas
- Position interactive dots in a CSS overlay div
- Align canvas coordinates with CSS pixel coordinates

**Why it failed:**
- Canvas uses internal resolution coordinates (canvas.width/height)
- CSS positioning uses displayed pixel coordinates
- CSS scaling (`width: 100%; height: 100%`) breaks 1:1 coordinate mapping
- Browser rendering differences cause sub-pixel misalignment
- Two separate coordinate systems cannot be perfectly aligned

**Failed attempts documented in:** `FAILED_ATTEMPTS_AUDIT.md`

**Conclusion:** Canvas + Overlay architecture is fundamentally incompatible for this use case. **NEVER ATTEMPT AGAIN.**

### 6.2 NEW IMPLEMENTATION APPROACH (Required)

#### 6.2.1 Pure SVG Architecture (RECOMMENDED)
**Rationale:** SVG uses CSS coordinates natively, eliminating all coordinate system mismatches.

**Architecture:**
1. Replace `<canvas>` with `<svg>` element
2. Draw sine wave as SVG `<path>` element
3. Position dots as SVG `<circle>` elements
4. Position labels as SVG `<text>` elements or positioned divs
5. All elements use the same SVG coordinate system (viewBox)

**Benefits:**
- Single coordinate system (SVG viewBox)
- No scaling issues
- Native interactivity (SVG elements are clickable)
- Perfect alignment guaranteed
- Responsive via viewBox

**Implementation:**
- SVG viewBox: `viewBox="0 0 width height"` matches container dimensions
- Sine wave: `<path d="M x1,y1 L x2,y2 ..." />` using calculated coordinates
- Dots: `<circle cx="x" cy="y" r="10" />` using same coordinates
- Labels: `<text x="x" y="y">label</text>` or positioned absolutely with same coordinates

#### 6.2.2 Alternative: Pure Canvas with Custom Hit Detection
**Rationale:** Draw everything on canvas, handle interactivity via mouse coordinates.

**Architecture:**
1. Keep `<canvas>` element
2. Draw sine wave on canvas
3. Draw dots on canvas
4. Draw labels on canvas (or use canvas text API)
5. Handle clicks by calculating which dot was clicked based on mouse coordinates

**Benefits:**
- Single rendering context
- No coordinate system mismatch
- Full control over rendering

**Drawbacks:**
- More complex hit detection
- Text rendering less flexible than HTML
- Accessibility concerns

#### 6.2.3 Alternative: CSS-Based with SVG Path
**Rationale:** Use SVG for curve, CSS for positioning.

**Architecture:**
1. SVG `<path>` for sine wave
2. CSS positioned divs for dots and labels
3. Use CSS `clip-path` or absolute positioning with calculated coordinates

**Benefits:**
- Flexible text rendering
- Easy styling

**Drawbacks:**
- Still potential coordinate system issues
- More complex than pure SVG

### 6.3 Recommended Implementation: Pure SVG

#### 6.3.1 SVG Structure
```html
<svg id="sineSvg" viewBox="0 0 800 400" preserveAspectRatio="xMidYMid meet">
  <!-- Axes -->
  <line x1="paddingX" y1="centerY" x2="width-paddingX" y2="centerY" />
  <line x1="paddingX" y1="paddingY" x2="paddingX" y2="height-paddingY" />
  
  <!-- Sine Wave Path -->
  <path d="M x1,y1 L x2,y2 L x3,y3 ..." stroke="phase.color" />
  
  <!-- Stage Dots -->
  <circle cx="x" cy="y" r="10" fill="phase.color" />
  
  <!-- Stage Labels (optional: use foreignObject for HTML) -->
  <text x="x" y="y-offset">Label</text>
</svg>
```

#### 6.3.2 Coordinate Calculation (Same as Before)
- Single function: `getStageCoordinates(index, totalStages, width, height)`
- Returns {x, y} in SVG coordinate space
- Used for both path points and circle positions

#### 6.3.3 Key Functions
- `calculateSinePath(totalStages, width, height)` - Returns SVG path string
- `renderSVG()` - Creates/updates SVG elements
- `updateDots()` - Updates circle positions using same coordinates
- `updateLabels()` - Updates text positions using same coordinates

#### 6.3.4 Constants (Same)
- `CONFIG.paddingX = 120` - Horizontal padding
- `CONFIG.paddingY = 40` - Vertical padding  
- `CONFIG.amplitudeRatio = 0.425` - Amplitude ratio

## 7. Testing Requirements

### 7.1 Visual Testing
- Verify dots align with sine curve at all stages
- Verify labels don't overlap
- Verify labels don't run off page edges
- Verify sine wave is tall enough

### 7.2 Functional Testing
- Test navigation between all stages
- Test phase switching
- Test modal opening/closing
- Test keyboard navigation
- Test window resizing

### 7.3 Cross-Browser Testing
- Test in Chrome, Firefox, Safari, Edge
- Verify coordinate calculations work consistently

## 8. Out of Scope

- Mobile portrait orientation optimization
- Animation/transitions between stages
- Export functionality
- Print styles
- Accessibility features beyond basic keyboard navigation

## 9. Future Enhancements (Post-MVP)

- Smooth animations when switching stages
- Zoom functionality
- Export as image
- Full accessibility support (ARIA labels, screen reader support)
- Mobile portrait optimization

