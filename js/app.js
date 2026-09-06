/**
 * PRITHVI SENTINEL - Bootstrap Entry Point
 */
window.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Alert System
    AlertSystem.init();

    // 2. Initialize Map Subsystem
    MapEngine.init();

    // 3. Initialize Canvas & Image Analytics
    ImageAnalysis.init();

    // 4. Initialize CNN Feature Map Matrix
    CNNSimulation.init();

    // 5. Initialize Performance Charts
    ChartsEngine.init();

    // 6. Initialize UI Coordinator
    UIController.init();

    // 7. Refresh with real-time AQI / PM2.5 (Open-Meteo) when it arrives
    LiveData.init().catch((e) => {
        if (typeof console !== 'undefined') console.error('[LiveData] init failed:', e);
    });
});