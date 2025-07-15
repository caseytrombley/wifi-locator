import { useState } from "react";
import axios from "axios";

let debounceTimeout;

export default function SearchOverlay({ onCitySelect, currentCity, onClose, style = {} }) {
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);

    const handleInput = (e) => {
        const value = e.target.value;
        setQuery(value);

        clearTimeout(debounceTimeout);
        if (value.length < 3) {
            setSuggestions([]);
            return;
        }

        debounceTimeout = setTimeout(async () => {
            try {
                const res = await axios.get("https://nominatim.openstreetmap.org/search", {
                    params: {
                        q: value,
                        format: "json",
                        addressdetails: 1,
                        limit: 5,
                        countrycodes: "us",
                        dedupe: 1,
                    },
                });
                setSuggestions(res.data);
            } catch (err) {
                console.error("Autocomplete failed", err);
            }
        }, 300);
    };

    const handleSelect = (place) => {
        setQuery(place.display_name);
        setSuggestions([]);
        const lat = parseFloat(place.lat);
        const lon = parseFloat(place.lon);
        onCitySelect({ lat, lon, name: place.display_name });
    };

    return (
        <div
            style={{
                position: "absolute",
                width: 320,
                maxHeight: "60vh",
                background: "white",
                borderRadius: 6,
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                padding: "1rem",
                overflowY: "auto",
                zIndex: 2000, // higher z-index to be above map controls
                display: "flex",
                flexDirection: "column",
                ...style,
            }}
            role="dialog"
            aria-modal="true"
            aria-label="Search for city"
        >
            <div style={{ marginBottom: "0.5rem", fontWeight: "600" }}>Find a City</div>
            <input
                type="text"
                placeholder="Start typing city name..."
                value={query}
                onChange={handleInput}
                style={{
                    width: "100%",
                    padding: "0.5rem 0.75rem",
                    borderRadius: "4px",
                    border: "1px solid #ccc",
                    fontSize: "1rem",
                    boxSizing: "border-box",
                    marginBottom: "0.5rem",
                }}
                autoFocus
            />

            <div
                style={{
                    marginBottom: "1rem",
                    fontStyle: "italic",
                    color: "#555",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                }}
                title={currentCity}
            >
                Selected City: {currentCity}
            </div>

            {suggestions.length > 0 && (
                <ul
                    style={{
                        listStyle: "none",
                        padding: 0,
                        margin: 0,
                        maxHeight: 200,
                        overflowY: "auto",
                        border: "1px solid #ccc",
                        borderRadius: 4,
                        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                    }}
                >
                    {suggestions.map((place, i) => (
                        <li
                            key={i}
                            onClick={() => handleSelect(place)}
                            style={{
                                padding: "0.5rem",
                                cursor: "pointer",
                                borderBottom: i !== suggestions.length - 1 ? "1px solid #eee" : "none",
                                transition: "background-color 0.15s",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f0f0f0")}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                        >
                            {place.display_name}
                        </li>
                    ))}
                </ul>
            )}

            <button
                onClick={onClose}
                style={{
                    marginTop: "1rem",
                    alignSelf: "flex-end",
                    background: "#e0e0e0",
                    border: "none",
                    borderRadius: 4,
                    padding: "6px 12px",
                    cursor: "pointer",
                }}
                aria-label="Close search panel"
            >
                Close
            </button>
        </div>
    );
}
