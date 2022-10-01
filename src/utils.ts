import { Extent } from "ol/extent";
import { PROJECTIONS as EPSG3857_PROJECTIONS } from "ol/proj/epsg3857";
import { PROJECTIONS as EPSG4326_PROJECTIONS } from "ol/proj/epsg4326";
import { DEFAULT_MAX_ZOOM, DEFAULT_TILE_SIZE } from "ol/tilegrid/common";

export function is4326(code?: string): boolean {
    return !!EPSG4326_PROJECTIONS.find((projection) => {
        return projection.getCode() === code;
    });
}
export function is3857(code?: string): boolean {
    return !!EPSG3857_PROJECTIONS.find((projection) => {
        return projection.getCode() === code;
    });
}

interface ResolutionsFromExtentOptions {
    maxZoom?: number;
    tileSize?: number;
    maxResolution?: number;
}
// https://github.com/openlayers/openlayers/blob/v6.15.0/src/ol/tilegrid.js
export function resolutionsFromExtent(
    extent: [number, number, number, number] | Extent,
    options?: ResolutionsFromExtentOptions
): number[] {
    const maxZoom = options?.maxZoom ?? DEFAULT_MAX_ZOOM;

    const width = extent[2] - extent[0];
    const height = extent[3] - extent[1];

    const tileSize =
        options?.tileSize ?? DEFAULT_TILE_SIZE;
    const maxResolution =
        options?.maxResolution && options.maxResolution > 0
            ? options.maxResolution
            : Math.max(width / tileSize, height / tileSize);
    const length = maxZoom + 1;
    const resolutions: number[] = [];
    for (let z = 0; z < length; ++z) {
        resolutions[z] = maxResolution / Math.pow(2, z);
    }
    return resolutions;
}

export function getWindow(
    gridExtent: [number, number, number, number] | Extent,
    z: number,
    x: number,
    y: number
): number[] {
    const size =
        Math.max(gridExtent[2] - gridExtent[0], gridExtent[3] - gridExtent[1]) /
        2 ** z;
    const left = gridExtent[0] + x * size;
    const top = gridExtent[3] - y * size;
    const right = left + size;
    const bottom = top - size;

    return [left, top, right, bottom];
}

export function crossing(extent1: number[], extent2: number[]): boolean {
    return (
        Math.max(extent1[0], extent2[0]) <= Math.min(extent1[2], extent2[2]) &&
        Math.max(extent1[1], extent2[1]) <= Math.min(extent1[3], extent2[3])
    );
}

export function adjustSize(
    rotated: [number, number],
    origin: [number, number],
    maxPixel: number,
    maxWidth: number,
    maxHeight: number,
    minSize: number
): [number, number][] {
    // adjust size to minSize - maxSize
    let [width, height] = rotated;
    let [originWidth, orignHeight] = origin;
    if (maxPixel > 0 && maxPixel < width * height) {
        const r = Math.sqrt(maxPixel / (width * height));
        width *= r;
        height *= r;
        originWidth *= r;
        orignHeight *= r;
    }
    if (maxWidth > 0 && maxWidth < width) {
        const r = maxWidth / width;
        width *= r;
        height *= r;
        originWidth *= r;
        orignHeight *= r;
    }
    if (maxHeight > 0 && maxHeight < height) {
        const r = maxHeight / height;
        width *= r;
        height *= r;
        originWidth *= r;
        orignHeight *= r;
    }
    if (width < height) {
        if (width < minSize) {
            const r = minSize / width;
            width = minSize;
            height *= r;
            originWidth *= r;
            orignHeight *= r;
        }
    } else {
        if (height < minSize) {
            const r = minSize / height;
            height = minSize;
            width *= r;
            originWidth *= r;
            orignHeight *= r;
        }
    }
    if (originWidth < 1 || orignHeight < 1) throw new Error("Unexpected size.");
    width = Math.round(width);
    height = Math.round(height);
    originWidth = Math.round(originWidth);
    orignHeight = Math.round(orignHeight);

    return [
        [width, height],
        [originWidth, orignHeight],
    ];
}

