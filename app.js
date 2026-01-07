// ============================================================================
// COMPLETE REWRITE - Quantum Hero's Journey Interactive Visualization
// ============================================================================

// Global State
let data = null;
let currentPhaseIndex = 0;
let currentStageIndex = 0;

// DOM References
const elements = {
    phaseSelector: document.getElementById('phaseSelector'),
    phaseName: document.getElementById('phaseName'),
    phaseEra: document.getElementById('phaseEra'),
    svg: document.getElementById('sineSvg'),
    sinePath: document.getElementById('sinePath'),
    stageDots: document.getElementById('stageDots'),
    stageLabels: document.getElementById('stageLabels'),
    axisHorizontal: document.querySelector('.axis-horizontal'),
    axisVertical: document.querySelector('.axis-vertical'),
    prevBtn: document.getElementById('prevStage'),
    nextBtn: document.getElementById('nextStage'),
    stageNumber: document.getElementById('stageNumber'),
    stageTotal: document.getElementById('stageTotal'),
    detailsBtn: document.getElementById('detailsBtn'),
    timelineTrack: document.getElementById('timelineTrack'),
    menuBtn: document.getElementById('menuBtn'),
    slideMenu: document.getElementById('slideMenu'),
    menuOverlay: document.getElementById('menuOverlay'),
    closeMenuBtn: document.getElementById('closeMenu'),
    menuPhaseList: document.getElementById('menuPhaseList'),
    menuStageList: document.getElementById('menuStageList'),
    modalOverlay: document.getElementById('modalOverlay'),
    modalTitle: document.getElementById('modalTitle'),
    modalContent: document.getElementById('modalContent'),
    closeModalBtn: document.getElementById('closeModal')
};

// Configuration Constants
const CONFIG = {
    paddingX: 120,  // Reduced for more horizontal space
    paddingY: 40,   // Reduced for more vertical space (prevents clipping)
    amplitudeRatio: 0.425  // Reduced by 50% to prevent top/bottom clipping
};

// ============================================================================
// COORDINATE CALCULATION - SINGLE SOURCE OF TRUTH
// ============================================================================

function getStageCoordinates(index, totalStages, width, height) {
    const { paddingX, paddingY, amplitudeRatio } = CONFIG;
    
    const graphWidth = width - (2 * paddingX);
    const graphHeight = height - (2 * paddingY);
    const centerY = height / 2;
    const amplitude = graphHeight * amplitudeRatio;
    
    // Calculate position along sine curve: 0 to 2π
    const t = (index / (totalStages - 1)) * 2 * Math.PI;
    const x = (index / (totalStages - 1)) * graphWidth + paddingX;
    const y = centerY - (Math.sin(t) * amplitude);
    
    return { x, y, centerY };
}

// ============================================================================
// SVG MANAGEMENT - COMPLETE REWRITE
// ============================================================================

function initSVG() {
    if (!elements.svg) return;
    resizeSVG();
}

function resizeSVG() {
    if (!elements.svg) return;
    
    const wrapper = elements.svg.parentElement;
    const rect = wrapper.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // Set SVG viewBox to match container (1:1 coordinate mapping)
    elements.svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    elements.svg.setAttribute('width', width);
    elements.svg.setAttribute('height', height);
}

// ============================================================================
// RENDER SINE WAVE - SVG PATH
// ============================================================================

function renderSineWave() {
    if (!elements.svg || !elements.sinePath) return;
    
    const rect = elements.svg.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    const phase = data.phases[currentPhaseIndex];
    const stages = phase.stages;
    const totalStages = stages.length;
    
    // Calculate sine wave path using EXACT same formula as dots
    const { paddingX, paddingY, amplitudeRatio } = CONFIG;
    const graphWidth = width - (2 * paddingX);
    const graphHeight = height - (2 * paddingY);
    const centerY = height / 2;
    const amplitude = graphHeight * amplitudeRatio;
    
    // Draw axes
    const firstDot = getStageCoordinates(0, totalStages, width, height);
    const lastDot = getStageCoordinates(totalStages - 1, totalStages, width, height);
    
    elements.axisHorizontal.setAttribute('x1', firstDot.x);
    elements.axisHorizontal.setAttribute('y1', centerY);
    elements.axisHorizontal.setAttribute('x2', lastDot.x);
    elements.axisHorizontal.setAttribute('y2', centerY);
    
    elements.axisVertical.setAttribute('x1', firstDot.x);
    elements.axisVertical.setAttribute('y1', paddingY);
    elements.axisVertical.setAttribute('x2', firstDot.x);
    elements.axisVertical.setAttribute('y2', height - paddingY);
    
    // Calculate path data - use EXACT same calculation as getStageCoordinates
    const numPoints = 300;
    let pathData = '';
    
    for (let i = 0; i <= numPoints; i++) {
        // Map i from 0..numPoints to stage index from 0..(totalStages-1)
        const stageIndex = (i / numPoints) * (totalStages - 1);
        
        // EXACT SAME CALCULATION as getStageCoordinates:
        const t = (stageIndex / (totalStages - 1)) * 2 * Math.PI;
        const x = (stageIndex / (totalStages - 1)) * graphWidth + paddingX;
        const y = centerY - (Math.sin(t) * amplitude);
        
        if (i === 0) {
            pathData = `M ${x},${y}`;
        } else {
            pathData += ` L ${x},${y}`;
        }
    }
    
    // Set path and color
    elements.sinePath.setAttribute('d', pathData);
    elements.sinePath.setAttribute('stroke', phase.color);
}

