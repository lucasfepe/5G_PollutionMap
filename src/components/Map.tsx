"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { getPollutionData } from "@/lib/fetchPollution";

const Map = () => {
  const [pollutionData, setPollutionData] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      const data = await getPollutionData();
      setPollutionData(data);
    }
    fetchData();
  }, []);

  const defaultPosition: [number, number] = [51.0447, -114.0719]; // Calgary

  return (
    <MapContainer center={defaultPosition} zoom={10} style={{ height: "500px", width: "100%" }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      {pollutionData.map((station) => (
        <Marker key={station.id} position={[station.lat, station.lon]}>
          <Popup>
            <strong>{station.name}</strong>
            <br />
            Pollutant: {station.pollutant}
            <br />
            Level: {station.value} {station.unit}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default Map;
