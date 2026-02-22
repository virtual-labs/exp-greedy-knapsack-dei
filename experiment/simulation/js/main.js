// DOM Elements
const autoPlayBtn = document.getElementById('autoPlayBtn');
const pauseBtn = document.getElementById('pauseBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const resetBtn = document.getElementById('resetBtn');
const randomBtn = document.getElementById('randomBtn');
const speedSlider = document.getElementById('speedSlider');
const itemsContainer = document.getElementById('itemsContainer');
const logArea = document.getElementById('logArea');
const resultBody = document.getElementById('resultBody');
const totalValueDisplay = document.getElementById('totalValueCheck');
const currentWeightDisplay = document.getElementById('currentWeightDisplay');
const capacityDisplay = document.getElementById('capacityDisplay');
const knapsackFill = document.getElementById('knapsackFill');
const statusTag = document.getElementById('statusTag');

// State
let items = [];
let capacity = 50;
let animationSpeed = 800;
let isRunning = false;
let isPaused = false;
let autoPlayTimer = null;

let simulationTrace = [];
let currentStepIndex = 0;

// Event Listeners
window.onload = () => {
    if (autoPlayBtn) autoPlayBtn.addEventListener('click', startAutoPlay);
    if (pauseBtn) pauseBtn.addEventListener('click', pauseSimulation);
    if (nextBtn) nextBtn.addEventListener('click', nextStep);
    if (prevBtn) prevBtn.addEventListener('click', prevStep);
    if (resetBtn) resetBtn.addEventListener('click', resetSimulation);
    if (randomBtn) randomBtn.addEventListener('click', randomizeInputs);

    if (speedSlider) {
        speedSlider.addEventListener('input', (e) => {
            const val = parseInt(e.target.value);
            animationSpeed = 2200 - val;
            if (animationSpeed < 200) animationSpeed = 200;
        });
    }
};

// Initialization
function randomizeInputs() {
    // Generate between 3 and 10 items
    const numItems = Math.floor(Math.random() * 8) + 3;
    const newWeights = [];
    const newValues = [];

    for (let i = 0; i < numItems; i++) {
        // Weights 5 to 60
        newWeights.push(Math.floor(Math.random() * 55) + 5);
        // Values 20 to 200
        newValues.push(Math.floor(Math.random() * 180) + 20);
    }
    document.getElementById('weights').value = newWeights.join(', ');
    document.getElementById('values').value = newValues.join(', ');

    // Capacity 30 to 150
    document.getElementById('capacity').value = Math.floor(Math.random() * 120) + 30;

    resetSimulation();
}

function resetSimulation() {
    stopTimer();
    isRunning = false;
    isPaused = false;
    currentStepIndex = 0;
    simulationTrace = [];

    // UI Resets
    itemsContainer.innerHTML = '';
    knapsackFill.innerHTML = '';
    knapsackFill.style.width = '0%';
    logArea.innerHTML = '';
    resultBody.innerHTML = '';
    totalValueDisplay.innerText = '0';
    currentWeightDisplay.innerText = '0';
    statusTag.innerText = 'Ready';
    statusTag.style.background = '#d1fae5';
    statusTag.style.color = '#065f46';

    toggleInputs(true);
    document.querySelectorAll('.steps-list li').forEach(li => li.classList.remove('active-step'));

    autoPlayBtn.classList.remove('faded');
    prevBtn.classList.remove('faded');
    nextBtn.classList.remove('faded');
    randomBtn.classList.remove('faded');
    pauseBtn.classList.remove('faded');
    pauseBtn.disabled = false;
    nextBtn.disabled = false;
    prevBtn.disabled = false;
}

function toggleInputs(enabled) {
    // Disable weight, value, and capacity inputs but keep speed slider enabled
    document.getElementById('weights').disabled = !enabled;
    document.getElementById('values').disabled = !enabled;
    document.getElementById('capacity').disabled = !enabled;

    autoPlayBtn.disabled = !enabled;
    resetBtn.disabled = false;
    randomBtn.disabled = !enabled;

    // Speed slider should always be enabled
    if (speedSlider) speedSlider.disabled = false;
}
function initializeSimulation() {
    try {
        capacity = parseFloat(document.getElementById('capacity').value);
        const wStr = document.getElementById('weights').value.trim();
        const vStr = document.getElementById('values').value.trim();

        if (!wStr || !vStr) {
            alert("Please provide both Weights and Values.");
            return false;
        }

        const wNodes = wStr.split(',').map(item => parseFloat(item.trim()));
        const vNodes = vStr.split(',').map(item => parseFloat(item.trim()));

        capacityDisplay.innerText = capacity;

        // --- CONSTRAINTS / VALIDATION ---
        const MAX_CAPACITY = 200;
        const MAX_ITEMS = 15;
        const MAX_WEIGHT = 100;
        const MAX_VALUE = 2000;

        if (isNaN(capacity) || capacity <= 0) {
            alert("Please enter a valid Knapsack Capacity greater than 0.");
            return false;
        }

        if (capacity > MAX_CAPACITY) {
            alert(`Capacity exceeds the maximum limit of ${MAX_CAPACITY} for proper visualization.`);
            return false;
        }

        if (wNodes.length !== vNodes.length) {
            alert("Number of Item Weights and Item Values must be equal.");
            return false;
        }

        if (wNodes.length > MAX_ITEMS) {
            alert(`Too many items! Please limits items to ${MAX_ITEMS} or fewer for best display.`);
            return false;
        }

        if (wNodes.some(isNaN) || vNodes.some(isNaN)) {
            alert("Please ensure all weights and values are valid numbers.");
            return false;
        }

        if (wNodes.some(w => w <= 0) || vNodes.some(v => v < 0)) {
            alert("Item weights must be positive, and values cannot be negative.");
            return false;
        }

        if (wNodes.some(w => w > MAX_WEIGHT)) {
            alert(`Some weights exceed the maximum limit of ${MAX_WEIGHT}.`);
            return false;
        }

        if (vNodes.some(v => v > MAX_VALUE)) { // Soft limit for values just in case
            alert(`Some values are very high (>${MAX_VALUE}), consider smaller numbers.`);
            return false;
        }

        // -------------------------------

        // Dynamic visual height normalization
        const maxW = Math.max(...wNodes);

        items = wNodes.map((w, i) => ({
            id: i + 1,
            weight: w,
            value: vNodes[i],
            ratio: (vNodes[i] / w),
            color: `hsl(${i * 60}, 70%, 60%)`,
            // Fixed constant height for all items
            visHeight: 30
        }));

        renderItems(items);
        simulationTrace = generateTrace(items, capacity);
        isRunning = true;
        toggleInputs(false);

        return true;
    } catch (e) {
        log(`Error: ${e.message}`, 'error');
        console.error(e);
        return false;
    }
}

function generateTrace(initialItems, maxCap) {
    const trace = [];
    let currentCap = 0;
    let totalVal = 0;

    let simItems = JSON.parse(JSON.stringify(initialItems));

    trace.push({
        type: 'INIT',
        items: JSON.parse(JSON.stringify(simItems)),
        highlightLine: 'step-0',
        log: "Simulation Initialized. Calculating Ratios...",
        knapsackPct: 0,
        knapsackSegments: [],
        currentW: 0,
        totalV: 0,
        tableRows: []
    });

    simItems.sort((a, b) => b.ratio - a.ratio);
    trace.push({
        type: 'SORT',
        items: JSON.parse(JSON.stringify(simItems)),
        highlightLine: 'step-1',
        log: "Items sorted by Value/Weight Ratio (Descending).",
        knapsackPct: 0,
        knapsackSegments: [],
        currentW: 0,
        totalV: 0,
        tableRows: []
    });

    let currentSegments = [];
    let currentRows = [];

    for (let i = 0; i < simItems.length; i++) {
        let item = simItems[i];

        trace.push({
            type: 'CHECK',
            items: JSON.parse(JSON.stringify(simItems)),
            activeItemId: item.id,
            highlightLine: 'step-2',
            log: `Checking Item ${item.id} (W:${item.weight}, V:${item.value}, R:${item.ratio.toFixed(2)})`,
            knapsackPct: (currentCap / maxCap) * 100,
            knapsackSegments: JSON.parse(JSON.stringify(currentSegments)),
            currentW: currentCap,
            totalV: totalVal,
            tableRows: JSON.parse(JSON.stringify(currentRows))
        });

        if (currentCap + item.weight <= maxCap) {
            currentCap += item.weight;
            totalVal += item.value;

            currentSegments.push({ width: (item.weight / maxCap) * 100, color: item.color, text: `Item ${item.id}`, striped: false });
            currentRows.push({ id: item.id, pct: '100%', val: item.value });

            trace.push({
                type: 'TAKE_FULL',
                items: JSON.parse(JSON.stringify(simItems)),
                activeItemId: item.id,
                takenItemId: item.id,
                highlightLine: 'step-3',
                log: `Fits in knapsack. Taking FULL Item ${item.id}.`,
                knapsackPct: (currentCap / maxCap) * 100,
                knapsackSegments: JSON.parse(JSON.stringify(currentSegments)),
                currentW: currentCap,
                totalV: totalVal,
                tableRows: JSON.parse(JSON.stringify(currentRows))
            });
        } else {
            let remain = maxCap - currentCap;
            let fraction = remain / item.weight;
            let valToAdd = item.value * fraction;

            currentCap += remain;
            totalVal += valToAdd;

            currentSegments.push({ width: (remain / maxCap) * 100, color: item.color, text: `Item ${item.id} (${(fraction * 100).toFixed(0)}%)`, striped: true });
            currentRows.push({ id: item.id, pct: `${(fraction * 100).toFixed(1)}%`, val: valToAdd.toFixed(2) });

            trace.push({
                type: 'TAKE_FRAC',
                items: JSON.parse(JSON.stringify(simItems)),
                activeItemId: item.id,
                takenItemId: item.id,
                highlightLine: 'step-4',
                log: `Knapsack nearly full. Taking ${(fraction * 100).toFixed(1)}% of Item ${item.id}.`,
                knapsackPct: 100,
                knapsackSegments: JSON.parse(JSON.stringify(currentSegments)),
                currentW: currentCap,
                totalV: totalVal,
                tableRows: JSON.parse(JSON.stringify(currentRows))
            });

            break;
        }
    }

    trace.push({
        type: 'FINISH',
        items: JSON.parse(JSON.stringify(simItems)),
        highlightLine: null,
        log: `Simulation Complete. Max Value: ₹${totalVal.toFixed(2)}`,
        knapsackPct: (currentCap / maxCap) * 100,
        knapsackSegments: JSON.parse(JSON.stringify(currentSegments)),
        currentW: currentCap,
        totalV: totalVal,
        tableRows: JSON.parse(JSON.stringify(currentRows)),
        finished: true
    });

    return trace;
}

// RUNTIME CONTROLS
function startAutoPlay() {
    // Prevent autoplay if simulation is already completed
    if (isRunning && currentStepIndex >= simulationTrace.length - 1) {
        return;
    }

    if (!isRunning) {
        if (!initializeSimulation()) return;
    }

    isPaused = false;
    statusTag.innerText = 'Running...';
    statusTag.style.background = '#fef3c7';
    statusTag.style.color = '#d97706';

    autoPlayBtn.disabled = true;
    prevBtn.disabled = true;
    nextBtn.disabled = true;


    prevBtn.classList.add('faded');
    nextBtn.classList.add('faded');
    randomBtn.classList.add('faded');

    pauseBtn.disabled = false;
    pauseBtn.classList.remove('faded');

    runTimer();
}

function stopTimer() {
    if (autoPlayTimer) clearTimeout(autoPlayTimer);
    autoPlayTimer = null;
}

function runTimer() {
    stopTimer();
    autoPlayTimer = setTimeout(() => {
        if (isPaused) return;

        if (currentStepIndex < simulationTrace.length - 1) {
            currentStepIndex++;
            renderStep(currentStepIndex);
            runTimer();
        } else {
            autoPlayBtn.disabled = true;
            prevBtn.disabled = false;
            nextBtn.disabled = true;
            pauseBtn.disabled = true;

            prevBtn.classList.remove('faded');
            nextBtn.classList.remove('faded');
            autoPlayBtn.classList.add('faded');
            pauseBtn.classList.add('faded');
        }
    }, animationSpeed);
}

function pauseSimulation() {
    isPaused = true;
    stopTimer();
    statusTag.innerText = 'Paused';
    statusTag.style.background = '#e2e8f0';
    statusTag.style.color = '#475569';

    autoPlayBtn.disabled = false;
    prevBtn.disabled = false;
    nextBtn.disabled = false;

    autoPlayBtn.classList.remove('faded');
    prevBtn.classList.remove('faded');
    nextBtn.classList.remove('faded');
}

function nextStep() {
    if (!isRunning) {
        if (!initializeSimulation()) return;
    }
    pauseSimulation();

    if (currentStepIndex < simulationTrace.length - 1) {
        currentStepIndex++;
        renderStep(currentStepIndex);

        // Re-enable pause button when stepping
        pauseBtn.disabled = false;
        pauseBtn.classList.remove('faded');
    } else {
        // If we're at the end, disable next button
        nextBtn.disabled = true;
        nextBtn.classList.add('faded');
    }
}


function prevStep() {
    if (!isRunning) return;
    pauseSimulation();

    if (currentStepIndex > 0) {
        currentStepIndex--;
        renderStep(currentStepIndex);

        pauseBtn.disabled = false;
        pauseBtn.classList.remove('faded');
    }
}

// RENDERING
function renderStep(index) {
    if (index < 0 || index >= simulationTrace.length) return;

    const state = simulationTrace[index];

    renderItems(state.items, state.activeItemId, alreadyTakenIds(index));

    document.querySelectorAll('.steps-list li').forEach(li => li.classList.remove('active-step'));
    if (state.highlightLine) {
        document.getElementById(state.highlightLine).classList.add('active-step');
    }

    logArea.innerHTML = '';
    for (let i = 0; i <= index; i++) {
        log(simulationTrace[i].log, i === index);
    }

    // Clear knapsack and rebuild with item names
    knapsackFill.innerHTML = '';
    state.knapsackSegments.forEach(seg => {
        addKnapsackSegment(seg);
    });
    
    // Animate fill width
    setTimeout(() => {
        knapsackFill.style.width = state.knapsackPct + '%';
    }, 10);

currentWeightDisplay.innerText = state.currentW.toFixed(1);
totalValueDisplay.innerText = state.totalV.toFixed(2);
capacityDisplay.innerText = capacity;

// Add tooltip to the knapsack label - simpler approach
const knapsackContainer = document.querySelector('.knapsack-container');

if (knapsackContainer) {
    knapsackContainer.title =
        `Knapsack (${state.currentW.toFixed(1)} / ${capacity})
         ≡ Covered Capacity / Total Capacity`;
}


    resultBody.innerHTML = '';
    state.tableRows.forEach(row => {
        resultBody.innerHTML += `
            <tr>
                <td>Item ${row.id}</td>
                <td>${row.pct}</td>
                <td>₹${row.val}</td>
            </tr>
        `;
    });
    
    // Auto-scroll result table to show latest items
    const resultDetails = document.querySelector('.result-details');
    if (resultDetails) {
        setTimeout(() => {
            resultDetails.scrollTop = resultDetails.scrollHeight;
        }, 10);
    }

    if (state.finished) {
    statusTag.innerText = 'Completed';
    statusTag.style.background = '#dcfce7';
    statusTag.style.color = '#15803d';

    autoPlayBtn.disabled = true;
    pauseBtn.disabled = true;
    nextBtn.disabled = true;

    autoPlayBtn.classList.add('faded');
    pauseBtn.classList.add('faded');
    nextBtn.classList.add('faded');
    prevBtn.classList.remove('faded');

    // 🔹 SHOW EXPLANATION IF KNAPSACK NOT FULL
    if (state.currentW < capacity) {
        setTimeout(showKnapsackPopup, 500);
    }
}
    
}

function alreadyTakenIds(currentIndex) {
    const state = simulationTrace[currentIndex];
    const set = new Set();
    state.tableRows.forEach(r => set.add(r.id));
    return set;
}

function renderItems(itemsList, activeId, takenSet) {
    itemsContainer.innerHTML = '';
    itemsList.forEach((item) => {
        const div = document.createElement('div');
        div.className = 'item-card';
        if (item.id === activeId) div.classList.add('active');
        if (takenSet && takenSet.has(item.id)) div.classList.add('taken');

        div.innerHTML = `
            <div class="item-visual" style="height: ${item.visHeight}px; background: ${item.color};">
                ₹${item.value}
            </div>
            <div class="item-info">W: ${item.weight}</div>
            <div class="item-ratio">R: ${item.ratio.toFixed(2)}</div>
            <div style="font-size: 0.6rem; color: #94a3b8;">Item ${item.id}</div>
        `;
        itemsContainer.appendChild(div);
    });
}

function addKnapsackSegment(seg) {
    const segment = document.createElement('div');
    segment.style.width = seg.width + '%';
    segment.style.height = '100%';
    segment.style.backgroundColor = seg.color;
    segment.style.boxShadow = 'inset 0 0 10px rgba(0,0,0,0.1)';
    segment.style.display = 'flex';
    segment.style.alignItems = 'center';
    segment.style.justifyContent = 'center';
    segment.style.color = 'white';
    segment.style.fontSize = '0.7rem';
    segment.style.fontWeight = 'bold';
    segment.style.textShadow = '1px 1px 2px rgba(0,0,0,0.5)';

    // Show item name if segment is wide enough
    if (seg.width > 8) {
        segment.innerText = seg.text;
    }

    knapsackFill.appendChild(segment);
}

function log(msg, isLatest) {
    const div = document.createElement('div');
    div.innerText = `> ${msg}`;
    if (isLatest) div.style.fontWeight = 'bold';
    logArea.appendChild(div);
    logArea.scrollTop = logArea.scrollHeight;
}
function showKnapsackPopup() {
    const popup = document.getElementById('knapsackPopup');
    if (popup) popup.style.display = 'block';
}

function closeKnapsackPopup() {
    const popup = document.getElementById('knapsackPopup');
    if (popup) popup.style.display = 'none';
}