export function normalize(value: number, min: number, max: number): number {
    const gain = 1 / (max - min);
    const bias = -min * gain;
    return Math.min(Math.max(gain * value + bias, 0), 1);
}

export function rotate(size: number[], affin: number[]): [[number, number, number, number], number] {
    const [width, height] = size;
    const leftTop = [0, 0];
    const leftBottom = [0, height];
    const rightBottom = [width, height];
    const rightTop = [width, 0];
    const transformed = [leftTop, leftBottom, rightBottom, rightTop].map((v) => {
        if (affin.length === 16)
            return [
                affin[0] * v[0] + affin[1] * v[1] + affin[3],
                affin[4] * v[0] + affin[5] * v[1] + affin[7],
            ];

        return [
            affin[0] * v[0] + affin[1] * v[1] + affin[2],
            affin[3] * v[0] + affin[4] * v[1] + affin[5],
        ];
    });
    const xs = transformed.map((v) => {
        return v[0];
    });
    const ys = transformed.map((v) => {
        return v[1];
    });
    const beforeOrienting = [
        leftTop[0] - leftBottom[0],
        leftTop[1] - leftBottom[1],
    ]; // left-hand to right-hand
    const afterOrienting = [
        transformed[1][0] - transformed[0][0],
        transformed[1][1] - transformed[0][1],
    ];
    const inner =
        beforeOrienting[0] * afterOrienting[0] +
        beforeOrienting[1] * afterOrienting[1];
    const outer =
        beforeOrienting[0] * afterOrienting[1] -
        beforeOrienting[1] * afterOrienting[0];
    const angle = Math.atan2(outer, inner);

    return [
        [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)],
        angle,
    ];
}

export function clear(
    canvas: HTMLCanvasElement,
    context?: CanvasRenderingContext2D
): void {
    context?.resetTransform();
    context?.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = 0;
    canvas.height = 0;
    canvas.remove();
}

export function rotatePixelExtent(extent: [number, number, number, number] | Extent, rad: number): [number, number, number, number] {
    const center = [
        (extent[2] - extent[0]) / 2 + extent[0],
        (extent[3] - extent[1]) / 2 + extent[1],
    ];
    const leftTop = [
        (extent[0] - center[0]) * Math.cos(rad) -
        (extent[3] - center[1]) * Math.sin(rad),
        (extent[0] - center[0]) * Math.sin(rad) +
        (extent[3] - center[1]) * Math.cos(rad),
    ];
    const leftBottom = [
        (extent[0] - center[0]) * Math.cos(rad) -
        (extent[1] - center[1]) * Math.sin(rad),
        (extent[0] - center[0]) * Math.sin(rad) +
        (extent[1] - center[1]) * Math.cos(rad),
    ];
    const rightBottom = [
        (extent[2] - center[0]) * Math.cos(rad) -
        (extent[1] - center[1]) * Math.sin(rad),
        (extent[2] - center[0]) * Math.sin(rad) +
        (extent[1] - center[1]) * Math.cos(rad),
    ];
    const rightTop = [
        (extent[2] - center[0]) * Math.cos(rad) -
        (extent[3] - center[1]) * Math.sin(rad),
        (extent[2] - center[0]) * Math.sin(rad) +
        (extent[3] - center[1]) * Math.cos(rad),
    ];

    return [
        Math.min(leftTop[0], leftBottom[0], rightBottom[0], rightTop[0]) +
        center[0],
        Math.min(leftTop[1], leftBottom[1], rightBottom[1], rightTop[1]) +
        center[1],
        Math.max(leftTop[0], leftBottom[0], rightBottom[0], rightTop[0]) +
        center[0],
        Math.max(leftTop[1], leftBottom[1], rightBottom[1], rightTop[1]) +
        center[1],
    ];
}
