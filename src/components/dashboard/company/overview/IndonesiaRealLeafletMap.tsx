"use client";

import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Layers, RotateCcw } from "lucide-react";
import { CompanyProgramItem, OpportunityItem, PartnerItem } from "../types";
import {
  INDONESIA_PROVINCE_GEO,
  matchGeoProvinceName,
} from "./indonesia-geo-coordinates";
import { formatRupiah } from "../../analytics/helpers";

export type BasemapType = "osm" | "satellite";
export type ActiveDataLayer = "PROGRAM" | "OPPORTUNITY" | "PARTNER";

interface IndonesiaRealLeafletMapProps {
  programs: CompanyProgramItem[];
  opportunities: OpportunityItem[];
  partners: PartnerItem[];
  selectedProvince: string | null;
  isDetailOpen?: boolean;
  activeLayer?: ActiveDataLayer;
  onActiveLayerChange?: (layer: ActiveDataLayer) => void;
  onSelectProvince: (provName: string | null) => void;
  onNavigateToProgramDetail?: (prog: CompanyProgramItem) => void;
  onNavigateToOpportunityDetail?: (opp: OpportunityItem) => void;
  onOpenCreateOpportunity?: (provinceName?: string) => void;
}

const FOCUS_COLORS: Record<string, { bg: string; border: string; text: string; hex: string }> = {
  LINGKUNGAN: { bg: "#ECFDF5", border: "#10B981", text: "#065F46", hex: "#10B981" },
  PENDIDIKAN: { bg: "#EFF6FF", border: "#3B82F6", text: "#1E40AF", hex: "#3B82F6" },
  KESEHATAN: { bg: "#FFF1F2", border: "#F43F5E", text: "#9F1239", hex: "#F43F5E" },
  PEMBERDAYAAN_EKONOMI: { bg: "#FFFBEB", border: "#F59E0B", text: "#92400E", hex: "#F59E0B" },
  INFRASTRUKTUR_SOSIAL: { bg: "#FAF5FF", border: "#8B5CF6", text: "#5B21B6", hex: "#8B5CF6" },
  TANGGAP_BENCANA: { bg: "#FEF2F2", border: "#EF4444", text: "#991B1B", hex: "#EF4444" },
  LAINNYA: { bg: "#F1F5F9", border: "#64748B", text: "#334155", hex: "#64748B" },
};

