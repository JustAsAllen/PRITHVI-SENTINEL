/**
 * PRITHVI SENTINEL - CNN Feature Map & Deep Pipeline Stepper
 */
const CNNSimulation = (() => {
    let isRunning = false;

    const init = () => {
        generateFeatureMapDOM();
        initLatentBars();
    };

    const generateFeatureMapDOM = () => {
        const g1 = document.getElementById('fmap-grid-1');
        const g2 = document.getElementById('fmap-grid-2');
        if (!g1 || !g2) return;

        g1.innerHTML = '';
        g2.innerHTML = '';

        for (let i = 0; i < 4; i++) {
            g1.innerHTML += `<canvas class="fmap-cell" id="fmap1-${i}" width="32" height="32"></canvas>`;
            g2.innerHTML += `<canvas class="fmap-cell" id="fmap2-${i}" width="32" height="32"></canvas>`;
        }
        drawDummyFeatures();
    };

    const drawDummyFeatures = () => {
        for (let i = 0; i < 4; i++) {
            const c1 = document.getElementById(`fmap1-${i}`);
            const c2 = document.getElementById(`fmap2-${i}`);
            if (c1) renderRandomNoise(c1, '#00f0ff');
            if (c2) renderRandomNoise(c2, '#9d4edd');
        }
    };

    const renderRandomNoise = (canvas, tintHex) => {
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = "#090d16";
        ctx.fillRect(0, 0, 32, 32);

        for (let x = 0; x < 32; x += 4) {
            for (let y = 0; y < 32; y += 4) {
                if (Math.random() > 0.45) {
                    ctx.fillStyle = tintHex;
                    ctx.globalAlpha = Math.random() * 0.7;
                    ctx.fillRect(x, y, 4, 4);
                }
            }
        }
        ctx.globalAlpha = 1.0;
    };

    const initLatentBars = () => {
        const wrap = document.getElementById('latent-bars');
        if (!wrap) return;
        wrap.innerHTML = '';
        for (let i = 0; i < 16; i++) {
            wrap.innerHTML += `<div class="latent-bar" id="lbar-${i}" style="height: ${Math.random()*70 + 10}%;"></div>`;
        }
    };

    const runFullInference = (incident, onComplete) => {
        if (isRunning) return;
        isRunning = true;

        const pBar = document.getElementById('pipeline-progress-bar');
        const pStatus = document.getElementById('pipeline-status-text');
        const laser = document.getElementById('analysis-laser');
        const nodes = ['node-input', 'node-conv1', 'node-conv2', 'node-latent', 'node-output'];

        // Reset elements
        nodes.forEach(n => document.getElementById(n)?.classList.remove('active-stage'));
        document.getElementById('terminal-classification').innerText = 'ANALYZING';
        document.getElementById('terminal-conf').innerText = '--.-%';
        laser.classList.add('scanning');

        let step = 0;
        const interval = setInterval(() => {
            // Unhighlight previous
            if (step > 0 && step <= nodes.length) {
                document.getElementById(nodes[step - 1])?.classList.remove('active-stage');
            }

            if (step < nodes.length) {
                const nodeEl = document.getElementById(nodes[step]);
                if (nodeEl) nodeEl.classList.add('active-stage');

                if (step === 0) pStatus.innerText = 'PREPROCESSING: TENSOR NORMALIZATION';
                if (step === 1) {
                    pStatus.innerText = 'CONV2D_1: LOW-LEVEL EDGE & SWIR ACTIVATION';
                    drawDummyFeatures();
                }
                if (step === 2) {
                    pStatus.innerText = 'CONV2D_2: HIGH-ORDER DEEP SPATIAL SCAR EXTRACTION';
                    drawDummyFeatures();
                }
                if (step === 3) {
                    pStatus.innerText = 'DENSE EMBEDDING: MULTI-SPECTRAL ATTENTION POOLING';
                    for (let i = 0; i < 16; i++) {
                        const bar = document.getElementById(`lbar-${i}`);
                        if (bar) bar.style.height = `${Math.random()*85 + 15}%`;
                    }
                }

                pBar.style.width = `${((step + 1) / nodes.length) * 100}%`;
                step++;
            } else {
                clearInterval(interval);
                laser.classList.remove('scanning');

                // Terminal Reveal
                const termVerdict = document.getElementById('terminal-classification');
                const termConf = document.getElementById('terminal-conf');
                const isDetected = incident.status === "CONFIRMED";
                termVerdict.innerText = isDetected ? "FIRE DETECTED" : "NO DETECTION";
                termVerdict.style.color = isDetected ? "var(--neon-red)" : "var(--neon-green)";
                termConf.innerText = `${incident.confidence}%`;

                pStatus.innerText = isDetected ? 'INFERENCE COMPLETE // FIRE CONFIRMED' : 'INFERENCE COMPLETE';
                isRunning = false;
                if (onComplete) onComplete(isDetected);
            }
        }, 650);
    };

    return {
        init,
        runFullInference
    };
})();