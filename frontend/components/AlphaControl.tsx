import React from 'react';
import '../src/styles/slider.css'; // Import the CSS

interface AlphaControlProps {
  alpha: number;
  setAlpha: (value: number) => void;
}

const AlphaControl: React.FC<AlphaControlProps> = ({ alpha, setAlpha }: { alpha: number, setAlpha: (value: number) => void }) => {
  return (
    <div className="alpha-slider-container">
      <label htmlFor="alpha-slider" className="slider-label ">
        Alpha:
      </label>
      <input
        id="alpha-slider"
        type="range"
        min="0.01"
        max="10000"
        step="1"
        value={alpha}
        onChange={(e) => setAlpha(parseFloat(e.target.value))}
      />
    </div>
  );
};

export default AlphaControl;
