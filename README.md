# WiFi Locator

Discover public Wi-Fi hotspots across US cities with this interactive React app. Search for any city, explore nearby hotspots on the map, and get detailed info — perfect for travelers, remote workers, or anyone needing reliable internet access on the go.

---

## Features

- **City Search with Autocomplete:** Quickly find and select US cities with smart suggestions.
- **Interactive Map:** Leaflet-powered map that centers on your selected city.
- **Live Wi-Fi Hotspots:** Fetches real-time hotspot data from OpenStreetMap’s Overpass API.
- **Hotspot Details:** Click markers to see hotspot name and address.
- **Responsive UI:** Floating search panel overlay that can be toggled without affecting the map view.

---

## Getting Started

### Prerequisites

- Node.js (v14+ recommended)
- npm or yarn

### Installation

1. Clone the repo:

```bash
    git clone <your-repo-url>
    cd <your-repo-folder>
```
2. Install dependencies:
  
```bash
    npm install
``` 

3. Run the app:

```bash
    npm start
``` 

4. Open http://localhost:3000 in your browser.


## How It Works

- Use the search overlay to find a city in the US.
- The map recenters on your selected city.
- The app queries OpenStreetMap's Overpass API to get Wi-Fi hotspots near the current map viewport.
- Hotspots appear as markers; clicking them reveals details.
- Pan and zoom to load more hotspots dynamically.

## Tech Stack

- React
- Leaflet and React-Leaflet
- OpenStreetMap Overpass API for Wi-Fi hotspot data
- Nominatim API for geocoding and autocomplete
- Axios for API requests

## Possible Improvements

- Add hotspot type filters (free, paid, cafes, libraries)
- Display hotspot coverage radius
- Allow users to save favorite hotspots
- Add user reporting and feedback system

## License

MIT License © Casey Trombley