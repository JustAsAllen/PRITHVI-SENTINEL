"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Incident, Region } from "@/lib/types";

const styleFor: Record<string, { color: string; cls: string }> = {
  CONFIRMED: { color: "#ff2d55", cls: "critical" },
  "UNDER REVIEW": { color: "#ff8c00", cls: "review" },
  MONITORING: { color: "#00f0ff", cls: "monitored" },
};

const markerIcon = (color: string, cls: string, size: number) =>
  L.divIcon({
    className: `hud-mapmarker-wrap ${cls}`,
    html: `<div class="hud-mapmarker ${cls}" style="--mk:${color}; --mks:${size}px"><span class="hud-mapmarker-core"></span></div>`,
    iconSize: [size * 2.2, size * 2.2],
    iconAnchor: [size * 1.1, size * 1.1],
  });

export function RegionMap({
  regions,
  incidents,
  regionId,
  incidentId,
  onSelectRegion,
  onSelectIncident,
}: {
  regions: Region[];
  incidents: Incident[];
  regionId: string;
  incidentId: string;
  onSelectRegion: (id: string) => void;
  onSelectIncident: (id: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const regionLayerRef = useRef<L.LayerGroup | null>(null);
  const incidentLayerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      zoomControl: false,
      attributionControl: true,
      minZoom: 3,
      maxZoom: 18,
      worldCopyJump: true,
    });
    map.attributionControl.setPrefix(false);
    map.attributionControl.setPosition("bottomright");

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
      subdomains: "abcd",
      maxZoom: 19,
    }).addTo(map);

    map.setView([23.5, 80.0], 5);
    L.control.zoom({ position: "bottomleft" }).addTo(map);
    mapRef.current = map;

    const regionLayer = L.layerGroup().addTo(map);
    const incidentLayer = L.layerGroup().addTo(map);
    regionLayerRef.current = regionLayer;
    incidentLayerRef.current = incidentLayer;

    const resize = () => setTimeout(() => map.invalidateSize(), 80);
    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const regionLayer = regionLayerRef.current;
    const incidentLayer = incidentLayerRef.current;
    if (!map || !regionLayer || !incidentLayer) return;

    regionLayer.clearLayers();
    incidentLayer.clearLayers();

    regions.forEach((r) => {
      const burning = r.status === "CRITICAL" || r.status === "HIGH RISK";
      const watch = r.status === "WATCH";
      const moderate = r.status === "MODERATE";
      const color = burning ? "#ff4d6d" : watch ? "#ffd166" : moderate ? "#ff8c00" : "#06d6a0";
      const cls = burning ? "critical" : watch ? "watch" : moderate ? "review" : "clear";

      const m = L.marker([r.lat, r.lon], {
        icon: markerIcon(color, cls, burning ? 8 : 6),
        zIndexOffset: burning ? 650 : 600,
        riseOnHover: true,
      }).addTo(regionLayer);
      m.bindTooltip(
        `<b>${r.name}</b> &middot; ${r.status}<br>AQI ${r.aqi} &middot; ${r.active_fires} fires<br>${r.area_affected_ha.toLocaleString()} ha burning`,
        { className: "hud-tooltip", direction: "top", offset: [0, -10] },
      );
      m.on("click", () => onSelectRegion(r.id));

      if (burning) {
        r.fire_clusters.forEach((fc) => {
          L.circle([fc.lat, fc.lon], {
            radius: fc.radius,
            color,
            weight: 1,
            fillColor: color,
            fillOpacity: 0.1,
            className: "hud-heat",
          }).addTo(regionLayer);
        });
      }
    });

    incidents.forEach((inc) => {
      const st = styleFor[inc.status] || styleFor.MONITORING;
      const child = L.marker([inc.lat, inc.lon], {
        icon: markerIcon(st.color, st.cls, st.cls === "critical" ? 9 : 7),
        zIndexOffset: st.cls === "critical" ? 800 : 700,
        riseOnHover: true,
      }).addTo(incidentLayer);
      child.bindTooltip(
        `<b>${inc.id}</b> &middot; ${inc.status}<br>${inc.state} (${inc.district})<br>${inc.burnAreaHa} ha &middot; ${inc.confidence}% conf`,
        { className: "hud-tooltip", direction: "top", offset: [0, -12] },
      );
      child.on("click", () => onSelectIncident(inc.id));
      if (st.cls === "critical") {
        L.circle([inc.lat, inc.lon], {
          radius: 22000 + inc.burnAreaHa * 220,
          color: st.color,
          weight: 1,
          fillColor: st.color,
          fillOpacity: 0.08,
          className: "hud-heat-critical",
        }).addTo(incidentLayer);
      }
    });
  }, [regions, incidents, onSelectRegion, onSelectIncident]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const r = regions.find((x) => x.id === regionId);
    if (r) map.flyTo([r.lat, r.lon], 8, { duration: 1.2 });
  }, [regionId, regions]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const inc = incidents.find((x) => x.id === incidentId);
    if (inc) map.flyTo([inc.lat, inc.lon], 9, { duration: 1.2 });
  }, [incidentId, incidents]);

  return (
    <div className="relative h-[420px] w-full">
      <style>{`
        .hud-mapmarker-wrap { background: transparent !important; border: none !important; }
        .hud-mapmarker {
          position: relative; width: var(--mks); height: var(--mks);
          box-shadow: 0 0 10px var(--mk), 0 0 2px var(--mk) inset;
        }
        .hud-mapmarker.critical { outline: 1px solid #ff2d55; }
        .hud-mapmarker.review { outline: 1px solid #ff8c00; }
        .hud-mapmarker.watch { outline: 1px solid #ffd166; }
        .hud-mapmarker.monitored { outline: 1px solid #00f0ff; }
        .hud-mapmarker.clear { outline: 1px solid #06d6a0; }
        .hud-mapmarker-core {
          position: absolute; inset: 25%; background: var(--mk);
          border-radius: 50%; box-shadow: 0 0 6px var(--mk);
        }
        .hud-heat { pointer-events: none; }
        .hud-heat-critical { pointer-events: none; }
      `}</style>
      <div ref={containerRef} className="h-full w-full bg-black" />
    </div>
  );
}