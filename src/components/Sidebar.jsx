import { useState } from "react";
import axios from "axios";

let debounceTimeout;

export default function Sidebar({ onCitySelect, currentCity, collapsed, onToggle }) {
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
                width: collapsed ? "50px" : "300px",
                transition: "width 0.3s ease",
                padding: "1rem",
                background: "#f7f7f7",
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
            }}
        >
            <button
                onClick={onToggle}
                style={{
                    alignSelf: "flex-end",
                    marginBottom: "1rem",
                    background: "#ddd",
                    border: "none",
                    borderRadius: "4px",
                    padding: "0.25rem 0.5rem",
                    cursor: "pointer",
                }}
                title={collapsed ? "Expand" : "Collapse"}
            >
                {collapsed ? "▶" : "◀"}
            </button>

            {!collapsed && (
                <>
                    <h3 style={{ marginTop: 0, marginBottom: "0.5rem" }}>Find a City</h3>
                    <input
                        type="text"
                        placeholder="Search city"
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
                </>
            )}

            {!collapsed && suggestions.length > 0 && (
                <ul
                    style={{
                        listStyle: "none",
                        padding: 0,
                        marginTop: 0,
                        background: "#fff",
                        border: "1px solid #ccc",
                        maxHeight: 150,
                        overflowY: "auto",
                        borderRadius: "4px",
                        boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
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
        </div>
    );
}
