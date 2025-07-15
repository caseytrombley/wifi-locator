import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Sidebar from "./components/Sidebar";
import MapView from "./components/MapView";

function bboxToKey(bbox) {
  return bbox.map((coord) => coord.toFixed(2)).join(",");
}

function App() {
  const [center, setCenter] = useState([42.36, -71.06]); // Boston default
  const [zoom, setZoom] = useState(13);
  const [hotspots, setHotspots] = useState([]);
  const [currentCity, setCurrentCity] = useState("Boston, MA");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const fetchTimeout = useRef(null);
  const hotspotCache = useRef({});

  const fetchWifiHotspots = async (bboxCoords) => {
    if (!bboxCoords) return;

    const latDiff = bboxCoords[2] - bboxCoords[0];
    const lonDiff = bboxCoords[3] - bboxCoords[1];

    if (latDiff > 3 || lonDiff > 3) return;

    const key = bboxToKey(bboxCoords);

    if (hotspotCache.current[key]) {
      setHotspots(hotspotCache.current[key]);
      return;
    }

    const bbox = bboxCoords.join(",");
    const query = `
      [out:json][timeout:25];
      (
        node["internet_access"="wlan"](${bbox});
        node["internet_access"="yes"](${bbox});
      );
      out body;
    `;

    try {
      const res = await axios.get("https://overpass-api.de/api/interpreter", {
        params: { data: query },
      });

      const data = res.data.elements.map((el) => ({
        lat: el.lat,
        lon: el.lon,
        name: el.tags?.name,
        address: el.tags?.["addr:full"] || el.tags?.["addr:street"] || "",
      }));

      hotspotCache.current[key] = data;
      setHotspots(data);
    } catch (err) {
      console.error("Failed to fetch hotspots:", err);
      setHotspots([]);
    }
  };

  const handleCitySelect = ({ lat, lon, name }) => {
    setCenter([lat, lon]);
    setCurrentCity(name);

    const delta = 0.05;
    const bboxCoords = [lat - delta, lon - delta, lat + delta, lon + delta];
    fetchWifiHotspots(bboxCoords);
  };

  const handleMapMove = (bounds, mapZoom) => {
    setZoom(mapZoom);

    clearTimeout(fetchTimeout.current);
    fetchTimeout.current = setTimeout(() => {
      fetchWifiHotspots([
        bounds._southWest.lat,
        bounds._southWest.lng,
        bounds._northEast.lat,
        bounds._northEast.lng,
      ]);
    }, 500);
  };

  useEffect(() => {
    const delta = 0.05;
    fetchWifiHotspots([
      center[0] - delta,
      center[1] - delta,
      center[0] + delta,
      center[1] + delta,
    ]);
  }, [center]); // ✅ fixed warning

  return (
      <div style={{ display: "flex", width: "100vw", height: "100vh" }}>
        <Sidebar
            onCitySelect={handleCitySelect}
            currentCity={currentCity}
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed((prev) => !prev)}
        />
        <div style={{ flex: 1 }}>
          <MapView
              center={center}
              zoom={zoom}
              hotspots={hotspots}
              onMapMove={handleMapMove}
              sidebarCollapsed={sidebarCollapsed}
          />
        </div>

        {zoom < 12 && (
            <div
                style={{
                  position: "absolute",
                  top: 20,
                  left: sidebarCollapsed ? 60 : 320,
                  padding: "6px 12px",
                  background: "rgba(255,255,255,0.9)",
                  borderRadius: 4,
                  boxShadow: "0 0 6px rgba(0,0,0,0.15)",
                  fontSize: 14,
                  zIndex: 1000,
                }}
            >
              Zoom in to see Wi-Fi hotspots
            </div>
        )}
      </div>
  );
}

export default App;
