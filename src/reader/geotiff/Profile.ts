import { fromUrl, fromBlob } from "geotiff";
import {
    getDataRange,
    getBandCount,
    getCode,
    getUnit,
    getTransformedCoordinates,
} from "./index";
import {
    rotatePixelExtent,
} from "../../utils";

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
