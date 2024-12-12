import React from 'react';
import '../src/styles/slider.css'; // Import the CSS

interface RadiusControlProps {
  radius: number;
  setRadius: (value: number) => void;
}

const RadiusControl: React.FC<RadiusControlProps> = ({ radius, setRadius }) => {
  return (
    <div className="radius-slider-container">
      <label htmlFor="radius-slider" className="slider-label">
        Radius:
      </label>
      <input
        id="radius-slider"
        type="range"
        min="50"
        max="5000"
        value={radius}
        onChange={(e) => setRadius(Number(e.target.value))}
      />
    </div>
  );
};

export default RadiusControl;
