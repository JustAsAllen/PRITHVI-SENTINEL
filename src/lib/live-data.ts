import { COUNTRY_COORDS, GLOBAL_COUNTRIES, REGIONS } from "./regions";
import type { Country, Region, Status } from "./types";

const API = "https://air-quality-api.open-meteo.com/v1/air-quality";

export interface LivePoint {
  aqi: number;
  pm25: number;
  time: string;
}

export interface LiveHistoryPoint {
  date: string;
  aqi: number;
}

export interface TimelineSeries {
  name: string;
  data: (number | null)[];
}

const round1 = (v: number | null | undefined): number | null =>
  v == null ? null : Math.round(v * 10) / 10;

const statusFromAQI = (aqi: number): { region: Status; table: string } => {
  if (aqi <= 50) return { region: "CLEAR", table: "Good" };
  if (aqi <= 100) return { region: "MODERATE", table: "Moderate" };
  if (aqi <= 150) return { region: "WATCH", table: "Unhealthy (Sensitive)" };
  if (aqi <= 200) return { region: "HIGH RISK", table: "Unhealthy" };
  if (aqi <= 300) return { region: "CRITICAL", table: "Very Unhealthy" };
  return { region: "CRITICAL", table: "Hazardous" };
};

const request = async (url: string, ms = 20000): Promise<{ current?: { us_aqi?: number; pm2_5?: number; time?: string }; hourly?: { time?: string[]; us_aqi?: (number | null)[] } }> => {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    const r = await fetch(url, { signal: ctrl.signal });
    if (!r.ok) throw new Error("HTTP " + r.status);
    return (await r.json()) as ReturnType<typeof request> extends Promise<infer T> ? T : never;
  } finally {
    clearTimeout(t);
  }
};

const fetchPoint = async (
  lat: number,
  lon: number,
  withHistory: boolean,
): Promise<{ cur: LivePoint | null; history: LiveHistoryPoint[] | null }> => {
  let url = `${API}?latitude=${lat}&longitude=${lon}&current=us_aqi,pm2_5&timezone=auto`;
  if (withHistory) url += "&hourly=us_aqi&past_days=92&forecast_days=1";
  const j = await request(url);
  const cur = j.current
    ? { aqi: Math.round(j.current.us_aqi ?? 0), pm25: round1(j.current.pm2_5) ?? 0, time: j.current.time ?? "" }
    : null;
  let history: LiveHistoryPoint[] | null = null;
  if (withHistory && j.hourly?.time) {
    const byDay: Record<string, number[]> = {};
    j.hourly.time.forEach((t, i) => {
      const v = j.hourly?.us_aqi?.[i];
      if (v == null) return;
      const day = t.slice(0, 10);
      (byDay[day] = byDay[day] || []).push(v);
    });
    history = Object.keys(byDay)
      .sort()
      .map((day) => ({
        date: day,
        aqi: Math.round(byDay[day].reduce((a, b) => a + b, 0) / byDay[day].length),
      }));
  }
  return { cur, history };
};

export interface LiveDataResult {
  liveCount: number;
  timeline: { labels: string[]; series: TimelineSeries[] } | null;
  regions: Region[];
  countries: Country[];
}

export const LiveData = {
  init: async (): Promise<LiveDataResult> => {
    // Soft-clone the working copies so the UI dataset mutates in place like original.
    const workingCountries: Country[] = GLOBAL_COUNTRIES.map((c) => ({ ...c }));
    const workingRegions: Region[] = REGIONS.map((r) => ({ ...r }));

    const countryResults = await Promise.all(
      workingCountries.map(async (c) => {
        const coords = COUNTRY_COORDS[c.name];
        if (!coords) return { name: c.name, cur: null as LivePoint | null, history: null as LiveHistoryPoint[] | null };
        try {
          return { name: c.name, ...(await fetchPoint(coords[0], coords[1], true)) };
        } catch {
          return { name: c.name, cur: null, history: null };
        }
      }),
    );

    const regionResults = await Promise.all(
      workingRegions.map(async (r) => {
        try {
          return { name: r.name, cur: (await fetchPoint(r.lat, r.lon, false)).cur };
        } catch {
          return { name: r.name, cur: null as LivePoint | null };
        }
      }),
    );

    let liveCount = 0;
    const history: { name: string; points: LiveHistoryPoint[] }[] = [];

    countryResults.forEach((st) => {
      const c = workingCountries.find((x) => x.name === st.name);
      if (!c || !st.cur) return;
      c.aqi = st.cur.aqi;
      c.pm25 = st.cur.pm25;
      c.status = statusFromAQI(st.cur.aqi).table;
      liveCount++;
      if (st.history && st.history.length) history.push({ name: st.name, points: st.history });
    });

    regionResults.forEach((st) => {
      const r = workingRegions.find((x) => x.name === st.name);
      if (!r || !st.cur) return;
      r.aqi = st.cur.aqi;
      r.pm25 = st.cur.pm25;
      r.status = statusFromAQI(st.cur.aqi).region;
      liveCount++;
    });

    let timeline: LiveDataResult["timeline"] = null;
    if (history.length) {
      const fmt = (d: string) =>
        new Date(d + "T00:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric" });
      const labels = history[0].points.map((p) => fmt(p.date));
      const series: TimelineSeries[] = history.map((c) => ({
        name: c.name,
        data: labels.map((_, i) => (c.points[i] ? c.points[i].aqi : null)),
      }));
      timeline = { labels, series };
    }

    return { liveCount, timeline, regions: workingRegions, countries: workingCountries };
  },
};