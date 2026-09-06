/**
 * PRITHVI SENTINEL - Regional Coverage & Telemetry Data
 */
const REGIONS = {
    "punjab": {
        name: "Punjab (Rice Belt)", state: "Punjab", lat: 31.1471, lon: 75.3412,
        status: "CRITICAL", severity: 95, aqi: 385, nbr: -0.62, ndvi: 0.08,
        bands: { "B02 (Blue)": 0.04, "B03 (Green)": 0.06, "B04 (Red)": 0.12, "B08 (NIR)": 0.08, "B11 (SWIR1)": 0.85, "B12 (SWIR2)": 0.78 },
        fire_clusters: [
            { lat: 31.25, lon: 75.45, intensity: 98, radius: 12000 },
            { lat: 30.95, lon: 75.20, intensity: 87, radius: 8000 },
            { lat: 31.40, lon: 75.60, intensity: 76, radius: 6000 }
        ],
        burn_history: [18, 22, 15, 25, 30, 12, 8, 10, 35, 88, 95, 42],
        smoke_plume_km: 340, active_fires: 847, area_affected_ha: 52400,
        crops_affected: "Rice (Kharif), Wheat (Rabi)", residue_mt: 20, burnt_pct: 28, energy_potential_gj: 336000
    },
    "delhi_ncr": {
        name: "Delhi NCR (Capital Region)", state: "Delhi NCR", lat: 28.7041, lon: 77.1025,
        status: "CRITICAL", severity: 98, aqi: 420, nbr: -0.68, ndvi: 0.05,
        bands: { "B02 (Blue)": 0.03, "B03 (Green)": 0.05, "B04 (Red)": 0.14, "B08 (NIR)": 0.06, "B11 (SWIR1)": 0.88, "B12 (SWIR2)": 0.82 },
        fire_clusters: [
            { lat: 28.85, lon: 77.25, intensity: 95, radius: 12000 },
            { lat: 28.55, lon: 76.95, intensity: 88, radius: 8000 }
        ],
        burn_history: [15, 12, 10, 14, 18, 8, 5, 6, 20, 85, 95, 40],
        smoke_plume_km: 180, active_fires: 185, area_affected_ha: 8500,
        crops_affected: "Receptor region (downwind stubble plume)", residue_mt: 3, burnt_pct: 2, energy_potential_gj: 42000
    },
    "haryana": {
        name: "Haryana (Agricultural Zone)", state: "Haryana", lat: 29.0588, lon: 76.0856,
        status: "HIGH RISK", severity: 78, aqi: 310, nbr: -0.38, ndvi: 0.12,
        bands: { "B02 (Blue)": 0.05, "B03 (Green)": 0.09, "B04 (Red)": 0.15, "B08 (NIR)": 0.12, "B11 (SWIR1)": 0.79, "B12 (SWIR2)": 0.68 },
        fire_clusters: [
            { lat: 29.15, lon: 76.20, intensity: 82, radius: 9000 },
            { lat: 28.90, lon: 75.95, intensity: 71, radius: 5000 }
        ],
        burn_history: [14, 18, 12, 20, 25, 10, 7, 9, 28, 78, 85, 35],
        smoke_plume_km: 210, active_fires: 523, area_affected_ha: 31200,
        crops_affected: "Rice, Wheat, Sugarcane", residue_mt: 12, burnt_pct: 25, energy_potential_gj: 201600
    },
    "rajasthan": {
        name: "Rajasthan (Western Frontier)", state: "Rajasthan", lat: 27.0239, lon: 74.2179,
        status: "WATCH", severity: 55, aqi: 220, nbr: -0.12, ndvi: 0.18,
        bands: { "B02 (Blue)": 0.05, "B03 (Green)": 0.10, "B04 (Red)": 0.18, "B08 (NIR)": 0.18, "B11 (SWIR1)": 0.60, "B12 (SWIR2)": 0.52 },
        fire_clusters: [{ lat: 27.15, lon: 74.35, intensity: 58, radius: 6000 }],
        burn_history: [12, 16, 14, 18, 22, 11, 8, 10, 25, 62, 70, 30],
        smoke_plume_km: 130, active_fires: 215, area_affected_ha: 14800,
        crops_affected: "Wheat, Mustard, Bajra", residue_mt: 8, burnt_pct: 10, energy_potential_gj: 134400
    },
    "bihar": {
        name: "Bihar (Gangetic Plains)", state: "Bihar", lat: 25.0961, lon: 85.3131,
        status: "WATCH", severity: 48, aqi: 195, nbr: -0.05, ndvi: 0.22,
        bands: { "B02 (Blue)": 0.05, "B03 (Green)": 0.12, "B04 (Red)": 0.19, "B08 (NIR)": 0.22, "B11 (SWIR1)": 0.52, "B12 (SWIR2)": 0.44 },
        fire_clusters: [{ lat: 25.25, lon: 85.45, intensity: 50, radius: 5000 }],
        burn_history: [10, 14, 12, 16, 20, 9, 7, 8, 24, 60, 68, 25],
        smoke_plume_km: 95, active_fires: 178, area_affected_ha: 11200,
        crops_affected: "Rice, Wheat, Maize", residue_mt: 8, burnt_pct: 15, energy_potential_gj: 134400
    },
    "up": {
        name: "Uttar Pradesh (Western Region)", state: "Uttar Pradesh", lat: 26.8467, lon: 80.9462,
        status: "MODERATE", severity: 42, aqi: 185, nbr: 0.15, ndvi: 0.25,
        bands: { "B02 (Blue)": 0.06, "B03 (Green)": 0.15, "B04 (Red)": 0.22, "B08 (NIR)": 0.25, "B11 (SWIR1)": 0.45, "B12 (SWIR2)": 0.38 },
        fire_clusters: [{ lat: 27.00, lon: 81.10, intensity: 45, radius: 4000 }],
        burn_history: [10, 14, 12, 16, 20, 8, 6, 7, 22, 55, 62, 28],
        smoke_plume_km: 85, active_fires: 134, area_affected_ha: 8700,
        crops_affected: "Wheat, Rice, Sugarcane", residue_mt: 15, burnt_pct: 12, energy_potential_gj: 252000
    },
    "mp": {
        name: "Madhya Pradesh (Central)", state: "Madhya Pradesh", lat: 23.2599, lon: 77.4126,
        status: "MODERATE", severity: 35, aqi: 156, nbr: 0.08, ndvi: 0.30,
        bands: { "B02 (Blue)": 0.07, "B03 (Green)": 0.14, "B04 (Red)": 0.20, "B08 (NIR)": 0.30, "B11 (SWIR1)": 0.50, "B12 (SWIR2)": 0.42 },
        fire_clusters: [{ lat: 23.40, lon: 77.55, intensity: 38, radius: 3500 }],
        burn_history: [8, 12, 10, 15, 18, 9, 6, 7, 20, 48, 55, 22],
        smoke_plume_km: 55, active_fires: 89, area_affected_ha: 5400,
        crops_affected: "Wheat, Soybean, Gram", residue_mt: 10, burnt_pct: 6, energy_potential_gj: 168000
    },
    "odisha": {
        name: "Odisha (Eastern Corridor)", state: "Odisha", lat: 20.9517, lon: 85.0985,
        status: "LOW RISK", severity: 22, aqi: 110, nbr: 0.22, ndvi: 0.38,
        bands: { "B02 (Blue)": 0.06, "B03 (Green)": 0.16, "B04 (Red)": 0.14, "B08 (NIR)": 0.38, "B11 (SWIR1)": 0.35, "B12 (SWIR2)": 0.28 },
        fire_clusters: [{ lat: 21.10, lon: 85.25, intensity: 25, radius: 2500 }],
        burn_history: [6, 8, 7, 9, 12, 10, 8, 9, 14, 30, 35, 15],
        smoke_plume_km: 30, active_fires: 45, area_affected_ha: 2800,
        crops_affected: "Rice, Pulses", residue_mt: 5, burnt_pct: 4, energy_potential_gj: 84000
    },
    "karnataka": {
        name: "Karnataka (Southern Zone)", state: "Karnataka", lat: 15.3173, lon: 75.7139,
        status: "CLEAR", severity: 8, aqi: 52, nbr: 0.45, ndvi: 0.55,
        bands: { "B02 (Blue)": 0.08, "B03 (Green)": 0.18, "B04 (Red)": 0.10, "B08 (NIR)": 0.55, "B11 (SWIR1)": 0.15, "B12 (SWIR2)": 0.12 },
        fire_clusters: [],
        burn_history: [4, 5, 3, 4, 6, 5, 3, 4, 5, 8, 10, 6],
        smoke_plume_km: 0, active_fires: 3, area_affected_ha: 120,
        crops_affected: "Ragi, Jowar, Maize", residue_mt: 7, burnt_pct: 0.5, energy_potential_gj: 98000
    }
};

