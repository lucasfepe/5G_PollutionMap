import React from "react";
import { legendStyles as styles } from "./css";
import { HEATMAP_GRADIENT } from "./constants";

interface LegendProps {
  maxValue: number;
  unit: string;
}

const Legend: React.FC<LegendProps> = ({ maxValue, unit }) => {
  return (
    <div className={styles.legend}>
      <h4>Heatmap Legend</h4>
      <div className={styles.legendContent}>
        <div
          className={styles["gradient-bar"]}
          style={{
            background: `linear-gradient(to right, ${HEATMAP_GRADIENT.map(
              ({ color }) => color
            ).join(", ")})`,
          }}
        >
          <div className={`${styles.indicator} ${styles["indicator-left"]}`}>0</div>
          <div className={`${styles.indicator} ${styles["indicator-quarter"]}`}>
            {(maxValue * 0.25).toFixed(2)}
          </div>
          <div className={`${styles.indicator} ${styles["indicator-mid"]}`}>
            {(maxValue / 2).toFixed(2)}
          </div>
          <div
            className={`${styles.indicator} ${styles["indicator-three-quarters"]}`}
          >
            {(maxValue * 0.75).toFixed(2)}
          </div>
          <div className={`${styles.indicator} ${styles["indicator-right"]}`}>
            {maxValue.toFixed(2)}
          </div>
        </div>
        <div className={styles.units}>Units: {unit}</div>
        <div className={styles.legendExplanation}>
          <div className={styles.legendItem}>
            <div className={styles.circleIndicator}></div>
            <span className={styles.legendText}>Real Data</span>
          </div>
          <div className={styles.legendItem}>
            <div className={styles.polygonIndicator}></div>
            <span className={styles.legendText}>Interpolated Data</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Legend;