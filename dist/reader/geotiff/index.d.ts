import type { GeoTIFFImage, TypedArray } from "geotiff";
export * as processor from "./Processor";
export * as profile from "./Profile";
export { default as Reader } from "./Reader";
export interface Sample {
    index: number;
    bands: number[];
    window?: number[];
    nodata?: number;
    resampleMethod?: string;
}
export interface Layer {
    index: number;
    min?: number;
    max?: number;
}
export interface Source extends Sample {
    width?: number;
    height?: number;
}
export interface RasterProps {
    sources: Source[];
}
export interface RasterValue {
    data: TypedArray[];
    width: number;
    height: number;
    nodata: number;
    range: [number, number];
}
export declare const rendermodes: readonly ["rgb", "single", "ndi"];
export type RenderMode = typeof rendermodes[number];
export interface RenderProps {
    mode: RenderMode;
    samples: Sample[];
    width?: number;
    height?: number;
    layers?: Layer[];
    alpha?: boolean;
    cmap?: Colormap;
}
export declare const colormaps: readonly ["jet", "hsv", "hot", "spring", "summer", "autumn", "winter", "bone", "copper", "greys", "yignbu", "greens", "yiorrd", "bluered", "rdbu", "picnic", "rainbow", "portland", "blackbody", "earth", "electric", "alpha", "viridis", "inferno", "magma", "plasma", "warm", "cool", "rainbow-soft", "bathymetry", "cdom", "chlorophyll", "density", "freesurface-blue", "freesurface-red", "oxygen", "par", "phase", "salinity", "temperature", "turbidity", "velocity-blue", "velocity-green", "cubehelix"];
export type Colormap = typeof colormaps[number];
export declare const getColor: (cmap: Colormap) => [number, number, number, number][];
export declare function getTransformedCoordinates(image: GeoTIFFImage): [[number, number, number, number], number];
export declare function getBandCount(image: GeoTIFFImage): number;
export declare function getCode(image: GeoTIFFImage): string | null;
export declare function getUnit(image: GeoTIFFImage): string | null;
export declare function getDataRange(image: GeoTIFFImage): [number, number] | null;
