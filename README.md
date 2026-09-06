# PRITHVI SENTINEL

Satellite-powered forest & crop-residue (stubble) burn detection dashboard. A sci-fi HUD styled web application that simulates a full Sentinel-2 based fire-detection pipeline for the Indian agrarian regions, and layers it with **real-time air quality data**.

## What It Does

- Detects illegal crop burning events via a simulated CNN inference pipeline over Sentinel-2 MSI tiles (time-series acquisition, radiometric calibration, SWIR/NIR anomaly detection, Grad-CAM activation maps).
- Shows detection, confidence, classification, burn-area, NDVI delta, perimeter, biomass/CO₂/PM2.5/energy impact per incident.
- Combines **live air quality** (US AQI & PM2.5 from Open-Meteo) for 9 monitoring regions and 12 countries into a 90-day daily-average AQI timeline.
- Renders a modern 2D map (Leaflet + CARTO Dark Matter) with neon markers, heat zones, and live region/incident telemetry.
- Compares regions, forecasts energy potential from residue biomass, tracks model accuracy, and dispatches enforcement alerts.

## Dashboard Modules

| Tab | Content |
| --- | --- |
| Mission Control | Live KPI strip, incident feed, 2D map with region/incident markers, region telemetry, court-search summary |
| Analysis | Sentinel-2 scene viewer with detection-mode overlays (original / attention / heatmap) |
| Compare | Side-by-side burn stats & metrics for any two regions |
| Global | 12-country live AQI cards + table, burning-rate & CO₂ charts, live 90-day AQI timeline |
| Performance | CNN training curves (accuracy / loss vs epoch) |
| Energy | Residue → energy potential, power capacity, CO₂ savings by country |
| Impact | Environmental impact breakdown for the selected incident |
| Dispatch | Real-time enforcement dispatch feed with penalties |

## Live Data

- **Real:** Air quality (US AQI, PM2.5) is fetched live for the 9 regions and 12 countries from the free, keyless [Open-Meteo Air Quality API](https://air-quality-api.open-meteo.com) — including the ~90-day daily AQI history chart.
- **Modelled:** Fire counts, burn areas, biomass, and energy figures are scenario/model data (live fire feeds like NASA FIRMS require an API key).

## Getting Started

No build step — just open it in a browser:

```bash
git clone https://github.com/JustAsAllen/PRITHVI-SENTINEL.git
cd PRITHVI-SENTINEL
start index.html        # Windows
# or open index.html in your browser of choice
```

> Requires an internet connection for the map tiles, charts, and live AQI data.

## Tech Stack

- Vanilla HTML / CSS / JavaScript (no frameworks, no build tools)
- [Leaflet 1.9](https://leafletjs.com) + CARTO Dark Matter basemap
- [Chart.js 4](https://www.chart.js.org)
- Custom CSS animation/HUD design system

## Project Structure

```
PRITHVI-SENTINEL/
├── index.html            # App shell, all tabs & panels
├── css/
│   ├── main.css          # Design tokens, layout, glass/HUD system
│   ├── components.css    # Panels, cards, map markers, dialogs
│   └── animations.css    # 3D & compositor-friendly animations
└── js/
    ├── regions.js        # Region (9 districts) & 12-country datasets
    ├── data.js           # Incident & model-performance datasets
    ├── liveData.js       # Open-Meteo live AQI/PM2.5 + 90-day history
    ├── mapEngine.js      # Leaflet map engine
    ├── alertSystem.js    # Alerts, toasts, authority dispatch
    ├── cnnSimulation.js  # CNN inference pipeline simulation
    ├── imageAnalysis.js  # Scene/mode overlays & render loops
    ├── charts.js         # All Chart.js visualizations
    ├── uiController.js   # Tab logic, KPIs, rendering, live sim
    └── app.js            # Bootstrap
```

## Disclaimer

This is a demonstration/prototype application. Detection and enforcement figures are simulated for illustration; live air quality figures are real. It is not an operational fire-monitoring system.