// ============================================================================
// RENDER STAGE DOTS - SVG CIRCLES
// ============================================================================

function renderStageDots() {
    if (!elements.svg || !elements.stageDots) return;
    
    const rect = elements.svg.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    const phase = data.phases[currentPhaseIndex];
    const stages = phase.stages;
    
    // Clear existing dots
    elements.stageDots.innerHTML = '';
    
    stages.forEach((stage, index) => {
        // Get coordinates using EXACT SAME function as renderSineWave()
        const { x, y } = getStageCoordinates(index, stages.length, width, height);
        
        // Create SVG circle element
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
        
        elements.stageDots.appendChild(circle);
    });
}

// ============================================================================
// RENDER STAGE LABELS - SVG TEXT
// ============================================================================

function renderStageLabels() {
    if (!elements.svg || !elements.stageLabels) return;
    
    const rect = elements.svg.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    const phase = data.phases[currentPhaseIndex];
    const stages = phase.stages;
    
    // Clear existing labels
    elements.stageLabels.innerHTML = '';
    
    // Find highest and lowest dots
    let highestIndex = 0;
    let lowestIndex = 0;
    let highestY = Infinity;
    let lowestY = -Infinity;
    
    stages.forEach((stage, index) => {
        const { y } = getStageCoordinates(index, stages.length, width, height);
        if (y < highestY) {
            highestY = y;
            highestIndex = index;
        }
        if (y > lowestY) {
            lowestY = y;
            lowestIndex = index;
        }
    });
    
    stages.forEach((stage, index) => {
        // Get coordinates using EXACT SAME function as renderSineWave()
        const { x, y, centerY } = getStageCoordinates(index, stages.length, width, height);
        
        // Extract label text
        const match = stage.title.match(/^(\d+)\.\s*(.+)$/);
        const labelText = match ? (match[2].split(' - ')[1] || match[2]) : stage.title;
        
        // Determine label position and size
        const isHighest = index === highestIndex;
        const isLowest = index === lowestIndex;
        
        // Position: above dot (default), below dot (if lowest)
        // 2x spacing: 22.5 * 2 = 45
        const labelY = isLowest ? y + 45 : y - 45;
        
        // Font size: 100% bigger (2x) - 0.5rem -> 1rem, 0.75rem -> 1.5rem
        const fontSize = isHighest ? '1.5rem' : '1rem';
        
        // Adjust x position for first dot to prevent left-side cutoff
        // Move right by 30% of paddingX (which represents the left margin)
        let labelX = x;
        let textAnchor = 'middle';
        if (index === 0) {
            // Move right by 30% of the horizontal padding
            const offset = CONFIG.paddingX * 0.3;
            labelX = x + offset;
            textAnchor = 'start'; // Change anchor to start for better positioning
        }
        
        // Create text element (no background bubble)
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', labelX);
        text.setAttribute('y', labelY);
        text.setAttribute('class', 'stage-label');
        if (index === currentStageIndex) text.classList.add('active');
        text.setAttribute('fill', index === currentStageIndex ? '#ffd700' : phase.color);
        text.setAttribute('font-size', fontSize);
        text.setAttribute('font-weight', index === currentStageIndex ? '600' : '500');
        text.setAttribute('text-anchor', textAnchor);
        text.setAttribute('dominant-baseline', 'middle');
        text.textContent = labelText;
        
        // Add click handler
        text.addEventListener('click', () => {
            currentStageIndex = index;
            updateDisplay();
            showModal();
        });
        
        elements.stageLabels.appendChild(text);
    });
}

