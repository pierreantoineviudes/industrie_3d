import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { Map } from 'react-map-gl/maplibre';
import { AmbientLight, PointLight, LightingEffect } from '@deck.gl/core';
import { HexagonLayer } from '@deck.gl/aggregation-layers';
import DeckGL from '@deck.gl/react';

import type { Color, PickingInfo, MapViewState } from '@deck.gl/core';
import axios from 'axios';
import RadiusControl from './components/RadiusControl';
import ElevationControl from './components/ElevationControl';
import AlphaControl from './components/AlphaControl';

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
    const [alpha, setAlpha] = useState(1);
    const dataRef = useRef<DataPoint[]>([]);
    const departmentIds = Array.from({ length: 96 }, (_, i) => i.toString().padStart(2, '0'));
    const fetchedDepartments = useRef(new Set()); // To track successfully fetched departments
    const missingDepartments = useRef(new Set()); // To track departments with no data (404)
    const [minElevation, setMinElevation] = useState<number | null>(null);
    const [maxElevation, setMaxElevation] = useState<number | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            for (const dept of departmentIds) {
                // Skip if already fetched or known to have no data
                if (fetchedDepartments.current.has(dept) || missingDepartments.current.has(dept)) {
                    continue;
                }

                try {
                    const params = { departement: dept };
                    const response = await axios.get('http://localhost:3000', { params });
                    const deptData = response.data.map((d: any) => [d.lng, d.lat, d.taille]);
                    dataRef.current = [...dataRef.current, ...deptData]
                    fetchedDepartments.current.add(dept); // Mark as successfully fetched
                    const values = dataRef.current.map((d) => d[2]); // Assuming `d[2]` is the value to compute min/max
                    setMinElevation(Math.min(...values));
                    setMaxElevation(Math.max(...values));
                } catch (error: any) {
                    if (error.response?.status === 404) {
                        console.warn(`No data found for department ${dept}. Skipping...`);
                        missingDepartments.current.add(dept); // Mark as missing
                    } else {
                        console.error(`Error fetching data for department ${dept}:`, error);
                    }
                }
            }
        };

        fetchData().then(() => console.log("fetching data done"));
    }, [departmentIds]);

    const layer = React.useMemo(() => {
        return new HexagonLayer<DataPoint>({
            id: 'heatmap',
            data: dataRef.current,
            colorRange,
            coverage: 1,
            elevationRange: [0, elevation],
            elevationScale: dataRef.current.length ? 100 : 0,
            extruded: true,
            getPosition: (d) => d,
            pickable: true,
            radius: radius,
            upperPercentile: 100,
            getElevationWeight: (d: DataPoint) => Math.log(1 + ((d[2] - minElevation) / (maxElevation - minElevation))),
            getColorWeight: (d: DataPoint) => Math.log(1 + ((d[2] - minElevation) / (maxElevation - minElevation))),
            colorScaleType: "quantize",
            material: {
                ambient: 0.64,
                diffuse: 0.6,
                shininess: 32,
                specularColor: [51, 51, 51]
            }
        })
    }, [radius, elevation, alpha]);

    return (
        <div>
            <RadiusControl radius={radius} setRadius={setRadius} />
            <ElevationControl elevation={elevation} setElevation={setElevation} />
            <AlphaControl alpha={alpha} setAlpha={setAlpha} />
            <DeckGL
                layers={[layer]}
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
