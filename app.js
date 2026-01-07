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
        // Reduced by 50% from 45 to 22.5
        const labelY = isLowest ? y + 22.5 : y - 22.5;
        
        // Font size: 50% larger for highest dot
        const fontSize = isHighest ? '0.75rem' : '0.5rem';
        
        // Create text element (no background bubble)
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', x);
        text.setAttribute('y', labelY);
        text.setAttribute('class', 'stage-label');
        if (index === currentStageIndex) text.classList.add('active');
        text.setAttribute('fill', index === currentStageIndex ? '#ffd700' : phase.color);
        text.setAttribute('font-size', fontSize);
        text.setAttribute('font-weight', index === currentStageIndex ? '600' : '500');
        text.setAttribute('text-anchor', 'middle');
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
            bullet.innerHTML = `
                <span class="bullet-icon">•</span>
                <span class="bullet-text">${bulletText}</span>
            `;
            elements.modalContent.appendChild(bullet);
        } else if (detail.trim().startsWith('  -')) {
            // Sub-bullet (indented)
            const subBullet = document.createElement('div');
            subBullet.className = 'modal-bullet modal-bullet-sub';
            const subBulletText = detail.trim().substring(3).trim();
            subBullet.innerHTML = `
                <span class="bullet-icon">◦</span>
                <span class="bullet-text">${subBulletText}</span>
            `;
            elements.modalContent.appendChild(subBullet);
        } else {
            // Regular paragraph
            const p = document.createElement('p');
            p.className = 'modal-paragraph';
            p.textContent = detail.trim();
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
