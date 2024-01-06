import { Extent } from "ol/extent";
export declare function is4326(code?: string): boolean;
export declare function is3857(code?: string): boolean;
interface ResolutionsFromExtentOptions {
    maxZoom?: number;
    tileSize?: number;
    maxResolution?: number;
}
export declare function resolutionsFromExtent(extent: [number, number, number, number] | Extent, options?: ResolutionsFromExtentOptions): number[];
export declare function getWindow(gridExtent: [number, number, number, number] | Extent, z: number, x: number, y: number): number[];
export declare function crossing(extent1: number[], extent2: number[]): boolean;
export declare function adjustSize(rotated: [number, number], origin: [number, number], maxPixel: number, maxWidth: number, maxHeight: number, minSize: number): [number, number][];
export declare function normalize(value: number, min: number, max: number): number;
export declare function rotate(size: number[], affin: number[]): [[number, number, number, number], number];
export declare function clear(canvas: HTMLCanvasElement, context?: CanvasRenderingContext2D): void;
export declare function rotatePixelExtent(extent: [number, number, number, number] | Extent, rad: number): [number, number, number, number];
export {};
