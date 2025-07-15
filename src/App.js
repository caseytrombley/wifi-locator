import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import MapView from "./components/MapView";
import SearchOverlay from "./components/SearchOverlay";

function bboxToKey(bbox) {
    return bbox.map((coord) => coord.toFixed(2)).join(",");
}

export default function App() {
    const [center, setCenter] = useState([42.36, -71.06]); // Boston default
    const [zoom, setZoom] = useState(13);
    const [hotspots, setHotspots] = useState([]);
    const [currentCity, setCurrentCity] = useState("Boston, MA");
    const [searchVisible, setSearchVisible] = useState(true); // visible on load
    const fetchTimeout = useRef(null);
    const hotspotCache = useRef({});

    const fetchWifiHotspots = async (bboxCoords) => {
        if (!bboxCoords) return;

        const latDiff = bboxCoords[2] - bboxCoords[0];
        const lonDiff = bboxCoords[3] - bboxCoords[1];

        if (latDiff > 3 || lonDiff > 3) return; // avoid huge queries

        const key = bboxToKey(bboxCoords);

        if (hotspotCache.current[key]) {
            setHotspots(hotspotCache.current[key]);
            return;
        }

        const bbox = bboxCoords.join(",");
        const query = `
          [out:json][timeout:25];
          (
            node["internet_access"~"wlan|yes|wifi|free"](${bbox});
            node["wifi"="yes"](${bbox});
            node["amenity"="cafe"](${bbox});
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
        setSearchVisible(false);

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
    }, [center]);

    return (
        <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
            {/* Floating Search Toggle Button (top-right) */}
            <button
                onClick={() => setSearchVisible((v) => !v)}
                style={{
                    position: "absolute",
                    top: 10,
                    right: 10,
                    zIndex: 1500,
                    padding: "6px 10px",
                    borderRadius: 4,
                    border: "none",
                    background: "#007bff",
                    color: "white",
                    cursor: "pointer",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
                    fontWeight: "bold",
                    fontSize: "0.9rem",
                }}
                aria-label={searchVisible ? "Hide search panel" : "Show search panel"}
            >
                {searchVisible ? "✕" : "🔍"}
            </button>

            {/* Floating Search Overlay (top-right) */}
            {searchVisible && (
                <SearchOverlay
                    onCitySelect={handleCitySelect}
                    currentCity={currentCity}
                    onClose={() => setSearchVisible(false)}
                    style={{ top: 50, right: 10, left: "auto", zIndex: 2000 }}
                />
            )}

            {/* Map fills viewport */}
            <MapView
                center={center}
                zoom={zoom}
                hotspots={hotspots}
                onMapMove={handleMapMove}
            />
        </div>
    );
}
