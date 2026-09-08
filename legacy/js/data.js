/**
 * PRITHVI SENTINEL - Realistic Incident & Model Datasets
 */
const SENTINEL_DATA = {
    incidents: [
        {
            id: "PB-2847",
            state: "Punjab",
            district: "Sangrur Sector-Alpha",
            lat: 30.2458,
            lon: 75.8421,
            confidence: 97.3,
            classification: "ILLEGAL CROP BURNING",
            status: "CONFIRMED",
            burnAreaHa: 42.6,
            timeUtc: "14:20:15 UTC",
            crop: "Paddy / Rice Stubble",
            biomassTonnes: 1240,
            co2Tonnes: 2870,
            pm25Surge: 385,
            energyTj: 19.4,
            threatLevel: "CRITICAL",
            ndviDelta: -63.4,
            perimeterKm: 3.82,
            peakActivation: 0.9841,
            burnCoords: { cx: 270, cy: 240, r: 75 },
            timeline: [
                { time: "14:20:10", msg: "Sentinel-2 MSI Level-2A Tile Acquired" },
                { time: "14:20:12", msg: "Radiometric Calibration & SWIR Synthesis Complete" },
                { time: "14:20:13", msg: "CNN Tensor Initialized (512x512x3)" },
                { time: "14:20:14", msg: "Grad-CAM Highlighted High Thermal Cluster" },
                { time: "14:20:15", msg: "Illegal Residue Combustion Verified" }
            ]
        },
        {
            id: "HR-1932",
            state: "Haryana",
            district: "Karnal Sector-Beta",
            lat: 29.6857,
            lon: 76.9905,
            confidence: 94.1,
            classification: "ILLEGAL CROP BURNING",
            status: "CONFIRMED",
            burnAreaHa: 28.2,
            timeUtc: "13:55:02 UTC",
            crop: "Sugarcane Trash",
            biomassTonnes: 820,
            co2Tonnes: 1905,
            pm25Surge: 290,
            energyTj: 12.8,
            threatLevel: "CRITICAL",
            ndviDelta: -55.8,
            perimeterKm: 2.45,
            peakActivation: 0.9512,
            burnCoords: { cx: 220, cy: 200, r: 55 },
            timeline: [
                { time: "13:54:55", msg: "Multi-spectral L2A Granule Ingested" },
                { time: "13:54:58", msg: "Atmospheric Surface Reflectance Corrected" },
                { time: "13:55:00", msg: "Prithvi-CNN Feature Extraction Active" },
                { time: "13:55:01", msg: "SWIR-2/NIR Anomaly Gradient Localized" },
                { time: "13:55:02", msg: "Combustion Event Confirmed by AI" }
            ]
        },
        {
            id: "UP-8712",
            state: "Uttar Pradesh",
            district: "Mathura Sector-Gamma",
            lat: 27.4924,
            lon: 77.6737,
            confidence: 78.5,
            classification: "SUSPICIOUS THERMAL CLUSTER",
            status: "UNDER REVIEW",
            burnAreaHa: 14.1,
            timeUtc: "13:12:44 UTC",
            crop: "Wheat Stubble Residue",
            biomassTonnes: 390,
            co2Tonnes: 902,
            pm25Surge: 145,
            energyTj: 6.1,
            threatLevel: "HIGH RISK",
            ndviDelta: -38.2,
            perimeterKm: 1.60,
            peakActivation: 0.7924,
            burnCoords: { cx: 310, cy: 280, r: 40 },
            timeline: [
                { time: "13:12:38", msg: "Sentinel-2 Tile Downloaded" },
                { time: "13:12:40", msg: "Normalization Matrix Applied" },
                { time: "13:12:42", msg: "CNN Convolution Pass Executed" },
                { time: "13:12:43", msg: "Low-Intensity Activation Flagged" },
                { time: "13:12:44", msg: "Queued for Secondary Multi-Pass Verification" }
            ]
        },
        {
            id: "MP-4091",
            state: "Madhya Pradesh",
            district: "Sehore Sector-Delta",
            lat: 23.2031,
            lon: 77.0844,
            confidence: 42.0,
            classification: "PERMITTED / LOW INTENSITY",
            status: "MONITORING",
            burnAreaHa: 5.4,
            timeUtc: "12:40:19 UTC",
            crop: "Soybean Husk Residue",
            biomassTonnes: 150,
            co2Tonnes: 348,
            pm25Surge: 45,
            energyTj: 2.3,
            threatLevel: "WATCH",
            ndviDelta: -18.5,
            perimeterKm: 0.85,
            peakActivation: 0.4310,
            burnCoords: { cx: 200, cy: 300, r: 25 },
            timeline: [
                { time: "12:40:12", msg: "Granule Processing Initiated" },
                { time: "12:40:15", msg: "SWIR Reflectance Evaluated" },
                { time: "12:40:17", msg: "Feature Map Generated" },
                { time: "12:40:19", msg: "Threshold Below Strict Violation Boundary" }
            ]
        }
    ],

    modelPerformance: {
        epochs: Array.from({ length: 25 }, (_, i) => i * 2 + 2),
        trainAcc: [72, 78, 83, 86, 88, 90, 91.5, 92.8, 93.9, 94.6, 95.2, 95.8, 96.1, 96.4, 96.8],
        valAcc:   [68, 74, 80, 83, 85, 87, 89.2, 90.5, 92.1, 93.0, 93.8, 94.3, 94.7, 95.0, 95.2],
        trainLoss: [0.65, 0.52, 0.41, 0.33, 0.27, 0.22, 0.18, 0.15, 0.13, 0.11, 0.09, 0.08, 0.07, 0.06, 0.05],
        valLoss:   [0.70, 0.58, 0.46, 0.39, 0.32, 0.28, 0.24, 0.20, 0.18, 0.16, 0.14, 0.13, 0.12, 0.11, 0.10]
    }
};