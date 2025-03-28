import React, { useEffect, useState } from "react";
import { getPollutionData } from "@/lib/fetchPollution";
import useHeatmapLayer from "./HeatmapLayer";
import PollutantSelector from "./PollutantSelector";
import Legend from './Legend';
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { mapStyles as styles } from "./css";

interface PollutionData {
  id: number;
  name: string;
  lat: number;
  lon: number;
  pollutant: string;
  value: number;
  unit: string;
}

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";

const Map = () => {
  const [pollutionData, setPollutionData] = useState<PollutionData[]>([]);
  const [selectedPollutant, setSelectedPollutant] = useState<string>("pm25");
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [maxValue, setMaxValue] = useState<number>(0);

  // Fetch pollution data
  useEffect(() => {
    async function fetchData() {
      const data = await getPollutionData();
      setPollutionData(data);
    }
    fetchData();
  }, []);

  // Initialize the map
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

  // Use the custom hook to manage the heatmap layer
  useHeatmapLayer(map, pollutionData, selectedPollutant, setMaxValue);

  return (
    <div className={styles["map-container"]}>
      <PollutantSelector
        selectedPollutant={selectedPollutant}
        onChange={setSelectedPollutant}
      />
      <div id="map" className={styles.map} />
      <Legend
        maxValue={maxValue}
        unit={
          pollutionData.find(
            (station) =>
              station.pollutant.toUpperCase().replace(".", "") ===
              selectedPollutant.toUpperCase()
          )?.unit || ""
        }
      />
    </div>
  );
};

export default Map;