// ============================================================================
// UPDATE DISPLAY
// ============================================================================

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
    
    // Resize SVG to match container
    resizeSVG();
    
    // Render all SVG elements using same coordinate system
    renderSineWave();
    renderStageDots();
    renderStageLabels();
    updateTimeline();
    updateMenu();
}

// ============================================================================
// TIMELINE
// ============================================================================

function renderTimeline() {
    elements.timelineTrack.innerHTML = '';
    let globalIndex = 0;
    
    data.phases.forEach((phase) => {
        phase.stages.forEach(() => {
            const marker = document.createElement('div');
            marker.className = 'timeline-marker';
            marker.style.position = 'absolute';
            marker.style.width = '8px';
            marker.style.height = '8px';
            marker.style.borderRadius = '50%';
            marker.style.backgroundColor = phase.color;
            marker.style.left = `${(globalIndex / 35) * 100}%`;
            marker.style.top = '50%';
            marker.style.transform = 'translate(-50%, -50%)';
            marker.style.cursor = 'pointer';
            marker.style.transition = 'all 0.2s';
            marker.style.border = '1px solid var(--bg-secondary)';
            marker.dataset.phaseIndex = phase.id;
            marker.dataset.stageIndex = globalIndex % 12;
            marker.dataset.globalIndex = globalIndex;
            
            marker.addEventListener('click', () => {
                const phaseIdx = parseInt(marker.dataset.phaseIndex);
                const stageIdx = parseInt(marker.dataset.stageIndex);
                if (phaseIdx !== currentPhaseIndex) {
                    loadPhase(phaseIdx);
                }
                currentStageIndex = stageIdx;
                updateDisplay();
            });
            
            elements.timelineTrack.appendChild(marker);
            globalIndex++;
        });
    });
}

function updateTimeline() {
    let globalIndex = 0;
    data.phases.forEach((p, pIndex) => {
        p.stages.forEach((s, sIndex) => {
            const marker = document.querySelector(`[data-global-index="${globalIndex}"]`);
            if (marker) {
                if (pIndex === currentPhaseIndex && sIndex === currentStageIndex) {
                    marker.classList.add('active');
                    marker.style.transform = 'translate(-50%, -50%) scale(1.5)';
                    marker.style.borderColor = '#ffd700';
                    marker.style.boxShadow = '0 0 8px #ffd700';
                } else {
                    marker.classList.remove('active');
                    marker.style.transform = 'translate(-50%, -50%)';
                    marker.style.borderColor = 'var(--bg-secondary)';
                    marker.style.boxShadow = 'none';
                }
            }
            globalIndex++;
        });
    });
}

// ============================================================================
// PHASE MANAGEMENT
// ============================================================================

function renderPhaseSelector() {
    elements.phaseSelector.innerHTML = '';
    data.phases.forEach((phase, index) => {
        const chip = document.createElement('button');
        chip.className = 'phase-chip';
        chip.style.color = phase.color;
        chip.textContent = phase.name;
        chip.addEventListener('click', () => loadPhase(index));
        elements.phaseSelector.appendChild(chip);
    });
}

function loadPhase(phaseIndex) {
    currentPhaseIndex = phaseIndex;
    currentStageIndex = 0;
    updateDisplay();
    
    // Update phase selector
    document.querySelectorAll('.phase-chip').forEach((chip, index) => {
        if (index === phaseIndex) {
            chip.classList.add('active');
        } else {
            chip.classList.remove('active');
        }
    });
}

// ============================================================================
// NAME HIGHLIGHTING
// ============================================================================

