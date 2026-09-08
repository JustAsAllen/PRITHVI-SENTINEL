/**
 * PRITHVI SENTINEL - Synthetic Satellite & Grad-CAM Image Generator
 */
const ImageAnalysis = (() => {
    let currentIncident = null;
    let currentMode = "original";

    const init = () => {
        setupSliderDrag();
    };

    const renderIncidentVisuals = (incident) => {
        currentIncident = incident;
        renderAnalysisCanvas();
        renderTemporalCanvases();
        renderMiniInput();
    };

    const setMode = (mode) => {
        currentMode = mode;
        renderAnalysisCanvas();
    };

    // Synthesize Satellite Imagery & Grad-CAM Overlays dynamically on HTML5 Canvas
    const renderAnalysisCanvas = () => {
        const canvas = document.getElementById('analysis-canvas');
        if (!canvas || !currentIncident) return;
        const ctx = canvas.getContext('2d');
        const w = canvas.width, h = canvas.height;
        const { cx, cy, r } = currentIncident.burnCoords;

        ctx.clearRect(0, 0, w, h);

        // 1. Base Agriculture Field Textures
        drawSatelliteBase(ctx, w, h);

        // 2. Render State based on Mode
        if (currentMode === "original") {
            drawBurnScar(ctx, cx, cy, r, 0.95);
            toggleBBox(false);
        } 
        else if (currentMode === "attention") {
            drawBurnScar(ctx, cx, cy, r, 0.4);
            // Attention beam
            const grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, r * 1.8);
            grad.addColorStop(0, 'rgba(0, 240, 255, 0.85)');
            grad.addColorStop(0.5, 'rgba(157, 78, 221, 0.4)');
            grad.addColorStop(1, 'transparent');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);
            toggleBBox(true);
        } 
        else if (currentMode === "heatmap") {
            drawBurnScar(ctx, cx, cy, r, 0.2);
            // Jet Colormap simulation
            const grad = ctx.createRadialGradient(cx, cy, 5, cx, cy, r * 1.5);
            grad.addColorStop(0, 'rgba(255, 0, 0, 0.9)');
            grad.addColorStop(0.3, 'rgba(255, 255, 0, 0.7)');
            grad.addColorStop(0.6, 'rgba(0, 255, 0, 0.5)');
            grad.addColorStop(0.85, 'rgba(0, 0, 255, 0.3)');
            grad.addColorStop(1, 'transparent');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);
            toggleBBox(true);
        } 
        else if (currentMode === "mask") {
            // Binary Segmentation Mask
            ctx.fillStyle = "#000000";
            ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = "#00ff88";
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.fill();
            toggleBBox(true);
        }
    };

    const drawSatelliteBase = (ctx, w, h) => {
        // Procedural satellite farm parcels
        ctx.fillStyle = "#1b281b";
        ctx.fillRect(0, 0, w, h);

        ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
        ctx.lineWidth = 1;

        for (let x = 0; x < w; x += 40) {
            for (let y = 0; y < h; y += 40) {
                const shade = (Math.sin(x) * Math.cos(y) + 1) * 20;
                ctx.fillStyle = `rgb(${20 + shade}, ${45 + shade * 1.5}, ${20 + shade})`;
                ctx.fillRect(x, y, 38, 38);
            }
        }
    };

    const drawBurnScar = (ctx, cx, cy, r, alpha) => {
        ctx.save();
        ctx.globalAlpha = alpha;
        // Irregular charred perimeter
        ctx.fillStyle = "#0c0806";
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();

        // Active glowing embers
        const ember = ctx.createRadialGradient(cx, cy, 2, cx, cy, r * 0.7);
        ember.addColorStop(0, '#ff8c00');
        ember.addColorStop(0.4, '#ff2d55');
        ember.addColorStop(1, 'transparent');
        ctx.fillStyle = ember;
        ctx.beginPath();
        ctx.arc(cx, cy, r * 0.7, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    };

    const toggleBBox = (show) => {
        const bbox = document.getElementById('analysis-bbox');
        if (!bbox || !currentIncident) return;
        if (show) {
            bbox.style.display = 'block';
            document.getElementById('bbox-tag').innerText = 
                `BURN CLUSTER [${(currentIncident.confidence / 100).toFixed(3)}]`;
        } else {
            bbox.style.display = 'none';
        }
    };

    const renderTemporalCanvases = () => {
        const cBefore = document.getElementById('canvas-before');
        const cAfter = document.getElementById('canvas-after');
        if (!cBefore || !cAfter || !currentIncident) return;

        const ctxB = cBefore.getContext('2d');
        const ctxA = cAfter.getContext('2d');
        const { cx, cy, r } = currentIncident.burnCoords;

        // Before: Lush green parcel
        drawSatelliteBase(ctxB, 512, 512);

        // After: Scorched Earth
        drawSatelliteBase(ctxA, 512, 512);
        drawBurnScar(ctxA, cx, cy, r, 1.0);
    };

    const renderMiniInput = () => {
        const mini = document.getElementById('canvas-input-mini');
        if (!mini || !currentIncident) return;
        const ctx = mini.getContext('2d');
        drawSatelliteBase(ctx, 80, 80);
        const { cx, cy, r } = currentIncident.burnCoords;
        drawBurnScar(ctx, cx * 80/512, cy * 80/512, r * 80/512, 1.0);
    };

    const setupSliderDrag = () => {
        const container = document.getElementById('slider-box');
        const afterLayer = document.getElementById('slider-after-layer');
        const handle = document.getElementById('slider-handle');

        let isDown = false;
        const move = (e) => {
            if (!isDown) return;
            const rect = container.getBoundingClientRect();
            const clientX = e.clientX || (e.touches && e.touches[0].clientX);
            let pos = ((clientX - rect.left) / rect.width) * 100;
            pos = Math.max(0, Math.min(100, pos));

            afterLayer.style.clipPath = `polygon(${pos}% 0, 100% 0, 100% 100%, ${pos}% 100%)`;
            handle.style.left = `${pos}%`;
        };

        handle.addEventListener('mousedown', () => isDown = true);
        window.addEventListener('mouseup', () => isDown = false);
        window.addEventListener('mousemove', move);

        handle.addEventListener('touchstart', () => isDown = true);
        window.addEventListener('touchend', () => isDown = false);
        window.addEventListener('touchmove', move);
    };

    return {
        init,
        renderIncidentVisuals,
        setMode
    };
})();