import { Extent } from "ol/extent";
import { BaseSource, Options as BaseOptions } from "./Base";
export type ImageSaticProps = {
    url?: string;
    file?: File;
    imageExtent: Extent;
    rotate?: number;
    maxPixel?: number;
    maxWidth?: number;
    maxHeight?: number;
    minZoom?: number;
    maxZoom?: number;
    tileSize?: number;
} & Omit<BaseOptions, "tileGrid" | "tileLoadFunction" | "tilePixelRatio" | "tileUrlFunction" | "state" | "url" | "urls">;
export default class ImageSatic extends BaseSource {
    private isGlobalGrid_;
    private context_;
    private imageExtent_;
    private code_;
    constructor(userOptions: ImageSaticProps);
    getBoundingBox(dstCode?: string): number[] | null;
    release(): void;
}