const GLOBAL_COUNTRIES = [
    { name: "Bangladesh", flag: "\uD83C\uDDE7\uD83C\uDDE9", aqi: 168, pm25: 78.1, rank: 1, burn_pct: 31, residue_mt: 80, co2_mt: 40, energy_pj: 316, power_mw: 800, status: "Hazardous" },
    { name: "Pakistan", flag: "\uD83C\uDDF5\uD83C\uDDF0", aqi: 155, pm25: 66.8, rank: 2, burn_pct: 30, residue_mt: 60, co2_mt: 30, energy_pj: 248, power_mw: 600, status: "Unhealthy" },
    { name: "India", flag: "\uD83C\uDDEE\uD83C\uDDF3", aqi: 94, pm25: 48.9, rank: 6, burn_pct: 24, residue_mt: 500, co2_mt: 194, energy_pj: 3060, power_mw: 10200, status: "Moderate" },
    { name: "Indonesia", flag: "\uD83C\uDDEE\uD83C\uDDE9", aqi: 85, pm25: 30.4, rank: 17, burn_pct: 33, residue_mt: 120, co2_mt: 500, energy_pj: 496, power_mw: 2800, status: "Moderate" },
    { name: "China", flag: "\uD83C\uDDE8\uD83C\uDDF3", aqi: 73, pm25: 32.5, rank: 12, burn_pct: 10, residue_mt: 800, co2_mt: 128, energy_pj: 3360, power_mw: 15000, status: "Moderate" },
    { name: "Brazil", flag: "\uD83C\uDDE7\uD83C\uDDF7", aqi: 42, pm25: 13.5, rank: 55, burn_pct: 27, residue_mt: 350, co2_mt: 300, energy_pj: 1618, power_mw: 14000, status: "Good" },
    { name: "Japan", flag: "\uD83C\uDDEF\uD83C\uDDF5", aqi: 35, pm25: 9.1, rank: 82, burn_pct: 6.7, residue_mt: 15, co2_mt: 2, energy_pj: 63, power_mw: 3200, status: "Good" },
    { name: "USA", flag: "\uD83C\uDDFA\uD83C\uDDF8", aqi: 33, pm25: 7.8, rank: 93, burn_pct: 4.8, residue_mt: 250, co2_mt: 35, energy_pj: 1125, power_mw: 8500, status: "Good" },
    { name: "UK", flag: "\uD83C\uDDEC\uD83C\uDDE7", aqi: 31, pm25: 8.6, rank: 88, burn_pct: 4.0, residue_mt: 20, co2_mt: 1.5, energy_pj: 87, power_mw: 1800, status: "Good" },
    { name: "Germany", flag: "\uD83C\uDDE9\uD83C\uDDEA", aqi: 28, pm25: 10.2, rank: 76, burn_pct: 5.0, residue_mt: 30, co2_mt: 3, energy_pj: 133, power_mw: 2500, status: "Good" },
    { name: "Canada", flag: "\uD83C\uDDE8\uD83C\uDDE6", aqi: 25, pm25: 6.3, rank: 105, burn_pct: 5.7, residue_mt: 35, co2_mt: 20, energy_pj: 155, power_mw: 900, status: "Good" },
    { name: "Australia", flag: "\uD83C\uDDE6\uD83C\uDDFA", aqi: 22, pm25: 5.8, rank: 110, burn_pct: 7.5, residue_mt: 40, co2_mt: 25, energy_pj: 174, power_mw: 1200, status: "Good" }
];
