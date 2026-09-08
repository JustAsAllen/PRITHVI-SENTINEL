/**
 * PRITHVI SENTINEL - Charts Engine (All Tabs)
 */
const ChartsEngine = (() => {
    let trainChart = null;
    let burnHistoryChart = null;
    let spectralChart = null;
    let compChart = null;
    let globalBurnChart = null;
    let globalCo2Chart = null;
    let timelineChart = null;

    const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const chartDefaults = {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        scales: {
            y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#94A3B8', font: { family: "'JetBrains Mono', monospace", size: 10 } } },
            x: { grid: { display: false }, ticks: { color: '#94A3B8', font: { family: "'JetBrains Mono', monospace", size: 9 } } }
        },
        plugins: { legend: { display: false } }
    };

    const init = () => {
        Chart.defaults.color = '#526074';
        Chart.defaults.font.family = "'JetBrains Mono', monospace";
        initTrainingChart();
        initPlumeSimulation();
        initMonitorCharts();
        initGlobalCharts();
    };

    // Training accuracy chart
    const initTrainingChart = () => {
        const ctx = document.getElementById('trainChart')?.getContext('2d');
        if (!ctx) return;

        trainChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: SENTINEL_DATA.modelPerformance.epochs,
                datasets: [
                    {
                        label: 'Training Accuracy',
                        data: SENTINEL_DATA.modelPerformance.trainAcc,
                        borderColor: '#00f0ff',
                        backgroundColor: 'rgba(0, 240, 255, 0.05)',
                        borderWidth: 2, tension: 0.3, fill: true, pointRadius: 3
                    },
                    {
                        label: 'Validation Accuracy',
                        data: SENTINEL_DATA.modelPerformance.valAcc,
                        borderColor: '#9d4edd',
                        borderDash: [4, 4],
                        borderWidth: 2, tension: 0.3, pointRadius: 0
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'top', labels: { boxWidth: 12 } } },
                scales: {
                    x: { grid: { color: 'rgba(255, 255, 255, 0.03)' } },
                    y: { min: 60, max: 100, grid: { color: 'rgba(255, 255, 255, 0.05)' } }
                }
            }
        });
    };

    // Smoke plume dispersion canvas
    const initPlumeSimulation = () => {
        const canvas = document.getElementById('plume-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let offset = 0;

        const renderPlume = () => {
            const w = canvas.width, h = canvas.height;
            ctx.clearRect(0, 0, w, h);

            ctx.fillStyle = "#ff2d55";
            ctx.beginPath();
            ctx.arc(80, h / 2, 4, 0, Math.PI * 2);
            ctx.fill();

            for (let i = 0; i < 40; i++) {
                const x = 80 + i * 20;
                const spread = (i * 3.5);
                const y = h / 2 + Math.sin(i * 0.3 + offset) * 15;

                const grad = ctx.createRadialGradient(x, y, 2, x, y, spread);
                grad.addColorStop(0, 'rgba(255, 140, 0, 0.25)');
                grad.addColorStop(0.5, 'rgba(255, 45, 85, 0.12)');
                grad.addColorStop(1, 'transparent');

                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(x, y, spread, 0, Math.PI * 2);
                ctx.fill();
            }

            offset += 0.03;
            requestAnimationFrame(renderPlume);
        };
        renderPlume();
    };

    // Monitor tab charts (Burn History + Spectral)
    const initMonitorCharts = () => {
        const r = REGIONS["punjab"];

        // Burn History Line Chart
        const ctxBurn = document.getElementById('burnHistoryChart')?.getContext('2d');
        if (ctxBurn) {
            burnHistoryChart = new Chart(ctxBurn, {
                type: 'line',
                data: {
                    labels: MONTHS,
                    datasets: [{
                        label: 'Burn Severity Index',
                        data: r.burn_history,
                        borderColor: '#ff2d55',
                        backgroundColor: 'rgba(255, 45, 85, 0.1)',
                        fill: true, tension: 0.35, pointRadius: 2, borderWidth: 2
                    }]
                },
                options: { ...chartDefaults }
            });
        }

        // Spectral Band Bar Chart
        const ctxSpec = document.getElementById('spectralBandChart')?.getContext('2d');
        if (ctxSpec) {
            spectralChart = new Chart(ctxSpec, {
                type: 'bar',
                data: {
                    labels: Object.keys(r.bands),
                    datasets: [{
                        data: Object.values(r.bands),
                        backgroundColor: ['#4FC3F7', '#00ff88', '#ff8c00', '#9d4edd', '#ff2d55', '#FFD166'],
                        borderRadius: 4, borderWidth: 0
                    }]
                },
                options: {
                    ...chartDefaults,
                    scales: {
                        ...chartDefaults.scales,
                        y: { ...chartDefaults.scales.y, max: 1.0 }
                    }
                }
            });
        }
    };

    const updateMonitorCharts = (r) => {
        if (burnHistoryChart) {
            burnHistoryChart.data.datasets[0].data = r.burn_history;
            burnHistoryChart.update();
        }
        if (spectralChart) {
            spectralChart.data.datasets[0].data = Object.values(r.bands);
            spectralChart.update();
        }
    };

    // Region Comparison Chart
    const updateComparisonChart = (rA, rB) => {
        const ctx = document.getElementById('compChart')?.getContext('2d');
        if (!ctx) return;
        if (compChart) compChart.destroy();

        compChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: MONTHS,
                datasets: [
                    { label: rA.name, data: rA.burn_history, borderColor: '#ff2d55', borderWidth: 2, tension: 0.3, pointRadius: 2 },
                    { label: rB.name, data: rB.burn_history, borderColor: '#00f0ff', borderWidth: 2, tension: 0.3, pointRadius: 2 }
                ]
            },
            options: {
                ...chartDefaults,
                plugins: { legend: { display: true, labels: { boxWidth: 12, color: '#94A3B8' } } }
            }
        });
    };

    // Global Charts
    const initGlobalCharts = () => {
        // Burning Rate Bar
        const ctxBurn = document.getElementById('globalBurnPctChart')?.getContext('2d');
        if (ctxBurn) {
            globalBurnChart = new Chart(ctxBurn, {
                type: 'bar',
                data: {
                    labels: GLOBAL_COUNTRIES.map(c => c.name),
                    datasets: [{ data: GLOBAL_COUNTRIES.map(c => c.burn_pct), backgroundColor: '#ff8c00', borderRadius: 4 }]
                },
                options: { ...chartDefaults, scales: { ...chartDefaults.scales, x: { ...chartDefaults.scales.x, ticks: { ...chartDefaults.scales.x.ticks, font: { size: 8 } } } } }
            });
        }

        // CO2 Emissions Bar
        const ctxCo2 = document.getElementById('globalCo2Chart')?.getContext('2d');
        if (ctxCo2) {
            globalCo2Chart = new Chart(ctxCo2, {
                type: 'bar',
                data: {
                    labels: GLOBAL_COUNTRIES.map(c => c.name),
                    datasets: [{ data: GLOBAL_COUNTRIES.map(c => c.co2_mt), backgroundColor: '#ff2d55', borderRadius: 4 }]
                },
                options: { ...chartDefaults, scales: { ...chartDefaults.scales, x: { ...chartDefaults.scales.x, ticks: { ...chartDefaults.scales.x.ticks, font: { size: 8 } } } } }
            });
        }

        // AQI Timeline (real live data injected by LiveData module)
        const ctxTime = document.getElementById('timelineChart')?.getContext('2d');
        if (ctxTime) {
            timelineChart = new Chart(ctxTime, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{ label: 'Loading live AQI...', data: [], borderColor: '#00f0ff', borderWidth: 2, tension: 0.2, pointRadius: 0 }]
                },
                options: {
                    ...chartDefaults,
                    plugins: { legend: { display: true, labels: { boxWidth: 12, color: '#94A3B8', font: { size: 9 } } } },
                    scales: { ...chartDefaults.scales, x: { ...chartDefaults.scales.x, ticks: { ...chartDefaults.scales.x.ticks, maxTicksLimit: 12 } } }
                }
            });
        }
    };

    // Live real AQI timeline (12 countries, daily average, last ~90 days)
    const updateTimelineReal = (labels, series) => {
        const ctx = document.getElementById('timelineChart')?.getContext('2d');
        if (!ctx) return;
        if (timelineChart) timelineChart.destroy();

        const palette = ['#ff2d55', '#ff8c00', '#FFD166', '#06d6a0', '#00f0ff', '#9d4edd', '#ff6b35', '#3a86ff', '#b5179e', '#00b4d8', '#70e000', '#f72585'];
        timelineChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: series.map((s, i) => ({
                    label: s.name,
                    data: s.data,
                    borderColor: palette[i % palette.length],
                    borderWidth: 1.6,
                    tension: 0.25,
                    pointRadius: 0,
                    spanGaps: true
                }))
            },
            options: {
                ...chartDefaults,
                plugins: { legend: { display: true, labels: { boxWidth: 10, color: '#94A3B8', font: { size: 9 }, padding: 6 } } },
                scales: {
                    ...chartDefaults.scales,
                    x: { ...chartDefaults.scales.x, ticks: { ...chartDefaults.scales.x.ticks, maxTicksLimit: 12, maxRotation: 0 } },
                    y: { ...chartDefaults.scales.y, title: { display: true, text: 'US AQI (daily avg)', color: '#526074', font: { size: 9 } } }
                },
                interaction: { mode: 'index', intersect: false }
            }
        });
    };

    return {
        init,
        updateMonitorCharts,
        updateComparisonChart,
        updateTimelineReal
    };
})();
