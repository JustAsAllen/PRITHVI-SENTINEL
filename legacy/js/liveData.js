/**
 * PRITHVI SENTINEL - Live Data Layer
 * Pulls real-time AQI & PM2.5 from the Open-Meteo Air Quality API (free, no key).
 * Refreshes REGIONS / GLOBAL_COUNTRIES datasets and rebuilds the AQI timeline
 * chart with a real ~90-day daily-average series for all 12 countries.
 */
const LiveData = (() => {
    const API = 'https://air-quality-api.open-meteo.com/v1/air-quality';

    const COUNTRY_COORDS = {
        "Bangladesh": [23.8103, 90.4125],    // Dhaka
        "Pakistan": [31.5497, 74.3436],      // Lahore
        "India": [28.7041, 77.1025],         // New Delhi
        "Indonesia": [-6.2088, 106.8456],    // Jakarta
        "China": [39.9042, 116.4074],        // Beijing
        "Brazil": [-23.5505, -46.6333],      // Sao Paulo
        "Japan": [35.6762, 139.6503],        // Tokyo
        "USA": [40.7128, -74.0060],          // New York
        "UK": [51.5074, -0.1278],            // London
        "Germany": [52.5200, 13.4050],       // Berlin
        "Canada": [43.6532, -79.3832],       // Toronto
        "Australia": [-33.8688, 151.2093]    // Sydney
    };

    const nowUTC = () => new Date().toISOString().slice(11, 19);

    const statusFromAQI = (aqi) => {
        if (aqi <= 50) return { region: "CLEAR", table: "Good" };
        if (aqi <= 100) return { region: "MODERATE", table: "Moderate" };
        if (aqi <= 150) return { region: "WATCH", table: "Unhealthy (Sensitive)" };
        if (aqi <= 200) return { region: "HIGH RISK", table: "Unhealthy" };
        if (aqi <= 300) return { region: "CRITICAL", table: "Very Unhealthy" };
        return { region: "CRITICAL", table: "Hazardous" };
    };

    const round1 = (v) => Math.round(v * 10) / 10;

    const request = (url, ms = 20000) => {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), ms);
        return fetch(url, { signal: ctrl.signal })
            .then(r => {
                if (!r.ok) throw new Error('HTTP ' + r.status);
                return r.json();
            })
            .finally(() => clearTimeout(t));
    };

    // One request per location: current + (optionally) 92 days of hourly AQI for the history chart.
    const fetchPoint = (lat, lon, withHistory) => {
        let url = `${API}?latitude=${lat}&longitude=${lon}&current=us_aqi,pm2_5&timezone=auto`;
        if (withHistory) url += '&hourly=us_aqi&past_days=92&forecast_days=1';
        return request(url).then(j => {
            const cur = j.current ? { aqi: j.current.us_aqi, pm25: round1(j.current.pm2_5), time: j.current.time } : null;
            let history = null;
            if (withHistory && j.hourly && j.hourly.time) {
                const byDay = {};
                j.hourly.time.forEach((t, i) => {
                    const v = j.hourly.us_aqi[i];
                    if (v == null) return;
                    const day = t.slice(0, 10);
                    (byDay[day] = byDay[day] || []).push(v);
                });
                history = Object.keys(byDay).sort().map(day => ({
                    date: day,
                    aqi: Math.round(byDay[day].reduce((a, b) => a + b, 0) / byDay[day].length)
                }));
            }
            return { cur, history };
        });
    };

    const buildTimeline = (history) => {
        if (!history.length) return null;
        const fmt = (d) => new Date(d + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        const labels = history[0].points.map(p => fmt(p.date));
        const series = history.map(c => ({ name: c.name, data: labels.map((_, i) => c.points[i] ? c.points[i].aqi : null) }));
        return { labels, series };
    };

    const init = async () => {
        SENTINEL_DATA.incidents.forEach(inc => { inc.timeUtc = `${nowUTC()} UTC`; });

        const countryTasks = GLOBAL_COUNTRIES.map(async c => {
            const coords = COUNTRY_COORDS[c.name];
            if (!coords) return { name: c.name, cur: null, history: null };
            try { return { name: c.name, ...(await fetchPoint(coords[0], coords[1], true)) }; }
            catch (e) { return { name: c.name, cur: null, history: null }; }
        }, true);

        const regionTasks = Object.values(REGIONS).map(async r => {
            try { return { name: r.name, cur: (await fetchPoint(r.lat, r.lon, false)).cur }; }
            catch (e) { return { name: r.name, cur: null }; }
        });

        const [countries, regions] = await Promise.all([
            Promise.all(countryTasks),
            Promise.all(regionTasks)
        ]);

        let liveCount = 0;
        const history = [];

        countries.forEach(st => {
            const c = GLOBAL_COUNTRIES.find(x => x.name === st.name);
            if (!c || !st.cur) return;
            c.aqi = st.cur.aqi;
            c.pm25 = st.cur.pm25;
            c.status = statusFromAQI(st.cur.aqi).table;
            liveCount++;
            if (st.history && st.history.length) history.push({ name: st.name, points: st.history });
        });

        regions.forEach(st => {
            const r = Object.values(REGIONS).find(x => x.name === st.name);
            if (!r || !st.cur) return;
            r.aqi = st.cur.aqi;
            r.pm25 = st.cur.pm25;
            r.status = statusFromAQI(st.cur.aqi).region;
            liveCount++;
        });

        const timeline = buildTimeline(history);
        if (timeline) ChartsEngine.updateTimelineReal(timeline.labels, timeline.series);

        window.dispatchEvent(new CustomEvent('livedata:updated', {
            detail: { liveCount, time: new Date().toISOString() }
        }));

        if (typeof console !== 'undefined') {
            console.log(`[LiveData] refreshed ${liveCount} locations from Open-Meteo`);
        }
        return liveCount;
    };

    return { init };
})();