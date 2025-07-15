import { useMap } from "react-leaflet";
import { useEffect } from "react";

export default function RecenterMap({ center }) {
    const map = useMap();

    useEffect(() => {
        map.setView(center, 13); // Zoom 13 is usually good
    }, [center, map]);

    return null;
}
