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

type Etablissement = {
    lat: number,
    lng: number,
    taille: number
}

export default function App({
    mapStyle = MAP_STYLE,
    upperPercentile = 100,
    coverage = 1
}: {
    data?: Etablissement[] | null;
    mapStyle?: string;
    radius?: number;
    upperPercentile?: number;
    coverage?: number;
}) {

    const [radius, setRadius] = useState(1000);
    const [elevation, setElevation] = useState(1000);
    const [alpha, setAlpha] = useState(1);
    const [minElevation, setMinElevation] = useState<number | null>(null);
    const [maxElevation, setMaxElevation] = useState<number | null>(null);

    const layer = React.useMemo(() => {
        return new HexagonLayer<Etablissement>({
            id: 'heatmap',
            data: 'http://localhost:3000/alldata'   ,
            colorRange,
            coverage: 1,
            elevationRange: [0, elevation],
            elevationScale: 50,
            extruded: true,
            getPosition: (d) => [d.lng , d.lat],
            pickable: true,
            radius: radius,
            upperPercentile: 100,
            getElevationWeight: (d: Etablissement) => d.taille,
            getColorWeight: (d: Etablissement) => d.taille,
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
