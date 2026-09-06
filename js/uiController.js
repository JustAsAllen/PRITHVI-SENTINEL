/**
 * PRITHVI SENTINEL - UI Coordination, Event Listeners, Live Simulation & Dispatch
 */
const UIController = (() => {
    let currentIncident = null;
    let currentRegionId = "punjab";
    let isAutoDemoActive = false;
    let liveSimInterval = null;
    let dispatchInterval = null;
    const lastKpiValues = {};
    const kpiBase = {};
    const kpiDrift = {};

    const init = () => {
        setupTabs();
        setupModeButtons();
        setupActions();
        renderFeedList();
        selectIncident("PB-2847");
        renderRegionList();
        renderTileGrid(REGIONS[currentRegionId]);
        renderTelemetry(REGIONS[currentRegionId]);
        populateComparisonDropdowns();
        renderGlobalTab();
        renderEnergyTab();
        updateLiveKPIs();
        startLiveSimulation();
        startDispatchFeed();
        startLiveClock();
        window.addEventListener('livedata:updated', (e) => refreshFromLive(e.detail || {}));
    };

    // Re-render everything sourced from live data once the LiveData layer completes.
    const refreshFromLive = () => {
        renderFeedList();
        renderRegionList();
        renderTelemetry(REGIONS[currentRegionId]);
        renderTileGrid(REGIONS[currentRegionId]);
        renderGlobalTab();
        renderEnergyTab();
        updateLiveKPIs();
        MapEngine.renderRegionFireClusters();
        MapEngine.renderIncidentHotspots();
        const liveStamp = document.getElementById('aqi-live-time');
        if (liveStamp) liveStamp.innerText = new Date().toISOString().substring(11, 19) + ' UTC';
    };

    // Tab Switching
    const setupTabs = () => {
        document.querySelectorAll('.nav-tab').forEach(btn => {
            btn.addEventListener('click', () => switchTab(btn.dataset.tab));
        });
    };

    const switchTab = (tabId) => {
        document.querySelectorAll('.nav-tab').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-view').forEach(v => v.classList.remove('active'));

        const targetBtn = document.querySelector(`.nav-tab[data-tab="${tabId}"]`);
        const targetView = document.getElementById(tabId);

        if (targetBtn) targetBtn.classList.add('active');
        if (targetView) targetView.classList.add('active');

        if (tabId === 'mission-control') MapEngine.invalidate();
    };

    const setupModeButtons = () => {
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                ImageAnalysis.setMode(btn.dataset.mode);
            });
        });
    };

    const setupActions = () => {
        document.getElementById('btn-run-pipeline')?.addEventListener('click', () => {
            CNNSimulation.runFullInference(currentIncident, (detected) => {
                if (detected && currentIncident.status === "CONFIRMED") {
                    AlertSystem.triggerFireAlert(currentIncident);
                }
                ImageAnalysis.setMode('attention');
                document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
                document.querySelector('.mode-btn[data-mode="attention"]')?.classList.add('active');
            });
        });

        document.getElementById('btn-inspect-cnn')?.addEventListener('click', () => switchTab('cnn-analysis'));
        document.getElementById('btn-trigger-alert')?.addEventListener('click', () => {
            if (currentIncident) AlertSystem.triggerFireAlert(currentIncident);
        });

        document.getElementById('btn-run-quick')?.addEventListener('click', () => {
            if (currentIncident) {
                AlertSystem.showToast(`Running scan on ${currentIncident.id}...`, 'info');
                CNNSimulation.runFullInference(currentIncident, (detected) => {
                    if (detected && currentIncident.status === "CONFIRMED") {
                        AlertSystem.triggerFireAlert(currentIncident);
                    }
                });
            }
        });

        document.getElementById('btn-auto-demo')?.addEventListener('click', startAutoDemo);
    };

    // Feed List
    const renderFeedList = () => {
        const feed = document.getElementById('feed-list');
        if (!feed) return;
        feed.innerHTML = '';

        SENTINEL_DATA.incidents.forEach(inc => {
            const isConf = inc.status === "CONFIRMED";
            const badgeClass = isConf ? "badge-red" : inc.status === "UNDER REVIEW" ? "badge-orange" : "badge-cyan";
            const icon = isConf ? "\uD83D\uDD25" : inc.status === "UNDER REVIEW" ? "\u26A0\uFE0F" : "\uD83D\uDC41";

            feed.innerHTML += `
                <div class="feed-item" id="feed-item-${inc.id}" onclick="UIController.selectIncident('${inc.id}')">
                    <div class="feed-row-top">
                        <span class="feed-id">${icon} ${inc.id}</span>
                        <span class="badge ${badgeClass}">${inc.status}</span>
                    </div>
                    <div class="feed-location">${inc.state} (${inc.district.split(' ')[0]})</div>
                    <div class="feed-row-bot">
                        <span class="feed-conf">${inc.confidence}%</span>
                        <span class="mono-text" style="font-size:0.6rem; color:var(--text-muted);">${inc.timeUtc.split(' ')[0]}</span>
                    </div>
                </div>
            `;
        });
    };

    const selectIncident = (id) => {
        const inc = SENTINEL_DATA.incidents.find(item => item.id === id);
        if (!inc) return;
        currentIncident = inc;

        document.querySelectorAll('.feed-item').forEach(el => el.classList.remove('active'));
        document.getElementById(`feed-item-${id}`)?.classList.add('active');

        MapEngine.focusLocation(inc);

        const setText = (id, val) => { const el = document.getElementById(id); if (el) el.innerText = val; };
        const setHTML = (id, val) => { const el = document.getElementById(id); if (el) el.innerHTML = val; };

        setText('summary-classification', inc.classification);
        setText('summary-badge', inc.status);
        const sb = document.getElementById('summary-badge');
        if (sb) sb.className = `badge ${inc.status === "CONFIRMED" ? "badge-red" : "badge-orange"}`;
        setText('summary-conf-num', `${inc.confidence}%`);
        const scb = document.getElementById('summary-conf-bar');
        if (scb) scb.style.width = `${inc.confidence}%`;
        setText('summary-location', `${inc.state} (${inc.district})`);
        setText('summary-id', inc.id);
        setText('summary-area', `${inc.burnAreaHa} ha`);
        setText('summary-time', inc.timeUtc);
        setText('summary-crop', inc.crop);

        document.getElementById('att-activation').innerText = inc.peakActivation.toFixed(4);
        document.getElementById('comp-ndvi').innerText = `${inc.ndviDelta}%`;
        document.getElementById('comp-perimeter').innerText = `${inc.perimeterKm} km`;

        document.getElementById('impact-target-id').innerText = `${inc.id} (${inc.state})`;
        document.getElementById('impact-threat-level').innerText = inc.threatLevel;
        document.getElementById('impact-biomass').innerHTML = `${inc.biomassTonnes.toLocaleString()} <small>tonnes</small>`;
        document.getElementById('impact-co2').innerHTML = `${inc.co2Tonnes.toLocaleString()} <small>tonnes</small>`;
        document.getElementById('impact-pm25').innerHTML = `+${inc.pm25Surge} <small>&#181;g/m&#179;</small>`;
        document.getElementById('impact-energy').innerHTML = `${inc.energyTj} <small>TJ</small>`;

        ImageAnalysis.renderIncidentVisuals(inc);
        TimelineEngine.renderTimeline(inc);
    };

    // Region Selection (from sidebar)
    const renderRegionList = () => {
        const container = document.getElementById('region-list');
        if (!container) return;
        container.innerHTML = '';

        Object.entries(REGIONS).forEach(([id, r]) => {
            const badgeClass = r.status === "CRITICAL" ? "badge-red" :
                r.status === "HIGH RISK" ? "badge-orange" :
                r.status === "WATCH" ? "badge-yellow" :
                r.status === "MODERATE" ? "badge-cyan" :
                r.status === "LOW RISK" ? "badge-purple" : "badge-green";

            container.innerHTML += `
                <div class="region-card ${id === currentRegionId ? 'selected' : ''}" onclick="UIController.selectRegion('${id}')" id="card-${id}">
                    <div class="region-card-top">
                        <span class="region-name">${r.name.split('(')[0]}</span>
                        <span class="badge ${badgeClass}">${r.status}</span>
                    </div>
                    <div class="region-stats-mini">
                        <div>AQI: <b id="reg-aqi-${id}">${r.aqi}</b></div>
                        <div>Fires: <b id="reg-fires-${id}">${r.active_fires}</b></div>
                        <div>NBR: <b id="reg-nbr-${id}">${r.nbr}</b></div>
                    </div>
                </div>
            `;
        });
    };

    const selectRegion = (id) => {
        currentRegionId = id;
        document.querySelectorAll('.region-card').forEach(c => c.classList.remove('selected'));
        document.getElementById(`card-${id}`)?.classList.add('selected');

        const r = REGIONS[id];
        MapEngine.flyToRegion(id);

        document.getElementById('active-region-name').innerText = r.name;
        const badge = document.getElementById('active-region-badge');
        badge.innerText = r.status;
        const bc = r.status === "CRITICAL" ? "badge-red" : r.status === "HIGH RISK" ? "badge-orange" : "badge-green";
        badge.className = `badge ${bc} mono-text`;

        renderTileGrid(r);
        renderTelemetry(r);
        ChartsEngine.updateMonitorCharts(r);
    };

    // Telemetry rendering
    const renderTelemetry = (r) => {
        document.getElementById('active-nbr').innerText = r.nbr;
        document.getElementById('active-ndvi').innerText = r.ndvi;
        document.getElementById('active-crops').innerText = r.crops_affected;
        document.getElementById('active-residue').innerText = `${r.residue_mt} MT`;
        document.getElementById('active-burn-pct').innerText = `${r.burnt_pct}%`;

        const bandContainer = document.getElementById('band-bars');
        bandContainer.innerHTML = '';
        Object.entries(r.bands).forEach(([bandName, val]) => {
            const pct = Math.min(100, Math.round(val * 100));
            const barColor = pct > 70 ? 'var(--neon-red)' : pct > 40 ? 'var(--neon-orange)' : 'var(--neon-cyan)';
            bandContainer.innerHTML += `
                <div class="band-row">
                    <span>${bandName}</span>
                    <div class="band-bar-wrap"><div class="band-bar-fill" style="width:${pct}%; background:${barColor};"></div></div>
                    <span>${val.toFixed(2)}</span>
                </div>
            `;
        });
    };

    // Sentinel-2 10x10 Pixel Grid
    const renderTileGrid = (r) => {
        const grid = document.getElementById('tile-grid');
        if (!grid) return;
        grid.innerHTML = '';
        const isBurning = r.status === "CRITICAL" || r.status === "HIGH RISK";

        for (let row = 0; row < 10; row++) {
            for (let col = 0; col < 10; col++) {
                const isFire = isBurning && (row >= 3 && row <= 6 && col >= 3 && col <= 6);
                const dist = Math.sqrt((row - 4.5) ** 2 + (col - 4.5) ** 2);
                let color;

                if (isFire) {
                    const intensity = Math.max(0, 1 - dist / 5) * (0.8 + Math.random() * 0.2);
                    const red = Math.min(255, Math.floor(200 + 55 * intensity));
                    const green = Math.min(255, Math.floor(60 + 80 * (1 - intensity)));
                    color = `rgb(${red}, ${green}, 20)`;
                } else {
                    const ndvi = r.ndvi * (0.8 + Math.random() * 0.4);
                    const red = Math.floor(40 + 60 * (1 - ndvi));
                    const green = Math.floor(70 + 130 * ndvi);
                    color = `rgb(${red}, ${green}, 50)`;
                }

                const cell = document.createElement('div');
                cell.className = `tile-cell ${isFire ? 'fire-cell' : ''}`;
                cell.style.backgroundColor = color;
                grid.appendChild(cell);
            }
        }
    };

    // Live KPI simulation
    const simulateFluctuate = (val, pct) => {
        const delta = val * pct * (Math.random() * 2 - 1);
        return Math.max(0, Math.round(val + delta));
    };

