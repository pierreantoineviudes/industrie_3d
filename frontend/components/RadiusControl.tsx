import React, { FC } from 'react';

interface RadiusControlProps {
  radius: number;
  setRadius: (radius: number) => void;
}

const RadiusControl: FC<RadiusControlProps> = ({ radius, setRadius }) => (
  <div style={{ margin: '10px' }}>
    <label>
      Radius (meters):
      <input
        type="number"
        value={radius}
        onChange={(e) => setRadius(Number(e.target.value))}
        min={100}
        max={5000}
        step={100}
        style={{ marginLeft: '10px' }}
      />
    </label>
  </div>
);

export default RadiusControl;
