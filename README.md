# PRITHVI SENTINEL

**Satellite-powered crop-residue & forest burn detection dashboard for the Indian agrarian regions.**

PRITHVI SENTINEL is a full-screen, sci-fi HUD web application that presents an end-to-end **Sentinel-2 based crop-burning detection pipeline** — from satellite tile acquisition, through a CNN inference engine, to enforcement dispatch — and layers it with **real-time air quality data** pulled live from the Open-Meteo Air Quality API.

It is built as a zero-dependency, no-build static web app: open `index.html` and the entire mission dashboard boots. Perfect for demos, hackathons, research showcases, and command-center style presentations.

---

## How It Works

The dashboard is organised around **8 command-center tabs**, each simulating one stage of the operational workflow:

### 1. Mission Control
The operational home. A live KPI strip streams national totals (active fires, burnt area, average AQI, smoke-plume extent, energy potential) above an interactive **2D map** and the **incident feed**.

- **Map:** Leaflet with the CARTO Dark Matter basemap. Each of the 9 monitoring regions and each active incident is a neon marker, colour-coded by status (critical / review / watch / clear), with pulsing heat circles around burning zones. Clicking a region or incident flies the map to it and syncs the entire dashboard.
- **Incident feed:** sample detections such as `PB-2847` (Sangrur, Punjab — 97.3% confidence, CONFIRMED) and `HR-1932` (Karnal, Haryana). Each incident ships a full forensic profile: classification, burn area (ha), biomass (t), CO₂ (t), PM2.5 surge, energy (TJ), NDVI delta, perimeter, and peak CNN activation.
- **Per-incident acquisition timeline:** a step-by-step playback of the detection life-cycle (tile acquired → radiometric calibration → CNN tensor init → Grad-CAM hotspot → combustion verified).
- **Scan panel:** run a full inference scan on the selected incident, view timeline events, motifs, and court-relevant disappearance checks.

### 2. Analysis (Sentinel-2 Scene Viewer)
A Sentinel-2 scene overlay with **operational display modes** — *Original / Attention (CNN) / Heatmap* — driven by the visualisation engine in `imageAnalysis.js`. Toggles through the same raster your simulated CNN "sees" while scanning.

### 3. Compare (Region Comparison)
Side-by-side telemetry for any two of the 9 regions: AQI, active fires, NBR index, affected area, smoke plume length, and energy potential — rendered as a synchronous comparison chart.

### 4. Global (12-Country Live AQI)
The international monitoring board:

- 12 country cards + rank table with **live AQI and PM2.5** for Bangladesh, Pakistan, India, Indonesia, China, Brazil, Japan, USA, UK, Germany, Canada, and Australia.
- Burning-rate (%) and CO₂-emitted (MT) bar charts.
- A **Global AQI Timeline** built from *real* per-country air-quality history — daily averages over the last ~90 days, refreshed on load.

### 5. Performance (Model Training)
CNN training curves — training vs. validation accuracy and loss across 25 epochs (peaking at ~96.8% accuracy across 14,200 Sentinel-2 tiles) — plus precision/recall metrics.

### 6. Energy (Waste-to-Energy Economics)
National residue-burn economics: residue production (MT), recoverable energy (PJ), potential power capacity (MW), count of homes, and CO₂ savings if crop residue were converted to energy instead of burnt.

### 7. Impact (Environmental Impact)
Per-incident impact breakdown: threat level, biomass loss, CO₂ release, PM2.5 surge, and energy wasted — colour-coded severity metrics.

### 8. Dispatch (Enforcement & Authority Feed)
A live-ticking enforcement console. CRITICAL / HIGH RISK events automatically notify 5 modelled authorities (DDMA, State Pollution Control Board, Fire Services, Agri Dept., NDRF) and push timestamped dispatch alerts with GPS coordinates and estimated penalties.

---

## Live Data Integration

