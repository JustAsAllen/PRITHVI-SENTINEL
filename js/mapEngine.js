/**
 * PRITHVI SENTINEL - 2D Modern Map Engine (Leaflet + CARTO Dark Matter)
 */
const MapEngine = (() => {
    let map = null;
    let incidentLayer = null;
    let regionLayer = null;
    const styleFor = {
        CONFIRMED:   { color: '#ff2d55', cls: 'critical' },
        'UNDER REVIEW': { color: '#ff8c00', cls: 'review' },
        MONITORING:  { color: '#00f0ff', cls: 'monitored' }
    };

    const tileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    const tileAttribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>';

    const init = () => {
        const el = document.getElementById('map');
        if (!el || map) return;

        map = L.map('map', {
            zoomControl: false,
            attributionControl: true,
            minZoom: 3,
            maxZoom: 18,
            worldCopyJump: true
        });
        map.attributionControl.setPrefix(false);
        map.attributionControl.setPosition('bottomright');

        L.tileLayer(tileUrl, { attribution: tileAttribution, subdomains: 'abcd', maxZoom: 19 }).addTo(map);

        // Nice dark background while tiles load
        el.style.background = '#0a0e17';

        map.setView([23.5, 80.0], 5);

        renderIncidentHotspots();
        renderRegionFireClusters();
        setupPicking();
    };

    const invalidate = () => { if (map) setTimeout(() => map.invalidateSize(), 80); };

    const markerIcon = (color, cls, size) => L.divIcon({
        className: 'hud-mapmarker-wrap',
        html: `<div class="hud-mapmarker ${cls}" style="--mk:${color}; --mks:${size}px"><span class="hud-mapmarker-core"></span></div>`,
        iconSize: [size * 2.2, size * 2.2],
        iconAnchor: [size * 1.1, size * 1.1]
    });

    const renderIncidentHotspots = () => {
        if (!map) return;
        if (incidentLayer) map.removeLayer(incidentLayer);

        incidentLayer = L.layerGroup().addTo(map);
        (SENTINEL_DATA.incidents || []).forEach(inc => {
            const st = styleFor[inc.status] || styleFor.MONITORING;
            const child = L.marker([inc.lat, inc.lon], {
                icon: markerIcon(st.color, st.cls, st.cls === 'critical' ? 9 : 7),
                zIndexOffset: st.cls === 'critical' ? 800 : 700,
                riseOnHover: true
            }).addTo(incidentLayer);
            child.bindTooltip(
                `<b>${inc.id}</b> &middot; ${inc.status}<br>${inc.state} (${inc.district})<br>${inc.burnAreaHa} ha &middot; ${inc.confidence}% conf`,
                { className: 'hud-tooltip', direction: 'top', offset: [0, -12] }
            );
            child.on('click', () => {
                if (UIController.selectIncident) UIController.selectIncident(inc.id);
            });

            if (st.cls === 'critical') {
                L.circle([inc.lat, inc.lon], {
                    radius: 22000 + inc.burnAreaHa * 220,
                    color: st.color,
                    weight: 1,
                    fillColor: st.color,
                    fillOpacity: 0.08,
                    className: 'hud-heat-critical'
                }).addTo(incidentLayer);
            }
        });
    };

    const renderRegionFireClusters = () => {
        if (!map) return;
        if (regionLayer) map.removeLayer(regionLayer);

        regionLayer = L.layerGroup().addTo(map);
        Object.entries(REGIONS || {}).forEach(([id, r]) => {
            const burning = r.status === "CRITICAL" || r.status === "HIGH RISK";
            const watch = r.status === "WATCH";
            const moderate = r.status === "MODERATE";
            const color = burning ? '#ff4d6d' : watch ? '#ffd166' : moderate ? '#ff8c00' : '#06d6a0';
            const cls = burning ? 'critical' : watch ? 'watch' : moderate ? 'review' : 'clear';

            const m = L.marker([r.lat, r.lon], {
                icon: markerIcon(color, cls, burning ? 8 : 6),
                zIndexOffset: burning ? 650 : 600,
                riseOnHover: true
            }).addTo(regionLayer);
            m.bindTooltip(
                `<b>${r.name}</b> &middot; ${r.status}<br>AQI ${r.aqi} &middot; ${r.active_fires} fires<br>${r.area_affected_ha} ha burning`,
                { className: 'hud-tooltip', direction: 'top', offset: [0, -10] }
            );
            m.on('click', () => {
                if (UIController.selectRegion) UIController.selectRegion(id);
            });

            // concentric heat zone for burning regions
            if (burning) {
                (r.fire_clusters || []).forEach(fc => {
                    L.circle([fc.lat, fc.lon], {
                        radius: fc.radius,
                        color,
                        weight: 1,
                        fillColor: color,
                        fillOpacity: 0.10,
                        className: 'hud-heat'
                    }).addTo(regionLayer);
                });
            }
        });
    };

    const focusLocation = (incident) => {
        if (!map) return;
        document.getElementById('current-coords').innerText =
            `LAT: ${incident.lat.toFixed(4)} | LON: ${incident.lon.toFixed(4)}`;
        map.flyTo([incident.lat, incident.lon], 9, { duration: 1.4 });
    };

    const flyToRegion = (id) => {
        const r = REGIONS[id];
        if (!r || !map) return;
        map.flyTo([r.lat, r.lon], 8, { duration: 1.4 });
    };

    const setupPicking = () => {
        L.control.zoom({ position: 'bottomleft' }).addTo(map);
    };

    return { init, focusLocation, flyToRegion, renderIncidentHotspots, renderRegionFireClusters, setupPicking, invalidate };
})();