function highlightNames(text, phaseColor) {
    // List of historical figures and scientists to highlight
    // Compound names first (longest first) to match them before shorter variants
    const names = [
        // Pre-Classical Phase
        'Thales of Miletus', 'Anaximander', 'Heraclitus', 'Pythagoras', 'Philolaus', 'Archytas', 
        'Hippasus', 'Plato', 'Euclid', 'Parmenides', 'Hypatia of Alexandria', 'Hypatia',
        'Archimedes', 'Eratosthenes', 'Justinian', 'Ibn al-Haytham', 'Ptolemy', 'Galen',
        'Al-Biruni', 'Al-Kindi', 'Roger Bacon', 'Francis Bacon', 'Witelo', 'John Peckham',
        'Ibn Sina', 'Avicenna', 'Hippocrates', 'Al-Farabi', 'Al-Razi', 'Hunayn ibn Ishaq',
        'Thomas Aquinas', 'Albertus Magnus', 'Cardinal Bellarmine', 'Paolo Sarpi',
        'Pope Urban VIII', 'Johannes Kepler', 'Tycho Brahe', 'Brahe', 'Longomontanus',
        'Nicolaus Copernicus', 'Copernicus', 'Georg Joachim Rheticus', 'Rheticus',
        'Johannes Petreius', 'Petreius', 'Martin Luther', 'Luther',
        
        // Classical Phase
        'Isaac Newton', 'Newton', 'Gottfried Leibniz', 'Leibniz', 'Robert Hooke', 'Hooke',
        'Edmond Halley', 'Halley', 'James Clerk Maxwell', 'Maxwell', 'Michael Faraday', 'Faraday',
        'André-Marie Ampère', 'Ampère', 'Hans Christian Ørsted', 'Ørsted',
        'Carl Friedrich Gauss', 'Gauss', 'Wilhelm Weber', 'Weber', 'Augustin-Jean Fresnel', 'Fresnel',
        'Thomas Young', 'Young', 'Heinrich Hertz', 'Hertz', 'Max Planck', 'Planck',
        'Wilhelm Wien', 'Wien', 'Lord Rayleigh', 'Rayleigh', 'Ludwig Boltzmann', 'Boltzmann',
        'Heinrich Rubens', 'Rubens', 'Ferdinand Kurlbaum', 'Kurlbaum',
        'Albert Einstein', 'Einstein', 'Philipp Lenard', 'Lenard', 'Arthur Compton', 'Compton',
        'Niels Bohr', 'Bohr', 'J.J. Thomson', 'Thomson', 'Ernest Rutherford', 'Rutherford',
        'Joseph von Fraunhofer', 'Fraunhofer', 'Johannes Rydberg', 'Rydberg',
        'James Franck', 'Franck', 'Gustav Hertz', 'Arnold Sommerfeld', 'Sommerfeld',
        'Louis de Broglie', 'De Broglie', 'Henri Poincaré', 'Poincaré',
        'Clinton Davisson', 'Davisson', 'Lester Germer', 'Germer',
        'Werner Heisenberg', 'Heisenberg', 'Erwin Schrödinger', 'Schrödinger',
        'Max Born', 'Born', 'Pascual Jordan', 'Jordan', 'Paul Dirac', 'Dirac',
        'Dmitri Mendeleev', 'Mendeleev', 'Linus Pauling', 'Pauling',
        'Robert Mulliken', 'Mulliken', 'Eugene Wigner', 'Wigner',
        
        // Quantum Phase
        'David Hilbert', 'Hilbert', 'Georg Cantor', 'Cantor', 'Bernhard Riemann', 'Riemann',
        'John von Neumann', 'Von Neumann', 'Hermann Weyl', 'Weyl',
        'Boris Podolsky', 'Podolsky', 'Nathan Rosen', 'Rosen', 'EPR',
        'David Bohm', 'Bohm', 'John Bell', 'Bell', 'Rudolf Peierls', 'Peierls',
        'Alain Aspect', 'Aspect', 'John Clauser', 'Clauser', 'Anton Zeilinger', 'Zeilinger',
        'Artur Ekert', 'Ekert', 'Peter Shor', 'Shor', 'Satyendra Nath Bose', 'Bose',
        'Eric Cornell', 'Cornell', 'Carl Wieman', 'Wieman', 'Wolfgang Ketterle', 'Ketterle',
        'Steven Chu', 'Chu', 'Claude Cohen-Tannoudji', 'Cohen-Tannoudji',
        'William Phillips', 'Phillips', 'David Wineland', 'Wineland',
        'Rainer Blatt', 'Blatt', 'Mikhail Lukin', 'Lukin', 'Markus Greiner', 'Greiner',
        'Immanuel Bloch', 'Bloch', 'John Preskill', 'Preskill', 'Lov Grover', 'Grover',
        'Wojciech Zurek', 'Zurek', 'Juan Ignacio Cirac', 'Cirac',
        'Andrew Steane', 'Steane', 'Barbara Terhal', 'Terhal',
        'William Wootters', 'Wootters', 'Daniel Gottesman', 'Gottesman',
        'Michael Nielsen', 'Nielsen', 'Isaac Chuang', 'Chuang',
        'Jay Gambetta', 'Gambetta', 'Chris Monroe', 'Monroe', 'Chad Rigetti', 'Rigetti',
        'John Martinis', 'Martinis', 'Hartmut Neven', 'Neven',
        'Maria Schuld', 'Schuld', 'Nathan Wiebe', 'Wiebe',
        'Jian-Wei Pan', 'Pan', 'Nicolas Gisin', 'Gisin',
        'Richard Feynman', 'Feynman', 'David Deutsch', 'Deutsch',
        'Theodor Hänsch', 'Hänsch', 'Isidor Rabi', 'Rabi', 'Norman Ramsey', 'Ramsey',
        'Arthur Ashkin', 'Ashkin', 'Charles Townes', 'Townes',
        'Theodore Maiman', 'Maiman', 'John Bardeen', 'Bardeen',
        'Walter Brattain', 'Brattain', 'William Shockley', 'Shockley',
        'Carl Anderson', 'Anderson', 'Henry Rowland', 'Rowland'
    ];
    
    // Sort by length (longest first) to match compound names first
    names.sort((a, b) => b.length - a.length);
    
    let highlightedText = text;
    
    // Highlight each name (longest first to avoid partial matches)
    names.forEach(name => {
        // Escape special regex characters
        const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        // Use word boundaries for matching, but exclude matches inside HTML tags
        const regex = new RegExp(`\\b${escapedName}\\b`, 'gi');
        
        let match;
        const matches = [];
        
        // Find all matches with their positions
        while ((match = regex.exec(highlightedText)) !== null) {
            matches.push({
                text: match[0],
                index: match.index,
                length: match[0].length
            });
        }
        
        // Process matches in reverse order to maintain correct indices
        matches.reverse().forEach(m => {
            const beforeMatch = highlightedText.substring(0, m.index);
            const lastSpanOpen = beforeMatch.lastIndexOf('<span');
            const lastSpanClose = beforeMatch.lastIndexOf('</span>');
            
            // If there's an open span tag after the last closing tag, we're inside a span
            if (lastSpanOpen <= lastSpanClose) {
                // Not inside a span, so highlight it
                const before = highlightedText.substring(0, m.index);
                const after = highlightedText.substring(m.index + m.length);
                highlightedText = before + 
                    `<span class="highlighted-name" style="color: ${phaseColor}; font-weight: 600; text-shadow: 0 0 8px ${phaseColor};">${m.text}</span>` + 
                    after;
            }
        });
    });
    
    return highlightedText;
}

