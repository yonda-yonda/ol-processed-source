import { CreateProcessorProps } from "../reader/geotiff/Processor";
import { BaseSource, Options as BaseOptions } from "./Base";
export type { SampleConfig, SourceConfig } from "../reader/geotiff/Processor";
export type GeoTIFFProps = {
    minZoom?: number;
    maxZoom?: number;
    tileSize?: number;
} & Omit<CreateProcessorProps, "minSize"> & Omit<BaseOptions, "tileGrid" | "tileLoadFunction" | "tilePixelRatio" | "tileUrlFunction" | "crossOrigin" | "projection" | "state" | "url" | "urls">;
export default class GeoTIFF extends BaseSource {
    private processor_;
    private tileSize_;
    private isGlobalGrid_;
    private imageExtent_;
    private gridExtent_;
    private profile_;
    constructor(userOptions: GeoTIFFProps);
    getBoundingBox(dstCode?: string): number[] | null;
    getSize(): number[] | null;
    release(): void;
    private setup_;
}
