import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Map } from 'react-map-gl/maplibre';
import { AmbientLight, PointLight, LightingEffect } from '@deck.gl/core';
import { HexagonLayer } from '@deck.gl/aggregation-layers';
import DeckGL from '@deck.gl/react';
import { JSONLoader, load } from '@loaders.gl/core';

import type { Color, PickingInfo, MapViewState } from '@deck.gl/core';
import axios from 'axios';
import { ScatterplotLayer } from 'deck.gl';
import RadiusControl from './components/RadiusControl';

// TODO: ajouter le nombre d'employés et pas juste le cluster de points

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
    console.log("objects in tooltip", object);

    return `\
    latitude: ${Number.isFinite(lat) ? lat.toFixed(6) : ''}
    longitude: ${Number.isFinite(lng) ? lng.toFixed(6) : ''}
    ${0} employés`;
}

type DataPoint = [longitude: number, latitude: number, taille: number];

type BartStation = {
    name: string;
    passengers: number;
    coordinates: [longitude: number, latitude: number];
};


const layer = new ScatterplotLayer<BartStation>({
    id: 'bart-stations',
    data: [
        { name: 'Colma', passengers: 4214, coordinates: [-122.466233, 37.684638] },
        { name: 'Civic Center', passengers: 24798, coordinates: [-122.413756, 37.779528] },
        // ...
    ],
    stroked: false,
    filled: true,
    getPosition: (d: BartStation) => d.coordinates,
    getRadius: (d: BartStation) => Math.sqrt(d.passengers),
    getFillColor: [255, 200, 0]
});

export default function App({
    data = null,
    mapStyle = MAP_STYLE,
    // radius = 1000,
    upperPercentile = 100,
    coverage = 1
}: {
    data?: DataPoint[] | null;
    mapStyle?: string;
    radius?: number;
    upperPercentile?: number;
    coverage?: number;
}) {
    const layers = [
        new HexagonLayer<DataPoint>({
            id: 'heatmap',
            colorRange,
            coverage,
            data,
            elevationRange: [0, 3000],
            elevationScale: data && data.length ? 50 : 0,
            extruded: true,
            getPosition: d => d,
            pickable: true,
            radius: 5000,
            upperPercentile,
            getElevationWeight: (d: DataPoint) => d[2],
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

    const [radius, setRadius] = useState(1000);

    return (
        <div>
            <RadiusControl radius={radius} setRadius={setRadius}/>
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
    // const data = (await load(DATA_URL, CSVLoader)).data;
    // const data = await fetch("http://localhost:3000/api/data").then(res => res.json())
    const headers = {};
    const params = { 'departement': 62 };
    const data2 = await axios.get("http://localhost:3000", { params: params });
    console.log(`data :`, data2.data);
    // const data2 = (await load("http://localhost:3000", JSONLoader));
    // console.log("data : ", data);
    console.log("data2 : ", data2);
    const points: any[] = data2.data.map(d => [d.lng, d.lat, d.taille]);
    root.render(<App data={points} />);
}