// ============================================================================
// SCIENTIFIC TERM HIGHLIGHTING
// ============================================================================

function highlightScientificTerms(text, phaseColor) {
    // List of scientific terms to highlight
    // Compound terms first (longest first) to match them before shorter variants
    const terms = [
        // Quantum mechanics
        'quantum mechanics', 'quantum computing', 'quantum computer', 'quantum algorithm',
        'quantum state', 'quantum superposition', 'quantum entanglement', 'quantum coherence',
        'quantum decoherence', 'quantum error correction', 'quantum teleportation',
        'quantum supremacy', 'quantum advantage', 'quantum information', 'quantum information theory',
        'quantum gate', 'quantum circuit', 'quantum bit', 'qubit', 'qubits',
        'wave-particle duality', 'uncertainty principle', 'Heisenberg uncertainty',
        'Schrödinger equation', 'wave function', 'quantum jump', 'quantum leap',
        'Bose-Einstein Condensate', 'Bose-Einstein Condensates', 'BEC',
        'photoelectric effect', 'blackbody radiation', 'atomic spectra', 'atomic spectrum',
        'energy level', 'energy levels', 'electron orbit', 'electron orbits',
        'quantized', 'quantization', 'quantum', 'quantumly',
        
        // Physics concepts
        'classical mechanics', 'classical physics', 'electromagnetic theory',
        'electromagnetic wave', 'electromagnetic waves', 'universal gravitation',
        'special relativity', 'general relativity', 'thermodynamics',
        'optics', 'wave optics', 'geometric optics', 'particle physics',
        'atomic physics', 'nuclear physics', 'statistical mechanics',
        'field theory', 'unified field theory', 'string theory',
        
        // Mathematical concepts - expanded
        'mathematical framework', 'mathematical description', 'mathematical physics',
        'mathematical harmony', 'mathematical laws', 'mathematical precision',
        'mathematical patterns', 'mathematical ratios', 'mathematical contortion',
        'mathematical tool', 'mathematical thinking', 'mathematical discovery',
        'differential equation', 'wave equation', 'Maxwell equations',
        'Pythagorean theorem', 'calculus', 'geometry', 'geometric',
        'algebra', 'algebraic', 'trigonometry', 'statistics', 'statistical',
        'probability', 'probabilistic', 'arithmetic', 'numeric', 'numerical',
        'deterministic', 'determinism', 'vector space', 'Hilbert space',
        'operator', 'operators', 'observable', 'observables',
        'mathematics', 'mathematical', 'number', 'numbers', 'ratio', 'ratios',
        'equation', 'equations', 'formula', 'formulas', 'calculation', 'calculations',
        'analytical geometry', 'algebraic notation',
        
        // Tools and instruments - expanded
        'telescope', 'telescopes', 'microscope', 'microscopes',
        'prism', 'prisms', 'laser', 'lasers', 'precision lasers',
        'trap', 'traps', 'magneto-optical trap', 'magneto-optical traps',
        'tweezer', 'tweezers', 'optical tweezers',
        'instrument', 'instruments', 'tool', 'tools', 'device', 'devices',
        'apparatus', 'equipment', 'machine', 'machines', 'mechanism', 'mechanisms',
        'clockwork mechanism', 'laboratory', 'laboratories',
        
        // Shapes and geometric forms
        'triangle', 'triangles', 'right triangle', 'right triangles',
        'circle', 'circles', 'perfect circles', 'circular',
        'ellipse', 'ellipses', 'square', 'squares',
        'angle', 'angles', 'line', 'lines', 'point', 'points',
        'shape', 'shapes', 'geometric', 'geometry',
        
        // Music and harmonics
        'music', 'musical', 'harmony', 'harmonics', 'harmonic',
        'interval', 'intervals', 'musical intervals', 'harmonious musical intervals',
        'lyre', 'string', 'strings', 'note', 'notes',
        'tone', 'tones', 'sound', 'sounds',
        
        // Experimental methods - expanded
        'experimental method', 'scientific method', 'hypothesis', 'hypotheses',
        'experiment', 'experiments', 'experimental', 'thought experiment', 'thought experiments',
        'observation', 'observations', 'observe', 'observing', 'observed',
        'systematic testing', 'peer review', 'reproducible', 'reproducibility',
        'laser cooling', 'optical molasses', 'atomic molasses',
        'Doppler cooling', 'Bose-Einstein',
        'test', 'testing', 'tested', 'measure', 'measurement', 'measurements',
        'data', 'evidence', 'proof', 'prove', 'proven', 'verify', 'verification',
        'validate', 'validation', 'discover', 'discovered', 'discovery', 'discoveries',
        'finding', 'findings', 'find', 'found',
        
        // Physical entities
        'photon', 'photons', 'electron', 'electrons', 'atom', 'atoms', 'atomic',
        'molecule', 'molecules', 'molecular', 'nucleus', 'nuclei',
        'wave', 'waves', 'particle', 'particles', 'particulate',
        'energy', 'frequency', 'frequencies', 'wavelength', 'wavelengths',
        'momentum', 'position', 'velocity', 'acceleration', 'force', 'forces',
        'mass', 'charge', 'spin', 'angular momentum',
        'heat', 'temperature', 'temperatures', 'cold', 'cooling', 'cooled',
        'freeze', 'freezing', 'absolute zero', 'kelvin', 'microkelvin',
        'thermal', 'power', 'pressure', 'pressures',
        
        // Light and vision
        'light', 'lights', 'illumination', 'illuminate',
        'vision', 'visual', 'sight', 'see', 'seeing', 'seen',
        'optics', 'optical', 'refraction', 'reflection', 'refract', 'reflect',
        'lens', 'lenses', 'mirror', 'mirrors', 'beam', 'beams', 'ray', 'rays',
        
        // Scientific processes
        'superposition', 'entanglement', 'entangled', 'coherence', 'decoherence',
        'interference', 'diffraction', 'refraction', 'reflection',
        'absorption', 'emission', 'radiation', 'spectrum', 'spectra',
        'resonance', 'oscillation', 'vibration', 'harmonic',
        
        // Theory and methodology
        'theory', 'theories', 'theoretical', 'law', 'laws',
        'principle', 'principles', 'concept', 'concepts',
        'idea', 'ideas', 'model', 'models', 'framework', 'frameworks',
        'method', 'methods', 'methodology', 'methodologies',
        'technique', 'techniques', 'process', 'processes',
        'approach', 'approaches', 'systematic approach', 'systematic framework',
        
        // Discovery and innovation
        'invention', 'inventions', 'invent', 'invented',
        'breakthrough', 'breakthroughs', 'advance', 'advances',
        'progress', 'development', 'developments',
        'innovation', 'innovations',
        
        // Celestial and astronomical
        'planet', 'planets', 'planetary', 'star', 'stars', 'stellar',
        'cosmos', 'cosmic', 'universe', 'universal', 'galaxy', 'galaxies',
        'solar', 'sun', 'earth', 'moon', 'moons',
        'orbit', 'orbits', 'orbital', 'motion', 'motions',
        'movement', 'movements', 'trajectory', 'trajectories',
        
        // Error correction and computation
        'error correction', 'fault-tolerant', 'fault tolerance',
        'no-cloning theorem', 'quantum error correction code',
        'algorithm', 'algorithms', 'computation', 'computational',
        'optimization', 'simulation', 'cryptography', 'cryptographic',
        
        // Measurement and observation
        'measurement', 'measurements', 'observer', 'observation',
        'collapse', 'wave function collapse', 'measurement problem',
        'Bell test', 'Bell inequality', 'hidden variables',
        
        // States and properties
        'ground state', 'excited state', 'quantum state',
        'coherent', 'incoherent', 'classical', 'quantum',
        'macroscopic', 'microscopic', 'atomic scale', 'quantum scale'
    ];
    
    // Sort by length (longest first) to match compound terms first
    terms.sort((a, b) => b.length - a.length);
    
    let highlightedText = text;
    
    // Highlight each term (longest first to avoid partial matches)
    terms.forEach(term => {
        // Escape special regex characters
        const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        // Use word boundaries for matching
        const regex = new RegExp(`\\b${escapedTerm}\\b`, 'gi');
        
        let match;
        const matches = [];
        
        // Find all matches with their positions
        while ((match = regex.exec(highlightedText)) !== null) {
            matches.push({
                text: match[0],
                index: match.index,
                length: match[0].length
            });
        }
        
        // Process matches in reverse order to maintain correct indices
        matches.reverse().forEach(m => {
            const beforeMatch = highlightedText.substring(0, m.index);
            const lastSpanOpen = beforeMatch.lastIndexOf('<span');
            const lastSpanClose = beforeMatch.lastIndexOf('</span>');
            
            // If there's an open span tag after the last closing tag, we're inside a span
            if (lastSpanOpen <= lastSpanClose) {
                // Not inside a span, so highlight it
                const before = highlightedText.substring(0, m.index);
                const after = highlightedText.substring(m.index + m.length);
                // Use a cyan/teal color for scientific terms (complementary to phase colors)
                const scientificColor = '#00CED1'; // Dark turquoise/cyan
                highlightedText = before + 
                    `<span class="highlighted-term" style="color: ${scientificColor}; font-weight: 500; text-shadow: 0 0 6px ${scientificColor}; font-style: italic;">${m.text}</span>` + 
                    after;
            }
        });
    });
    
    return highlightedText;
}

