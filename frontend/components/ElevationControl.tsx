import React from 'react';
import '../src/styles/slider.css'; // Import the CSS

interface ElevationControlProps {
  elevation: number;
  setElevation: (value: number) => void;
}

const ElevationControl: React.FC<ElevationControlProps> = ({ elevation, setElevation }) => {
  return (
    <div className="elevation-slider-container">
      <label htmlFor="elevation-slider" className="slider-label">
        Elevation:
      </label>
      <input
        id="elevation-slider"
        type="range"
        min="50"
        max="5000"
        value={elevation}
        onChange={(e) => setElevation(Number(e.target.value))}
      />
    </div>
  );
};

export default ElevationControl;
