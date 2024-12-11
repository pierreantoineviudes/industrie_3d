import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { Map } from 'react-map-gl/maplibre';
import { AmbientLight, PointLight, LightingEffect } from '@deck.gl/core';
import { HeatmapLayer, HexagonLayer } from '@deck.gl/aggregation-layers';
import DeckGL from '@deck.gl/react';

import type { Color, PickingInfo, MapViewState } from '@deck.gl/core';
import axios from 'axios';

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
    longitude: 2.8644199999999995,
    latitude: 50.47017499998957,
    zoom: 6.6,
    minZoom: 5,
    maxZoom: 15,
    pitch: 40.5,
    bearing: -27
};

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json';

type BikeRack = {
    ADDRESS: string;
    SPACES: number;
    COORDINATES: [longitude: number, latitude: number];
};

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

    const heatmapLayer = new HeatmapLayer<Etablissement>({
        id: 'HeatmapLayer',
        data: 'http://localhost:3000/alldata',
        aggregation: 'SUM',
        getPosition: (d: Etablissement) => [d.lng, d.lat],
        getWeight: (d: Etablissement) => d.taille,
        radiusPixels: 25
    });

    return (
        <div>
            <DeckGL
                layers={[heatmapLayer]}
                effects={[lightingEffect]}
                initialViewState={INITIAL_VIEW_STATE}
                controller={true}
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