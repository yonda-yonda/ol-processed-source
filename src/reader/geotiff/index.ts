
import colormap from "colormap";

import type { GeoTIFFImage, TypedArray } from "geotiff";

import { rotate } from "../../utils";

export * as processor from "./Processor";
export * as profile from "./Profile";
export { default as Reader } from "./Reader";

export interface Sample {
    index: number;
    bands: number[]; // 1-based
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

export const rendermodes = ["rgb", "single", "ndi"] as const;
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

export const colormaps = [
    "jet",
    "hsv",
    "hot",
    "spring",
    "summer",
    "autumn",
    "winter",
    "bone",
    "copper",
    "greys",
    "yignbu",
    "greens",
    "yiorrd",
    "bluered",
    "rdbu",
    "picnic",
    "rainbow",
    "portland",
    "blackbody",
    "earth",
    "electric",
    "alpha",
    "viridis",
    "inferno",
    "magma",
    "plasma",
    "warm",
    "cool",
    "rainbow-soft",
    "bathymetry",
    "cdom",
    "chlorophyll",
    "density",
    "freesurface-blue",
    "freesurface-red",
    "oxygen",
    "par",
    "phase",
    "salinity",
    "temperature",
    "turbidity",
    "velocity-blue",
    "velocity-green",
    "cubehelix",
] as const;

export type Colormap = typeof colormaps[number];

export const getColor = (cmap: Colormap): [number, number, number, number][] => {
    return colormap({
        colormap: cmap,
        nshades: 256,
        format: "rgba",
        alpha: 1,
    });
};

export function getTransformedCoordinates(
    image: GeoTIFFImage
): [[number, number, number, number], number] {
    let affin: number[] | null = null;
    if (image.getFileDirectory()?.ModelTransformation) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
        const transformation = image.getFileDirectory().ModelTransformation;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        affin = [
            transformation[0],
            transformation[1],
            transformation[3],
            transformation[4],
            transformation[5],
            transformation[7],
        ];
    }
    if (!affin) return [image.getBoundingBox() as [number, number, number, number], 0];

    const imageWidth = image.getWidth();
    const imageHeight = image.getHeight();
    return rotate([imageWidth, imageHeight], affin);
}

export function getBandCount(image: GeoTIFFImage): number {
    return image.getBytesPerPixel() / (image.getBitsPerSample() / 8);
}

export function getCode(image: GeoTIFFImage): string | null {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const geoKeys = image?.geoKeys;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (geoKeys?.ProjectedCSTypeGeoKey) {
        // eslint-disable-next-line @typescript-eslint/restrict-plus-operands,@typescript-eslint/no-unsafe-member-access
        return "EPSG:" + geoKeys.ProjectedCSTypeGeoKey;
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (geoKeys?.GeographicTypeGeoKey) {
        // eslint-disable-next-line @typescript-eslint/restrict-plus-operands,@typescript-eslint/no-unsafe-member-access
        return "EPSG:" + geoKeys.GeographicTypeGeoKey;
    }
    return null;
}

export function getUnit(image: GeoTIFFImage): string | null {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const geoKeys = image?.geoKeys;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    switch (geoKeys?.ProjLinearUnitsGeoKey) {
        case 9001: {
            return "m";
        }
        case 9002: {
            return "ft";
        }
        case 9003: {
            return "us-ft";
        }
        case 9101: {
            return "radians";
        }
        case 9102: {
            return "degrees";
        }
    }
    return null;
}

export function getDataRange(image: GeoTIFFImage): [number, number] | null {
    /*
        respect
            https://github.com/openlayers/openlayers/blob/v6.15.0/src/ol/source/GeoTIFF.js
            https://github.com/geotiffjs/geotiff.js/blob/v2.0.5/src/geotiffimage.js#L44
    */
    const format = image.getSampleFormat();
    const bitsPerSample = image.getBitsPerSample();

    switch (format) {
        case 1: // unsigned integer data
            if (bitsPerSample <= 8) {
                return [0, 255];
            } else if (bitsPerSample <= 16) {
                return [0, 65535];
            } else if (bitsPerSample <= 32) {
                return [0, 4294967295];
            }
            break;
        case 2: // twos complement signed integer data
            if (bitsPerSample === 8) {
                return [-128, 127];
            } else if (bitsPerSample === 16) {
                return [-32768, 32767];
            } else if (bitsPerSample === 32) {
                return [-2147483648, 2147483647];
            }
            break;
        case 3: // floating point data
            switch (bitsPerSample) {
                case 16:
                case 32:
                    return [-3.4e38, 3.4e38];
                case 64:
                    return [-Number.MAX_VALUE, Number.MAX_VALUE];
                default:
                    break;
            }
            break;
        default:
            break;
    }
    return null;
}
