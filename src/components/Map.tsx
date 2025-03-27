import React, { useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { getPollutionData } from "@/lib/fetchPollution";

interface PollutionData {
  id: number;
  name: string;
  lat: number;
  lon: number;
  pollutant: string;
  value: number;
  unit: string;
}

// Define the gradient in one place
const HEATMAP_GRADIENT = [
  { stop: 0, color: "rgba(33,102,172,0)" }, // Transparent blue
  { stop: 0.25, color: "rgb(103,169,207)" }, // Light blue
  { stop: 0.5, color: "rgb(255,255,178)" }, // Yellow
  { stop: 0.75, color: "rgb(254,204,92)" }, // Orange
  { stop: 1, color: "rgb(240,59,32)" }, // Red
];

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";

const Map = () => {
  const [pollutionData, setPollutionData] = useState<PollutionData[]>([]);
  const [selectedPollutant, setSelectedPollutant] = useState<string>("pm25");
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [maxValue, setMaxValue] = useState<number>(0);

  useEffect(() => {
    async function fetchData() {
      const data = await getPollutionData();
      setPollutionData(data);
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (!map) {
      const initializeMap = new mapboxgl.Map({
        container: "map",
        style: "mapbox://styles/mapbox/light-v10",
        center: [-114.0719, 51.0447],
        zoom: 10,
      });

      initializeMap.on("load", () => {
        setMap(initializeMap);
      });
    }
  }, [map]);

  useEffect(() => {
    if (!map || pollutionData.length === 0) return;

    const max = Math.max(
      ...pollutionData
        .filter(
          (station) =>
            station.pollutant.toUpperCase().replace(".", "") ===
              selectedPollutant.toUpperCase() && station.value !== undefined
        )
        .map((station) => station.value)
    );
    setMaxValue(max);

    const heatmapData: GeoJSON.FeatureCollection = {
      type: "FeatureCollection",
      features: pollutionData
        .filter(
          (station) =>
            station.pollutant.toUpperCase().replace(".", "") ===
              selectedPollutant.toUpperCase() &&
            station.lat !== undefined &&
            station.lon !== undefined &&
            station.value !== undefined
        )
        .map((station) => ({
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [station.lon, station.lat],
          },
          properties: {
            value: (station.value / max) * 100,
          },
        })),
    };

    if (map.getSource("pollution-data")) {
      (map.getSource("pollution-data") as mapboxgl.GeoJSONSource).setData(
        heatmapData
      );
    } else {
      map.addSource("pollution-data", {
        type: "geojson",
        data: heatmapData,
      });

      map.addLayer({
        id: "heatmap-layer",
        type: "heatmap",
        source: "pollution-data",
        maxzoom: 24,
        paint: {
          "heatmap-weight": [
            "interpolate",
            ["linear"],
            ["get", "value"],
            0,
            0,
            100,
            1,
          ],
          "heatmap-intensity": [
            "interpolate",
            ["linear"],
            ["zoom"],
            0,
            1,
            15,
            3,
          ],
          "heatmap-color": [
            "interpolate",
            ["linear"],
            ["heatmap-density"],
            ...HEATMAP_GRADIENT.flatMap(({ stop, color }) => [stop, color]),
          ],
          "heatmap-radius": [
            "interpolate",
            ["linear"],
            ["zoom"],
            0,
            100,
            15,
            100,
          ],
          "heatmap-opacity": [
            "interpolate",
            ["linear"],
            ["zoom"],
            0,
            1,
            15,
            0.5,
          ],
        },
      });
    }
  }, [map, pollutionData, selectedPollutant]);

  return (
    <div style={{ position: "relative" }}>
      {/* Dropdown to select pollutant */}
      <div style={{ marginBottom: "10px" }}>
        <label htmlFor="pollutant-select">Select Pollutant: </label>
        <select
          id="pollutant-select"
          value={selectedPollutant}
          onChange={(e) => setSelectedPollutant(e.target.value)}
        >
          <option value="pm03 count">PM0.3 Count</option>
          <option value="pm03">PM0.3</option>
          <option value="pm1">PM1</option>
          <option value="pm25">PM2.5</option>
          <option value="pm10">PM10</option>
          <option value="no2">NO2</option>
          <option value="no">NO</option>
          <option value="o3">O3</option>
          <option value="co">CO</option>
          <option value="rh">RH</option>
          <option value="Temperature (C)">Temperature</option>
        </select>
      </div>

      {/* Map container */}
      <div id="map" style={{ height: "500px", width: "100%" }} />

      {/* Legend */}
      <div
        style={{
          position: "absolute",
          bottom: "20px",
          left: "20px",
          backgroundColor: "white",
          padding: "10px",
          borderRadius: "5px",
          textAlign: "center",
          boxShadow: "0 2px 5px rgba(0,0,0,0.3)",
          zIndex: 1, // Increased width to fit all indicators
        }}
      >
        <h4>Heatmap Legend</h4>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginLeft: "1em",
            marginRight: "1em"
          }}
        >
          {/* Gradient Bar */}
          <div
            style={{
              position: "relative",
              height: "20px",
              width: "180px", // Adjusted width for the gradient bar
              background: `linear-gradient(to right, ${HEATMAP_GRADIENT.map(
                ({ color }) => color
              ).join(", ")})`,
              marginBottom: "10px",
              marginTop: "0.5em",
              borderRadius: "5px", // Rounded corners for the gradient bar
            }}
          >
            {/* Indicators */}
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: "0%",
                transform: "translateX(-50%)",
                fontSize: "12px",
              }}
            >
              0
            </div>
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: "25%",
                transform: "translateX(-50%)",
                fontSize: "12px",
              }}
            >
              {(maxValue * 0.25).toFixed(2)}
            </div>
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: "50%",
                transform: "translateX(-50%)",
                fontSize: "12px",
              }}
            >
              {(maxValue / 2).toFixed(2)}
            </div>
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: "75%",
                transform: "translateX(-50%)",
                fontSize: "12px",
              }}
            >
              {(maxValue * 0.75).toFixed(2)}
            </div>
            <div
              style={{
                position: "absolute",
                top: "100%",
                right: "0%",
                transform: "translateX(50%)",
                fontSize: "12px"
              }}
            >
              {maxValue.toFixed(2)}
            </div>
          </div>
          {/* Units */}
          <div style={{ fontSize: "12px", color: "gray",
                marginTop: "0.5em" }}>
            Units:{" "}
            {pollutionData.find(
              (station) =>
                station.pollutant.toUpperCase().replace(".", "") ===
                selectedPollutant.toUpperCase()
            )?.unit || ""}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Map;
