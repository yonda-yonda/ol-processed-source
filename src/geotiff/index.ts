import {
    fromUrl,
    fromBlob,
    GeoTIFFImage
} from "geotiff";
import { rotate, rotatePixelExtent } from "../utils";
export * as reader from "./Reader";
export * as processor from "./Processor";

export interface Profile {
    width: number; // affined
    height: number; // affined
    resolutions: [number, number]; // affined
    bbox: [number, number, number, number];
    bands: number;
    nodata: number | null;
    unit: string | null;
    code: string | null;
    range: [number, number] | null;
}

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

export async function getProfile(source: File | string, imageIndex = 0): Promise<Profile> {
    const tiff =
        typeof source === "string"
            ? await fromUrl(source)
            : await fromBlob(source);
    const image = await tiff.getImage(imageIndex);
    const bands = getBandCount(image);
    const code = getCode(image);
    const unit = getUnit(image);
    const range = getDataRange(image);
    const nodata = image.getGDALNoData();
    const width = image.getWidth();
    const height = image.getHeight();

    let imageExtent: [number, number, number, number] = [Infinity, Infinity, -Infinity, -Infinity];
    let angle = 0;

    [imageExtent, angle] = getTransformedCoordinates(image);
    if (angle !== 0) angle *= -1; // right-hand to left-hand

    const rotatedCoordinates = rotatePixelExtent(
        [0, 0, width, height],
        angle
    );
    const rotatedWidth = Math.round(rotatedCoordinates[2] - rotatedCoordinates[0]);
    const rotatedHeight = Math.round(rotatedCoordinates[3] - rotatedCoordinates[1]);

    const resolutions: [number, number] = [
        (imageExtent[2] - imageExtent[0]) / rotatedWidth,
        (imageExtent[3] - imageExtent[1]) / rotatedHeight,
    ];

    return {
        width: rotatedWidth,
        height: rotatedHeight,
        bbox: imageExtent,
        resolutions,
        bands,
        nodata,
        unit,
        code,
        range,
    };
}