| Field | Source | Verdict |
| --- | --- | --- |
| **Air quality (US AQI, PM2.5)** for 9 regions & 12 countries | [Open-Meteo Air Quality API](https://air-quality-api.open-meteo.com) (free, keyless) | **Real & current** |
| **~90-day daily-average AQI timeline** (12 countries) | Open-Meteo hourly history (`past_days=92`) aggregated to daily means | **Real** |
| Fire counts, burn areas, biomass, energy, CO₂, penalties | Internal scenario/model datasets | **Simulated** |

How it works: `js/liveData.js` fires one concurrent request per location on boot, refreshes the shared `REGIONS` / `GLOBAL_COUNTRIES` datasets in place, rebuilds the AQI timeline chart, recalculates the national-average AQI KPI, and re-renders every downstream view (region list, telemetry, map markers, global cards/table) via a `livedata:updated` custom event. If the network is unavailable, the app degrades gracefully to its baseline datasets.

> **Why the AQI is live but fires are not:** the Open-Meteo air-quality API needs no key and allows the CORS/free usage required by a static page. Live fire feeds (e.g. NASA FIRMS) require an API key — the detection layer is therefore simulated, with hooks in place to wire a real feed later.

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| Core | Vanilla HTML5 / CSS3 / ES6 JavaScript — **no frameworks, no build step** |
| Map | [Leaflet 1.9](https://leafletjs.com) + CARTO Dark Matter basemap tiles |
| Charts | [Chart.js 4](https://www.chart.js.org) (UMD build) |
| Live data | Open-Meteo Air Quality API (`fetch`, CORS-enabled) |
| Design system | Custom glass/HUD theme: design tokens, `backdrop-filter` panels, neon palette, JetBrains Mono / Rajdhani / Space Grotesk typography |
| Performance | Animations restricted to compositor-friendly properties (`transform` / `opacity`) to avoid repaint flicker, even on Microsoft Edge |

---

## Project Structure

```
PRITHVI-SENTINEL/
├── index.html              # App shell, navigation, all 8 tabs & panels
├── css/
│   ├── main.css            # Design tokens (:root vars), app layout, KPI strip, glass/HUD system
│   ├── components.css      # Panels, cards, map markers, telemetry, dialogs, toasts
│   └── animations.css      # 3D tilt + compositor-safe infinite animations
└── js/
    ├── regions.js          # 9-region dataset + 12-country global dataset (AQI/PM2.5/energy)
    ├── data.js             # Incident dataset (4 seeded burns) + model performance curves
    ├── liveData.js         # Open-Meteo fetch layer: live AQI/PM2.5 + 90-day history + event dispatch
    ├── mapEngine.js        # Leaflet engine: markers, heat zones, flyTo, picking
    ├── alertSystem.js      # Alert modal, toasts, authority notify + enforcement
    ├── cnnSimulation.js    # Stepped CNN inference pipeline simulation (feature maps, latent bars)
    ├── imageAnalysis.js    # Scene mode overlays (original/attention/heatmap) + render loops
    ├── charts.js           # All Chart.js instances (monitor, comparison, global/live timeline)
    ├── uiController.js     # Tabs, KPI sim/telemetry, region/feed rendering, live-clock, auto-demo
    └── app.js              # Bootstrap/init sequence
```

Each JS module is an **IIFE-backed singleton** (e.g. `MapEngine`, `ChartsEngine`, `LiveData`) exposing a minimal public API, and `app.js` wires them together in init order: `AlertSystem → MapEngine → ImageAnalysis → CNNSimulation → ChartsEngine → UIController → LiveData`.

---

## Getting Started

No build, no install — open the file:

```bash
git clone https://github.com/JustAsAllen/PRITHVI-SENTINEL.git
cd PRITHVI-SENTINEL
start index.html        # Windows
open index.html         # macOS
```

> Requires an internet connection for the Leaflet tiles, Chart.js CDN, and the live Open-Meteo AQI requests.

**Try it:** click **"Start Auto Demo"** in Mission Control for a guided tour through a full scan → CNN inference → alert → dispatch cycle.

---

## Customisation Ideas

- **Add regions:** append entries to `REGIONS` in `js/regions.js` (name, lat/lon, dataset fields) — the map, telemetry, KPIs, and comparison pickers pick them up automatically.
- **Add countries:** extend `GLOBAL_COUNTRIES` and add capital coordinates to `COUNTRY_COORDS` in `js/liveData.js`.
- **Real fire feed:** wire NASA FIRMS / VIIRS active-fire API into `liveData.js` (needs an API key) to replace the simulated burn numbers.
- **Deploy:** the repo is a pure static site — drag-and-drop deploy to GitHub Pages / Netlify / Vercel works as-is.
- **Theme:** all colours and fonts live in the `:root` CSS variables in `css/main.css`.

---

## Known Limitations

- Detection, burn-area, biomass, energy, and enforcement figures are **simulated scenario data** for demonstration.
- Live data is refreshed once on page load (a periodic refresh can be added by re-calling `LiveData.init()`).
- The CNN is a staged visual simulation, not a real inference model.
- Incident seed data (`js/data.js`) is static sample content.

---

## Disclaimer

PRITHVI SENTINEL is a **demonstration / prototype** application. It is not an operational fire-monitoring, enforcement, or decision-making system, and must not be used for real dispatch or policy decisions. Live air-quality values are real; all fire-detection and enforcement outputs are simulated.

## License

This project is a private prototype and is **not** currently open for external reuse. Contact the repository owner for permission before redistribution or derivative use.