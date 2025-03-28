import React from "react";
import { selectorStyles as styles } from "./css";

interface PollutantSelectorProps {
  selectedPollutant: string;
  onChange: (pollutant: string) => void;
}

const PollutantSelector: React.FC<PollutantSelectorProps> = ({
  selectedPollutant,
  onChange,
}) => {
  return (
    <div className={styles["selector-container"]}>
      <label htmlFor="pollutant-select" className={styles["selector-label"]}>
        Select Pollutant:
      </label>
      <select
        id="pollutant-select"
        value={selectedPollutant}
        onChange={(e) => onChange(e.target.value)}
        className={styles["selector-dropdown"]}
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
  );
};

export default PollutantSelector;