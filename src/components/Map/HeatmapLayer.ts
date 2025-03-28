import { useEffect } from "react";
import * as turf from "@turf/turf"; // Import Turf.js
import { OPACITY } from "./constants";

interface PollutionData {
  id?: number;
  name: string;
  lat: number;
  lon: number;
  pollutant: string;
  value: number;
  unit: string;
}

const useHeatmapLayer = (
    map: mapboxgl.Map | null,
    pollutionData: PollutionData[],
    selectedPollutant: string,
    setMaxValue: (value: number) => void
  ) => {
    useEffect(() => {
      if (!map || pollutionData.length === 0) return;
  
      // Filter the data for the selected pollutant
      const filteredPollutionData = pollutionData.filter(
        (station) =>
          station.pollutant.toUpperCase().replace(".", "") ===
            selectedPollutant.toUpperCase() && station.value !== undefined
      );
  
      // Separate real data (with `id`) and interpolated data (without `id`)
      const realData = filteredPollutionData.filter((station) => station.id !== undefined);
  
      // Calculate the maximum value for the selected pollutant
      const max = Math.max(...filteredPollutionData.map((station) => station.value));
      setMaxValue(max);
  
      // Create points for Voronoi polygons (interpolated data)
      const pollutionGeoJSON: GeoJSON.FeatureCollection<GeoJSON.Point, GeoJSON.GeoJsonProperties> = {
        type: "FeatureCollection",
        features: filteredPollutionData.map((station) =>
          turf.point([station.lon, station.lat], { value: station.value })
        ),
      };
  
      // Ensure there are enough points to generate Voronoi polygons
      if (pollutionGeoJSON.features.length < 3) {
        console.error("Not enough points to generate Voronoi polygons. At least 3 points are required.");
        return;
      }
  
      // Dynamically calculate the bounding box
      const bbox = turf.bbox(turf.featureCollection(pollutionGeoJSON.features));
  
      // Generate Voronoi polygons
      const voronoiPolygons = turf.voronoi(pollutionGeoJSON, { bbox });
  
      // Validate Voronoi polygons
      if (!voronoiPolygons || !voronoiPolygons.features) {
        console.error("Voronoi polygons could not be generated. Check input data or bounding box.");
        return;
      }
  
      // Filter out null features
      voronoiPolygons.features = voronoiPolygons.features.filter((feature) => feature !== null);
  
      // Assign pollution values to each Voronoi polygon
      voronoiPolygons.features.forEach((polygon, index) => {
        polygon.properties = {
          value: pollutionGeoJSON.features[index]?.properties?.value || 0,
        };
      });
  
      // Add the pollution data as a source for Voronoi polygons
      if (!map.getSource("pollution-data")) {
        map.addSource("pollution-data", {
          type: "geojson",
          data: voronoiPolygons,
        });
      } else {
        (map.getSource("pollution-data") as mapboxgl.GeoJSONSource).setData(
          voronoiPolygons
        );
      }
  
      // Add a fill layer to create the temperature map effect
      if (!map.getLayer("pollution-layer")) {
        map.addLayer({
          id: "pollution-layer",
          type: "fill",
          source: "pollution-data",
          paint: {
            // Interpolate the pollution values to create a smooth gradient
            "fill-color": [
              "interpolate",
              ["linear"],
              ["get", "value"],
              0,
              "rgba(33,102,172,0)", // Transparent blue for low values
              max * 0.25,
              "rgb(103,169,207)", // Light blue
              max * 0.5,
              "rgb(255,255,178)", // Yellow
              max * 0.75,
              "rgb(254,204,92)", // Orange
              max,
              "rgb(240,59,32)", // Red for high values
            ],
            "fill-opacity": OPACITY, // Semi-transparent fill
          },
        });
      }
  
      // Add the real data as a source for the circle layer
      const realDataGeoJSON: GeoJSON.FeatureCollection<GeoJSON.Point, GeoJSON.GeoJsonProperties> = {
        type: "FeatureCollection",
        features: realData.map((station) =>
          turf.point([station.lon, station.lat], { value: station.value })
        ),
      };
  
      if (!map.getSource("real-data")) {
        map.addSource("real-data", {
          type: "geojson",
          data: realDataGeoJSON,
        });
      } else {
        (map.getSource("real-data") as mapboxgl.GeoJSONSource).setData(realDataGeoJSON);
      }
  
      // Add a circle layer for real data
      if (!map.getLayer("real-data-layer")) {
        map.addLayer({
          id: "real-data-layer",
          type: "circle",
          source: "real-data",
          paint: {
            "circle-radius": 8, // Adjust the size of the circles
            "circle-color": [
              "interpolate",
              ["linear"],
              ["get", "value"],
              0,
              "rgba(33,102,172,0)", // Transparent blue for low values
              max * 0.25,
              "rgb(103,169,207)", // Light blue
              max * 0.5,
              "rgb(255,255,178)", // Yellow
              max * 0.75,
              "rgb(254,204,92)", // Orange
              max,
              "rgb(240,59,32)", // Red for high values
            ],
            "circle-opacity": 1, // Semi-transparent circles
            "circle-stroke-color": "black",
            "circle-stroke-width": 2,
          },
        });
      }
    }, [map, pollutionData, selectedPollutant, setMaxValue]);
  };
  
  export default useHeatmapLayer;