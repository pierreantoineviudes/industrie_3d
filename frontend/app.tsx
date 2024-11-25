import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Map } from 'react-map-gl/maplibre';
import { AmbientLight, PointLight, LightingEffect } from '@deck.gl/core';
import { HexagonLayer } from '@deck.gl/aggregation-layers';
import DeckGL from '@deck.gl/react';

import type { Color, PickingInfo, MapViewState } from '@deck.gl/core';
import axios from 'axios';
import RadiusControl from './components/RadiusControl';
import ElevationControl from './components/ElevationControl';

import './src/styles/slider.css';

const ambientLight = new AmbientLight({
    color: [255, 255, 255],
    intensity: 1.0
});

const pointLight1 = new PointLight({
    color: [255, 255, 255],
    intensity: 0.8,
    position: [-0.144528, 49.739968, 80000]
});

const pointLight2 = new PointLight({
    color: [255, 255, 255],
    intensity: 0.8,
    position: [-3.807751, 54.104682, 8000]
});

const lightingEffect = new LightingEffect({ ambientLight, pointLight1, pointLight2 });

const INITIAL_VIEW_STATE: MapViewState = {
    longitude: -1.415727,
    latitude: 52.232395,
    zoom: 6.6,
    minZoom: 5,
    maxZoom: 15,
    pitch: 40.5,
    bearing: -27
};

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json';

export const colorRange: Color[] = [
    [1, 152, 189],
    [73, 227, 206],
    [216, 254, 181],
    [254, 237, 177],
    [254, 173, 84],
    [209, 55, 78]
];

function getTooltip({ object }: PickingInfo) {
    if (!object) {
        return null;
    }
    const lat = object.position[1];
    const lng = object.position[0];
    const hauteur = object.elevationValue;

    return `\
    latitude: ${Number.isFinite(lat) ? lat.toFixed(6) : ''}
    longitude: ${Number.isFinite(lng) ? lng.toFixed(6) : ''}
    ${hauteur} employés`;
}

type DataPoint = [longitude: number, latitude: number, taille: number];

export default function App({
    mapStyle = MAP_STYLE,
    upperPercentile = 100,
    coverage = 1
}: {
    data?: DataPoint[] | null;
    mapStyle?: string;
    radius?: number;
    upperPercentile?: number;
    coverage?: number;
}) {

    const [radius, setRadius] = useState(1000);
    const [elevation, setElevation] = useState(1000);
    const [data, setData] = useState<DataPoint[] | null>(null);
    const [selectedDept, setSelectedDept] = useState<number | null>(null);
    const departmentIds = Array.from({ length: 96 }, (_, i) => i.toString().padStart(2, '0'));

    // Fetch data for all departments (0 to 95)
    useEffect(() => {
        const fetchData = async () => {
            const departmentData: Record<string, DataPoint[]> = {};
            for (const dept of departmentIds) {
                if (!dataByDepartment[dept]) {
                    try {
                        const params = { departement: dept };
                        const response = await axios.get('http://localhost:3000', { params });
                        departmentData[dept] = response.data.map((d: any) => [d.lng, d.lat, d.taille]);
                    } catch (error) {
                        console.error(`Error fetching data for department ${dept}:`, error);
                    }
                }
            }
            setDataByDepartment((prev) => ({ ...prev, ...departmentData }));
        };

        fetchData();
    }, [departmentIds]);

    const layers = [
        new HexagonLayer<DataPoint>({
            id: 'heatmap',
            colorRange,
            coverage,
            data,
            elevationRange: [0, elevation],
            elevationScale: data && data.length ? 50 : 0,
            extruded: true,
            getPosition: d => d,
            pickable: true,
            radius: radius,
            upperPercentile,
            getElevationWeight: (d: DataPoint) => Math.log(1 + d[2]),
            getColorWeight: (d: DataPoint) => d[2],
            material: {
                ambient: 0.64,
                diffuse: 0.6,
                shininess: 32,
                specularColor: [51, 51, 51]
            },

            transitions: {
                elevationScale: 3000
            }
        })
    ];

    return (
        <div>
            <div style={{ position: 'absolute', top: 150, left: 10, zIndex: 1000 }}>
                <label htmlFor="department-select">Select Department:</label>
                <select
                    id="department-select"
                    onChange={(e) => { setSelectedDept(Number(e.target.value)) }}
                >
                    <option value="">-- Select --</option>
                    <option value="62">62</option>
                    <option value="75">75</option>
                    <option value="13">13</option>
                    <option value="59">59</option>
                    <option value="21">21</option>
                    <option value="69">69</option>
                    <option value="78">78</option>
                    <option value="01">01</option>
                    <option value="02">02</option>
                    <option value="76">76</option>
                    <option value="11">11</option>
                    {/* Add more departments as needed */}
                </select>
            </div>
            <RadiusControl radius={radius} setRadius={setRadius} />
            <ElevationControl elevation={elevation} setElevation={setElevation} />
            <DeckGL
                layers={layers}
                effects={[lightingEffect]}
                initialViewState={INITIAL_VIEW_STATE}
                controller={true}
                getTooltip={getTooltip}
            >
                <Map reuseMaps mapStyle={mapStyle} />
            </DeckGL>
        </div>
    );
}

export async function renderToDOM(container: HTMLDivElement) {
    const root = createRoot(container);
    root.render(<App />);
}