const updateLiveKPIs = () => {
        let totalFires = 0, totalArea = 0, totalSmoke = 0, totalAqi = 0, totalEnergy = 0;
        const count = Object.keys(REGIONS).length;

        Object.entries(REGIONS).forEach(([id, r]) => {
            r.active_fires = simulateFluctuate(r.active_fires, 0.004);
            r.area_affected_ha = simulateFluctuate(r.area_affected_ha, 0.003);
            r.smoke_plume_km = simulateFluctuate(r.smoke_plume_km, 0.008);

            totalFires += r.active_fires;
            totalArea += r.area_affected_ha;
            totalSmoke += r.smoke_plume_km;
            totalAqi += r.aqi;
            totalEnergy += r.energy_potential_gj;

            const aqiEl = document.getElementById(`reg-aqi-${id}`);
            const fireEl = document.getElementById(`reg-fires-${id}`);
            if (aqiEl) aqiEl.innerText = r.aqi;
            if (fireEl) fireEl.innerText = r.active_fires;
        });

        const avgAqi = Math.round(totalAqi / count);

        // Drift-accumulator: only push a KPI update (and its pulse) when a value
        // has actually moved by a meaningful amount — prevents per-tick flicker.
        if (!kpiBase.fires) {
            kpiBase.fires = Math.round(totalFires);
            kpiBase.area = Math.round(totalArea);
            kpiBase.smoke = Math.round(totalSmoke);
            animateKpiVal('kpi-fires', kpiBase.fires);
            animateKpiVal('kpi-area', `${kpiBase.area.toLocaleString()} ha`);
            animateKpiVal('kpi-smoke', `${kpiBase.smoke} km`);
        }

        kpiDrift.fires += totalFires - kpiBase.fires;
        kpiDrift.area += totalArea - kpiBase.area;
        kpiDrift.smoke += totalSmoke - kpiBase.smoke;

        if (Math.abs(kpiDrift.fires) / kpiBase.fires >= 0.01) {
            kpiBase.fires += Math.round(kpiDrift.fires); kpiDrift.fires = 0;
            animateKpiVal('kpi-fires', kpiBase.fires);
        }
        if (Math.abs(kpiDrift.area) / kpiBase.area >= 0.01) {
            kpiBase.area += Math.round(kpiDrift.area); kpiDrift.area = 0;
            animateKpiVal('kpi-area', `${kpiBase.area.toLocaleString()} ha`);
        }
        if (Math.abs(kpiDrift.smoke) / kpiBase.smoke >= 0.01) {
            kpiBase.smoke += Math.round(kpiDrift.smoke); kpiDrift.smoke = 0;
            animateKpiVal('kpi-smoke', `${kpiBase.smoke} km`);
        }

        animateKpiVal('kpi-aqi', avgAqi);
        animateKpiVal('kpi-energy', `${(totalEnergy / 1e3).toFixed(1)}k GJ`);
    };

    const animateKpiVal = (id, newVal) => {
        const el = document.getElementById(id);
        if (!el) return;
        if (lastKpiValues[id] === String(newVal)) return;
        lastKpiValues[id] = String(newVal);
        el.innerText = newVal;
        el.classList.remove('val-bounce');
        void el.offsetWidth;
        el.classList.add('val-bounce');
    };

    const startLiveSimulation = () => {
        liveSimInterval = setInterval(updateLiveKPIs, 2500);
    };

    // Region Comparison
    const populateComparisonDropdowns = () => {
        const selA = document.getElementById('comp-sel-a');
        const selB = document.getElementById('comp-sel-b');
        if (!selA || !selB) return;
        selA.innerHTML = '';
        selB.innerHTML = '';

        Object.entries(REGIONS).forEach(([id, r]) => {
            selA.innerHTML += `<option value="${id}">${r.name}</option>`;
            selB.innerHTML += `<option value="${id}">${r.name}</option>`;
        });

        selA.value = "punjab";
        selB.value = "karnataka";

        selA.addEventListener('change', updateComparison);
        selB.addEventListener('change', updateComparison);
        updateComparison();
    };

    const updateComparison = () => {
        const idA = document.getElementById('comp-sel-a')?.value || "punjab";
        const idB = document.getElementById('comp-sel-b')?.value || "karnataka";
        const rA = REGIONS[idA];
        const rB = REGIONS[idB];

        document.getElementById('comp-panel-a').innerHTML = renderCompCard(rA);
        document.getElementById('comp-panel-b').innerHTML = renderCompCard(rB);

        ChartsEngine.updateComparisonChart(rA, rB);
    };

    const renderCompCard = (r) => {
        const bc = r.status === "CRITICAL" ? "badge-red" : "badge-green";
        return `
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <h3 style="color:#fff; font-size:1rem;">${r.name}</h3>
                <span class="badge ${bc}">${r.status}</span>
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; font-family:var(--font-mono); font-size:0.75rem;">
                <div style="background:rgba(255,255,255,0.03); padding:8px; border-radius:6px;">AQI: <b style="color:var(--neon-red);">${r.aqi}</b></div>
                <div style="background:rgba(255,255,255,0.03); padding:8px; border-radius:6px;">Fires: <b>${r.active_fires}</b></div>
                <div style="background:rgba(255,255,255,0.03); padding:8px; border-radius:6px;">NBR: <b>${r.nbr}</b></div>
                <div style="background:rgba(255,255,255,0.03); padding:8px; border-radius:6px;">Area: <b>${r.area_affected_ha.toLocaleString()} ha</b></div>
                <div style="background:rgba(255,255,255,0.03); padding:8px; border-radius:6px;">Smoke: <b>${r.smoke_plume_km} km</b></div>
                <div style="background:rgba(255,255,255,0.03); padding:8px; border-radius:6px;">Energy: <b>${(r.energy_potential_gj / 1000).toFixed(0)}k GJ</b></div>
            </div>
        `;
    };

    // Global Tab Rendering
    const renderGlobalTab = () => {
        const cardContainer = document.getElementById('global-cards');
        const tableBody = document.getElementById('global-aqi-table');
        if (!cardContainer || !tableBody) return;
        cardContainer.innerHTML = '';
        tableBody.innerHTML = '';

        GLOBAL_COUNTRIES.forEach(c => {
            cardContainer.innerHTML += `
                <div class="country-card">
                    <div class="country-card-header">
                        <div class="country-flag-name"><span>${c.flag}</span> <span>${c.name}</span></div>
                        <span class="badge ${c.aqi > 100 ? 'badge-red' : 'badge-green'}">#${c.rank} Global</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; font-size:0.75rem; font-family:var(--font-mono); margin-top:4px;">
                        <span>Burn Rate: <b style="color:var(--neon-orange);">${c.burn_pct}%</b></span>
                        <span>AQI: <b>${c.aqi}</b></span>
                    </div>
                </div>
            `;

            tableBody.innerHTML += `
                <tr>
                    <td>#${c.rank}</td>
                    <td>${c.flag} <b>${c.name}</b></td>
                    <td>${c.aqi}</td>
                    <td>${c.pm25}</td>
                    <td><span class="badge ${c.aqi > 100 ? 'badge-red' : c.aqi > 50 ? 'badge-orange' : 'badge-green'}">${c.status}</span></td>
                    <td>${c.burn_pct > 15 ? 'Oct - Nov (Intense)' : 'Minimal'}</td>
                </tr>
            `;
        });
    };

    // Energy Tab Rendering
    const renderEnergyTab = () => {
        const tableBody = document.getElementById('energy-table');
        if (!tableBody) return;
        tableBody.innerHTML = '';

        GLOBAL_COUNTRIES.forEach(c => {
            tableBody.innerHTML += `
                <tr>
                    <td><b>${c.flag} ${c.name}</b></td>
                    <td>${c.residue_mt} MT</td>
                    <td>${c.energy_pj} PJ</td>
                    <td>${c.power_mw.toLocaleString()} MW</td>
                    <td>${Math.round(c.residue_mt * 0.24)}</td>
                    <td style="color:var(--neon-green); font-weight:700;">${Math.round(c.co2_mt * 0.4)} MT</td>
                    <td>${(c.power_mw * 24).toLocaleString()}</td>
                </tr>
            `;
        });
    };

    // Enforcement Dispatch Feed
    const startDispatchFeed = () => {
        dispatchInterval = setInterval(triggerDispatchAlert, 4000);
    };

    const triggerDispatchAlert = () => {
        const feed = document.getElementById('dispatch-feed');
        if (!feed) return;

        const burningRegions = Object.values(REGIONS).filter(r => r.status === "CRITICAL" || r.status === "HIGH RISK");
        if (burningRegions.length > 0 && Math.random() > 0.4) {
            const target = burningRegions[Math.floor(Math.random() * burningRegions.length)];
            const alertLat = (target.lat + (Math.random() * 0.1 - 0.05)).toFixed(4);
            const alertLon = (target.lon + (Math.random() * 0.1 - 0.05)).toFixed(4);
            const penalty = (target.active_fires * 2500).toLocaleString();
            const timestamp = new Date().toLocaleTimeString();

            const alertHTML = `
                <div class="dispatch-alert">
                    <span class="dispatch-timestamp mono-text">[${timestamp}] CRITICAL ANOMALY DETECTED</span>
                    <div><b>Location:</b> ${target.state} (Lat: ${alertLat}, Lon: ${alertLon})</div>
                    <div style="color:var(--neon-orange); margin-top:3px;"><b>Trigger:</b> NBR Index ${target.nbr} | High SWIR Reflectance</div>
                    <div class="dispatch-action"><b>Action:</b> Coordinates dispatched. Estimated penalty: &#8377;${penalty}</div>
                </div>
            `;

            feed.insertAdjacentHTML('afterbegin', alertHTML);
            if (feed.children.length > 20) feed.removeChild(feed.lastChild);
        }
    };

    // Live Clock
    const startLiveClock = () => {
        const clockEl = document.getElementById('live-clock');
        if (!clockEl) return;
        setInterval(() => {
            clockEl.innerText = new Date().toISOString().substring(11, 19) + ' UTC';
        }, 1000);
    };

    // Auto Demo
    const startAutoDemo = () => {
        if (isAutoDemoActive) return;
        isAutoDemoActive = true;

        const demoBtn = document.getElementById('btn-auto-demo');
        demoBtn.classList.add('active');
        AlertSystem.showToast('Starting guided demo...', 'info', 2000);

        switchTab('mission-control');
        selectIncident('PB-2847');

        setTimeout(() => {
            switchTab('cnn-analysis');
            ImageAnalysis.setMode('original');

            setTimeout(() => {
                CNNSimulation.runFullInference(currentIncident, (detected) => {
                    if (detected && currentIncident.status === "CONFIRMED") {
                        AlertSystem.triggerFireAlert(currentIncident);
                    }

                    setTimeout(() => {
                        ImageAnalysis.setMode('heatmap');
                        document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
                        document.querySelector('.mode-btn[data-mode="heatmap"]')?.classList.add('active');

                        setTimeout(() => {
                            switchTab('environmental-impact');
                            isAutoDemoActive = false;
                            demoBtn.classList.remove('active');
                            AlertSystem.showToast('Demo complete', 'success', 2000);
                        }, 2800);
                    }, 1200);
                });
            }, 1000);
        }, 1800);
    };

    return {
        init,
        selectIncident,
        selectRegion,
        switchTab
    };
})();