export default function IndonesiaRealLeafletMap({
  programs,
  opportunities,
  partners,
  selectedProvince,
  isDetailOpen = false,
  activeLayer: externalActiveLayer,
  onActiveLayerChange,
  onSelectProvince,
  onNavigateToProgramDetail,
  onNavigateToOpportunityDetail,
  onOpenCreateOpportunity,
}: IndonesiaRealLeafletMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const baseTileLayerRef = useRef<L.TileLayer | null>(null);

  // Single-select active data layer (Controlled or Uncontrolled)
  const [internalActiveLayer, setInternalActiveLayer] = useState<ActiveDataLayer>("PROGRAM");
  const activeLayer = externalActiveLayer ?? internalActiveLayer;
  const showPrograms = activeLayer === "PROGRAM";
  const showOpportunities = activeLayer === "OPPORTUNITY";
  const showPartners = activeLayer === "PARTNER";
  const [basemap, setBasemap] = useState<BasemapType>("osm");

  const handleSelectLayer = (layer: ActiveDataLayer) => {
    setInternalActiveLayer(layer);
    onActiveLayerChange?.(layer);
  };

  // Tile layer configurations (100% Free, No API Key, No Watermark)
  const getTileConfig = (type: BasemapType) => {
    switch (type) {
      case "satellite":
        return {
          url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          attribution:
            "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
          maxZoom: 18,
        };
      case "osm":
      default:
        return {
          url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
          attribution:
            "&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors",
          maxZoom: 19,
        };
    }
  };

  // 1. Initialize Leaflet Map Instance
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Indonesia geographic bounds
    const southWest = L.latLng(-11.5, 94.0);
    const northEast = L.latLng(6.5, 142.0);
    const bounds = L.latLngBounds(southWest, northEast);

    const map = L.map(mapContainerRef.current, {
      center: [-1.8, 118.0],
      zoom: 5,
      minZoom: 4,
      maxZoom: 14,
      maxBounds: bounds.pad(0.2),
      maxBoundsViscosity: 0.8,
      zoomControl: false,
    });

    // Zoom control in bottom right
    L.control.zoom({ position: "bottomright" }).addTo(map);

    // Initial tile layer (Default: OpenStreetMap)
    const tileConfig = getTileConfig("osm");
    const tileLayer = L.tileLayer(tileConfig.url, {
      attribution: tileConfig.attribution,
      maxZoom: tileConfig.maxZoom,
    }).addTo(map);

    baseTileLayerRef.current = tileLayer;

    // Markers layer group
    const markersGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = markersGroup;

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. Handle Basemap Switcher
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    if (baseTileLayerRef.current) {
      mapInstanceRef.current.removeLayer(baseTileLayerRef.current);
    }
    const tileConfig = getTileConfig(basemap);
    const newTile = L.tileLayer(tileConfig.url, {
      attribution: tileConfig.attribution,
      maxZoom: tileConfig.maxZoom,
    }).addTo(mapInstanceRef.current);
    baseTileLayerRef.current = newTile;
  }, [basemap]);

  // 3. Render Markers based on Active Layers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = markersLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();

    // Mapping Province -> Items to generate cluster & regional summaries
    const provAggregates: Record<
      string,
      {
        coord: { lat: number; lng: number };
        programs: CompanyProgramItem[];
        opportunities: OpportunityItem[];
        partners: PartnerItem[];
      }
    > = {};

    // Initialize all 38 provinces so unreached provinces can be identified
    Object.entries(INDONESIA_PROVINCE_GEO).forEach(([provName, geo]) => {
      provAggregates[provName] = {
        coord: { lat: geo.lat, lng: geo.lng },
        programs: [],
        opportunities: [],
        partners: [],
      };
    });

    // Aggregate Programs (match by province or deduce from targetCity / partnerCity)
    programs.forEach((p) => {
      const provName = matchGeoProvinceName(p.targetProvince, p.targetCity || p.partnerCity);
      if (provName && provAggregates[provName]) {
        provAggregates[provName].programs.push(p);
      }
    });

    // Aggregate Opportunities (match by province or deduce from targetCity)
    opportunities.forEach((o) => {
      const provName = matchGeoProvinceName(o.targetProvince, o.targetCity);
      if (provName && provAggregates[provName]) {
        provAggregates[provName].opportunities.push(o);
      }
    });

    // Aggregate Partners (match by province or deduce from city)
    partners.forEach((partner) => {
      const provName = matchGeoProvinceName(partner.province, partner.city);
      if (provName && provAggregates[provName]) {
        provAggregates[provName].partners.push(partner);
      }
    });

    // Draw Province Markers & Region Bubbles
    Object.entries(provAggregates).forEach(([provName, data]) => {
      const hasPrograms = data.programs.length > 0;
      const hasOpportunities = data.opportunities.length > 0;
      const hasPartners = data.partners.length > 0;

      const shouldShow =
        (showPrograms && hasPrograms) ||
        (showOpportunities && hasOpportunities) ||
        (showPartners && hasPartners);

      // A. Active Region with Data (Clean, Precision GIS Marker without Emojis)
      if (shouldShow) {
        let primaryColor = "#10B981"; // default emerald
        let badgeCount = 0;

        if (showPrograms && hasPrograms) {
          primaryColor = FOCUS_COLORS[data.programs[0]?.focusArea]?.hex || "#10B981";
          badgeCount = data.programs.length;
        } else if (showOpportunities && hasOpportunities) {
          primaryColor = "#6366F1"; // indigo
          badgeCount = data.opportunities.length;
        } else if (showPartners && hasPartners) {
          primaryColor = "#F59E0B"; // amber
          badgeCount = data.partners.length;
        }

        const isCurrentSelected = selectedProvince === provName;

        // Custom HTML Marker Pin (Enterprise Grade - Crisp & Readable)
        const markerHtml = `
          <div class="relative group cursor-pointer select-none">
            ${
              isCurrentSelected
                ? `<div class="absolute -inset-1.5 rounded-xl animate-ping opacity-30" style="background-color: ${primaryColor};"></div>`
                : ""
            }
            <div class="flex items-center gap-2 px-3 py-1.5 rounded-xl text-white shadow-md border transition-all duration-150 transform group-hover:-translate-y-0.5 group-hover:shadow-lg ${
              isCurrentSelected ? "ring-2 ring-white/80" : ""
            }"
                 style="background-color: #181343; border-color: ${primaryColor};">
              <span class="w-2 h-2 rounded-full shrink-0" style="background-color: ${primaryColor};"></span>
              <span class="tracking-tight text-white font-semibold text-xs whitespace-nowrap">${provName}</span>
              <span class="px-1.5 py-0.5 rounded-md text-[10px] font-extrabold text-white tabular-nums leading-none" style="background-color: ${primaryColor};">
                ${badgeCount}
              </span>
            </div>
          </div>
        `;

        const customIcon = L.divIcon({
          html: markerHtml,
          className: "custom-leaflet-marker",
          iconSize: [140, 32],
          iconAnchor: [70, 16],
        });

        const marker = L.marker([data.coord.lat, data.coord.lng], {
          icon: customIcon,
          zIndexOffset: isCurrentSelected ? 1000 : 100,
        });

        // Popup Content
        const popupDiv = document.createElement("div");
        popupDiv.className = "p-4 space-y-3 min-w-[260px] max-w-[320px] text-slate-800 text-xs";

        let popupProgramsHtml = "";
        if (hasPrograms && showPrograms) {
          popupProgramsHtml = `
            <div class="space-y-1.5 pt-2 border-t border-slate-100">
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Program Berjalan (${data.programs.length})
              </span>
              ${data.programs
                .slice(0, 2)
                .map(
                  (p) => `
                <div class="p-2 rounded-lg bg-slate-50 border border-slate-200/80 space-y-0.5">
                  <div class="font-bold text-slate-900 line-clamp-1">${p.title}</div>
                  <div class="flex items-center justify-between text-[11px]">
                    <span class="text-emerald-700 font-semibold">${formatRupiah(p.budget)}</span>
                    <button id="btn-prog-${p.id}" class="text-[10px] font-bold text-[#181343] hover:underline cursor-pointer">Rincian &rarr;</button>
                  </div>
                </div>
              `
                )
                .join("")}
            </div>
          `;
        }

        let popupOpportunitiesHtml = "";
        if (hasOpportunities && showOpportunities) {
          popupOpportunitiesHtml = `
            <div class="space-y-1.5 pt-2 border-t border-slate-100">
              <span class="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">
                Peluang Terbuka (${data.opportunities.length})
              </span>
              ${data.opportunities
                .slice(0, 2)
                .map(
                  (o) => `
                <div class="p-2 rounded-lg bg-indigo-50/50 border border-indigo-100 space-y-0.5">
                  <div class="font-bold text-indigo-950 line-clamp-1">${o.title}</div>
                  <div class="flex items-center justify-between text-[11px] text-slate-500">
                    <span>${o.focusArea.replace("_", " ")}</span>
                    <button id="btn-opp-${o.id}" class="text-[10px] font-bold text-indigo-700 hover:underline cursor-pointer">Lihat &rarr;</button>
                  </div>
                </div>
              `
                )
                .join("")}
            </div>
          `;
        }

        let popupPartnersHtml = "";
        if (hasPartners && showPartners) {
          popupPartnersHtml = `
            <div class="space-y-1.5 pt-2 border-t border-slate-100">
              <span class="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">
                Mitra Terverifikasi (${data.partners.length})
              </span>
              <div class="text-[11px] text-slate-600">
                ${data.partners.slice(0, 3).map((pt) => pt.name).join(", ")}
              </div>
            </div>
          `;
        }

        popupDiv.innerHTML = `
          <div>
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Provinsi</span>
              <span class="text-[10px] px-1.5 py-0.5 rounded font-bold bg-slate-100 text-slate-700">
                ${INDONESIA_PROVINCE_GEO[provName]?.island || "Indonesia"}
              </span>
            </div>
            <h4 class="text-sm font-extrabold text-[#181343] mt-0.5">${provName}</h4>
          </div>
          ${popupProgramsHtml}
          ${popupOpportunitiesHtml}
          ${popupPartnersHtml}
          <div class="pt-2">
            <button id="btn-select-prov-${provName.replace(/\s+/g, "-")}"
                    class="w-full py-2 px-3 rounded-xl bg-[#181343] hover:bg-[#181343]/90 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition shadow-sm">
              <span>Buka Rincian Wilayah</span>
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
          </div>
        `;

        marker.bindPopup(popupDiv, { maxWidth: 320 });

        marker.on("popupopen", () => {
          const btn = document.getElementById(`btn-select-prov-${provName.replace(/\s+/g, "-")}`);
          if (btn) {
            btn.onclick = () => {
              onSelectProvince(provName);
              marker.closePopup();
            };
          }

          data.programs.slice(0, 2).forEach((p) => {
            const pBtn = document.getElementById(`btn-prog-${p.id}`);
            if (pBtn && onNavigateToProgramDetail) {
              pBtn.onclick = () => {
                onNavigateToProgramDetail(p);
                marker.closePopup();
              };
            }
          });

          data.opportunities.slice(0, 2).forEach((o) => {
            const oBtn = document.getElementById(`btn-opp-${o.id}`);
            if (oBtn && onNavigateToOpportunityDetail) {
              oBtn.onclick = () => {
                onNavigateToOpportunityDetail(o);
                marker.closePopup();
              };
            }
          });
        });

        marker.on("click", () => {
          onSelectProvince(provName);
        });

        layer.addLayer(marker);
      } else {
        const unreachedLabel =
          activeLayer === "PROGRAM"
            ? "Belum Ada Program"
            : activeLayer === "OPPORTUNITY"
            ? "Belum Ada Peluang"
            : "Belum Ada Mitra";

        // B. Unreached Province: Subtle clickable dot
        const unreachedHtml = `
          <div class="group relative cursor-pointer flex items-center justify-center">
            <div class="w-2.5 h-2.5 rounded-full bg-slate-300 border-2 border-white shadow-2xs hover:bg-slate-600 hover:scale-125 transition-all"></div>
            <div class="absolute bottom-4 hidden group-hover:block bg-[#181343] text-white text-[10px] font-medium px-2 py-0.5 rounded-md shadow-md whitespace-nowrap z-50">
              ${provName} (${unreachedLabel})
            </div>
          </div>
        `;

        const unreachedIcon = L.divIcon({
          html: unreachedHtml,
          className: "custom-unreached-marker",
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        });

        const unreachedMarker = L.marker([data.coord.lat, data.coord.lng], {
          icon: unreachedIcon,
          zIndexOffset: 10,
        });

        // Unreached Popup with Clean Call to Action (Anti-Slop, No Emojis)
        const unreachedPopupDiv = document.createElement("div");
        unreachedPopupDiv.className = "p-4 space-y-3 min-w-[240px] text-slate-800 text-xs";
        unreachedPopupDiv.innerHTML = `
          <div>
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              ${
                activeLayer === "PROGRAM"
                  ? "Wilayah Sasaran Baru"
                  : activeLayer === "OPPORTUNITY"
                  ? "Peluang Wilayah"
                  : "Jaringan Kemitraan"
              }
            </span>
            <h4 class="text-sm font-extrabold text-[#181343] mt-0.5">${provName}</h4>
            <p class="text-[11px] text-slate-500 mt-1 leading-relaxed">
              ${
                activeLayer === "PROGRAM"
                  ? "Perusahaan belum menjalankan inisiatif program CSR di wilayah ini."
                  : activeLayer === "OPPORTUNITY"
                  ? "Belum ada peluang terbuka untuk inisiatif CSR di wilayah ini."
                  : "Belum ada mitra pelaksana resmi yang terdaftar di wilayah ini."
              }
            </p>
          </div>
          <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-700 space-y-1">
            <div class="font-bold text-xs text-[#181343]">Peluang Kemitraan Baru</div>
            <p class="text-[11px] text-slate-500 leading-snug">
              Buka peluang kemitraan CSR untuk menjangkau masyarakat di ${provName}.
            </p>
          </div>
          ${
            onOpenCreateOpportunity
              ? `
            <button id="btn-create-opp-${provName.replace(/\s+/g, "-")}"
                    class="w-full py-2 px-3 rounded-xl bg-[#181343] hover:bg-[#25205c] text-white font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition shadow-2xs">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
              </svg>
              <span>+ Buat Peluang di Wilayah Ini</span>
            </button>
          `
              : ""
          }
        `;

        unreachedMarker.bindPopup(unreachedPopupDiv, { maxWidth: 300 });

        unreachedMarker.on("popupopen", () => {
          const btn = document.getElementById(`btn-create-opp-${provName.replace(/\s+/g, "-")}`);
          if (btn && onOpenCreateOpportunity) {
            btn.onclick = () => {
              onOpenCreateOpportunity(provName);
              unreachedMarker.closePopup();
            };
          }
        });

        unreachedMarker.on("click", () => {
          onSelectProvince(provName);
        });

        layer.addLayer(unreachedMarker);
      }
    });
  }, [
    programs,
    opportunities,
    partners,
    activeLayer,
    selectedProvince,
    onSelectProvince,
    onOpenCreateOpportunity,
    onNavigateToProgramDetail,
    onNavigateToOpportunityDetail,
  ]);

  // 4. Focus on selected province if user selects from dropdown or list
  useEffect(() => {
    if (!selectedProvince || !mapInstanceRef.current) return;
    const geo = INDONESIA_PROVINCE_GEO[selectedProvince];
    if (geo) {
      mapInstanceRef.current.flyTo([geo.lat, geo.lng], 7, {
        duration: 1.2,
      });
    }
  }, [selectedProvince]);

  const handleResetView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([-1.8, 118.0], 5, { duration: 1.0 });
    }
    onSelectProvince(null);
  };

  return (
    <div className="space-y-3">
      {/* Dedicated Map Control Bar (Grounded, Clean, Responsive to Detail Panel) */}
      <div
        className={`p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs ${
          isDetailOpen
            ? "space-y-2.5"
            : "flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        }`}
      >
        {/* Header Row: Label on Left, Map Type & Reset on Right (when detail is open) */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs font-semibold text-slate-500">Lapisan Data:</span>
          </div>

          {/* When detail is open, show Basemap & Reset on the right of Row 1 */}
          {isDetailOpen && (
            <div className="flex items-center gap-2">
              <div className="flex items-center p-0.5 rounded-xl bg-slate-200/70 border border-slate-300/60 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setBasemap("osm")}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    basemap === "osm"
                      ? "bg-white text-[#181343] font-bold shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Peta Standar
                </button>
                <button
                  type="button"
                  onClick={() => setBasemap("satellite")}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    basemap === "satellite"
                      ? "bg-white text-[#181343] font-bold shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Satelit
                </button>
              </div>

              <button
                type="button"
                onClick={handleResetView}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white border border-slate-200/80 hover:bg-slate-100 text-slate-700 font-semibold transition-all cursor-pointer shadow-2xs text-xs"
                title="Reset ke Tampilan Seluruh Indonesia"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Reset Posisi</span>
              </button>
            </div>
          )}
        </div>

        {/* Layer Selection (Single Choice / Clean Tabs without Top Badge) */}
        <div className={`flex items-center gap-2 flex-wrap ${isDetailOpen ? "pt-0.5" : ""}`}>
          {/* Program Option */}
          <button
            type="button"
            onClick={() => handleSelectLayer("PROGRAM")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              activeLayer === "PROGRAM"
                ? "bg-[#181343] text-white shadow-2xs"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${activeLayer === "PROGRAM" ? "bg-emerald-400" : "bg-slate-300"}`} />
            <span>Program</span>
          </button>

          {/* Opportunities Option */}
          <button
            type="button"
            onClick={() => handleSelectLayer("OPPORTUNITY")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              activeLayer === "OPPORTUNITY"
                ? "bg-[#181343] text-white shadow-2xs"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${activeLayer === "OPPORTUNITY" ? "bg-indigo-400" : "bg-slate-300"}`} />
            <span>Peluang</span>
          </button>

          {/* Partners Option */}
          <button
            type="button"
            onClick={() => handleSelectLayer("PARTNER")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              activeLayer === "PARTNER"
                ? "bg-[#181343] text-white shadow-2xs"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${activeLayer === "PARTNER" ? "bg-amber-400" : "bg-slate-300"}`} />
            <span>Mitra</span>
          </button>
        </div>

        {/* When detail is NOT open, show Basemap & Reset on the right of the single horizontal row */}
        {!isDetailOpen && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            {/* Basemap Selection */}
            <div className="flex items-center p-0.5 rounded-xl bg-slate-200/70 border border-slate-300/60 text-xs font-medium">
              <button
                type="button"
                onClick={() => setBasemap("osm")}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  basemap === "osm"
                    ? "bg-white text-[#181343] font-bold shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Peta Standar
              </button>
              <button
                type="button"
                onClick={() => setBasemap("satellite")}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  basemap === "satellite"
                    ? "bg-white text-[#181343] font-bold shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Satelit
              </button>
            </div>

            {/* Reset View Button */}
            <button
              type="button"
              onClick={handleResetView}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200/80 hover:bg-slate-100 text-slate-700 font-semibold transition-all cursor-pointer shadow-2xs text-xs"
              title="Reset ke Tampilan Seluruh Indonesia"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Reset Posisi</span>
            </button>
          </div>
        )}
      </div>

      {/* Map Target Canvas Container */}
      <div className="relative w-full h-[480px] sm:h-[530px] rounded-2xl overflow-hidden border border-[#E8E8EA] bg-slate-100 shadow-2xs">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Minimal Grounded Legend in Bottom-Left with Layer Counts */}
        <div className="absolute bottom-3 left-3 z-[400] hidden sm:flex items-center gap-3 px-3.5 py-2 rounded-xl bg-white/95 border border-slate-200/80 shadow-2xs text-[11px] text-slate-600 select-none">
          {activeLayer === "PROGRAM" && (
            <div className="flex items-center gap-2 font-medium text-slate-800">
              <span className="w-2 h-2 rounded-full bg-[#10B981]" />
              <span>Program CSR ({programs.length})</span>
            </div>
          )}
          {activeLayer === "OPPORTUNITY" && (
            <div className="flex items-center gap-2 font-medium text-slate-800">
              <span className="w-2 h-2 rounded-full bg-[#6366F1]" />
              <span>Peluang Terbuka ({opportunities.length})</span>
            </div>
          )}
          {activeLayer === "PARTNER" && (
            <div className="flex items-center gap-2 font-medium text-slate-800">
              <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
              <span>Mitra Lokal ({partners.length})</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
            <span>Wilayah Lainnya</span>
          </div>
        </div>
      </div>
    </div>
  );
}

