import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import RecenterMap from "./RecenterMap";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

function MapEventsHandler({ onMapMove }) {
    const map = useMapEvents({
        moveend: () => {
            onMapMove && onMapMove(map.getBounds(), map.getZoom());
        },
        zoomend: () => {
            onMapMove && onMapMove(map.getBounds(), map.getZoom());
        },
    });
    return null;
}

// 👇 This component forces Leaflet to resize the map when the sidebar changes
function ResizeMapOnSidebarToggle({ sidebarCollapsed }) {
    const map = useMap();

    useEffect(() => {
        setTimeout(() => {
            map.invalidateSize();
        }, 300); // match sidebar transition duration
    }, [sidebarCollapsed, map]);

    return null;
}

export default function MapView({ center, zoom, hotspots, onMapMove, sidebarCollapsed }) {
    return (
        <MapContainer
            center={center}
            zoom={zoom}
            style={{ height: "100%", width: "100%" }}
            scrollWheelZoom={true}
        >
            <RecenterMap center={center} />
            <MapEventsHandler onMapMove={onMapMove} />
            <ResizeMapOnSidebarToggle sidebarCollapsed={sidebarCollapsed} />
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {hotspots.map((spot, idx) => (
                <Marker key={idx} position={[spot.lat, spot.lon]}>
                    <Popup>
                        <strong>{spot.name || "Wi-Fi Hotspot"}</strong>
                        <br />
                        {spot.address || "No address available"}
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}