// ============================================================================
// MODAL
// ============================================================================

function showModal() {
    const phase = data.phases[currentPhaseIndex];
    const stage = phase.stages[currentStageIndex];
    
    elements.modalTitle.textContent = stage.title;
    elements.modalTitle.style.color = phase.color;
    
    elements.modalContent.innerHTML = '';
    elements.modalContent.style.color = phase.color;
    
    stage.details.forEach((detail, index) => {
        if (detail.trim() === '') {
            const spacer = document.createElement('div');
            spacer.className = 'modal-spacer';
            elements.modalContent.appendChild(spacer);
        } else if (detail.trim().endsWith(':')) {
            // Heading (ends with colon)
            const heading = document.createElement('h3');
            heading.className = 'modal-heading';
            heading.textContent = detail.trim();
            heading.style.color = phase.color;
            heading.style.borderLeftColor = phase.color;
            elements.modalContent.appendChild(heading);
        } else if (detail.trim().startsWith('•')) {
            // Bullet point
            const bullet = document.createElement('div');
            bullet.className = 'modal-bullet';
            const bulletText = detail.trim().substring(1).trim();
            // Highlight names and scientific terms in bullet text
            let highlightedBulletText = highlightNames(bulletText, phase.color);
            highlightedBulletText = highlightScientificTerms(highlightedBulletText, phase.color);
            bullet.innerHTML = `
                <span class="bullet-icon">•</span>
                <span class="bullet-text">${highlightedBulletText}</span>
            `;
            elements.modalContent.appendChild(bullet);
        } else if (detail.trim().startsWith('  -')) {
            // Sub-bullet (indented)
            const subBullet = document.createElement('div');
            subBullet.className = 'modal-bullet modal-bullet-sub';
            const subBulletText = detail.trim().substring(3).trim();
            // Highlight names and scientific terms in sub-bullet text
            let highlightedSubBulletText = highlightNames(subBulletText, phase.color);
            highlightedSubBulletText = highlightScientificTerms(highlightedSubBulletText, phase.color);
            subBullet.innerHTML = `
                <span class="bullet-icon">◦</span>
                <span class="bullet-text">${highlightedSubBulletText}</span>
            `;
            elements.modalContent.appendChild(subBullet);
        } else {
            // Regular paragraph - highlight names and scientific terms
            const p = document.createElement('p');
            p.className = 'modal-paragraph';
            // First highlight names, then highlight scientific terms
            let highlightedText = highlightNames(detail.trim(), phase.color);
            highlightedText = highlightScientificTerms(highlightedText, phase.color);
            p.innerHTML = highlightedText;
            elements.modalContent.appendChild(p);
        }
    });
    
    elements.modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    elements.modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

// ============================================================================
// MENU
// ============================================================================

function openMenu() {
    elements.slideMenu.classList.add('open');
    elements.menuOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    renderMenu();
}

function closeMenu() {
    elements.slideMenu.classList.remove('open');
    elements.menuOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

function renderMenu() {
    // Phases
    elements.menuPhaseList.innerHTML = '';
    data.phases.forEach((phase, index) => {
        const item = document.createElement('div');
        item.className = 'menu-item';
        if (index === currentPhaseIndex) item.classList.add('active');
        item.style.color = phase.color;
        item.innerHTML = `
            <div style="font-weight: 600; margin-bottom: 0.25rem;">${phase.name}</div>
            <div style="font-size: 0.8125rem; opacity: 0.7;">${phase.era}</div>
        `;
        item.addEventListener('click', () => {
            loadPhase(index);
            closeMenu();
        });
        elements.menuPhaseList.appendChild(item);
    });
    
    // Stages
    elements.menuStageList.innerHTML = '';
    const phase = data.phases[currentPhaseIndex];
    phase.stages.forEach((stage, index) => {
        const item = document.createElement('div');
        item.className = 'menu-item';
        if (index === currentStageIndex) item.classList.add('active');
        const match = stage.title.match(/^(\d+)\.\s*(.+)$/);
        const description = match ? (match[2].split(' - ')[1] || match[2]) : stage.title;
        item.innerHTML = `<strong>${index + 1}.</strong> ${description}`;
        item.style.color = phase.color;
        item.addEventListener('click', () => {
            currentStageIndex = index;
            updateDisplay();
            closeMenu();
        });
        elements.menuStageList.appendChild(item);
    });
}

function updateMenu() {
    document.querySelectorAll('.menu-phase-list .menu-item').forEach((item, index) => {
        if (index === currentPhaseIndex) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
    document.querySelectorAll('.menu-stage-list .menu-item').forEach((item, index) => {
        if (index === currentStageIndex) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

// ============================================================================
// EVENT LISTENERS
// ============================================================================

function setupEventListeners() {
    elements.prevBtn.addEventListener('click', () => {
        if (currentStageIndex > 0) {
            currentStageIndex--;
            updateDisplay();
        }
    });
    
    elements.nextBtn.addEventListener('click', () => {
        const phase = data.phases[currentPhaseIndex];
        if (currentStageIndex < phase.stages.length - 1) {
            currentStageIndex++;
            updateDisplay();
        }
    });
    
    elements.detailsBtn.addEventListener('click', showModal);
    elements.closeModalBtn.addEventListener('click', closeModal);
    elements.modalOverlay.addEventListener('click', (e) => {
        if (e.target === elements.modalOverlay) closeModal();
    });
    
    elements.menuBtn.addEventListener('click', openMenu);
    elements.closeMenuBtn.addEventListener('click', closeMenu);
    elements.menuOverlay.addEventListener('click', closeMenu);
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft' && !elements.prevBtn.disabled) {
            elements.prevBtn.click();
        } else if (e.key === 'ArrowRight' && !elements.nextBtn.disabled) {
            elements.nextBtn.click();
        } else if (e.key === 'Escape') {
            closeModal();
            closeMenu();
        } else if (e.key === 'd' || e.key === 'D') {
            if (!elements.modalOverlay.classList.contains('active')) {
                showModal();
            }
        }
    });
    
    window.addEventListener('resize', () => {
        resizeSVG();
        updateDisplay();
    });
}

// ============================================================================
// INITIALIZATION
// ============================================================================

async function init() {
    try {
        const response = await fetch('data.json');
        data = await response.json();
        
        initSVG();
        renderPhaseSelector();
        renderTimeline();
        setupEventListeners();
        
        loadPhase(0);
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

// Start
init();
