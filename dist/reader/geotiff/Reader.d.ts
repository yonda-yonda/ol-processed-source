import { GeoTIFF, GeoTIFFImage } from "geotiff";
import { RenderProps, RasterProps, RasterValue } from "./index";
export default class Reader {
    private files;
    private urls;
    private tiffs;
    constructor(props: {
        files?: File[];
        urls?: string[];
    });
    getCount(): number;
    getTiffs(): Promise<GeoTIFF[]>;
    getImage(fileIndex?: number, imageIndex?: number): Promise<GeoTIFFImage | null>;
    getBandCount(fileIndex?: number, imageIndex?: number): Promise<number | null>;
    getCode(fileIndex?: number, imageIndex?: number): Promise<string | null>;
    getUnit(fileIndex?: number, imageIndex?: number): Promise<string | null>;
    getRasters(props: RasterProps): Promise<RasterValue[]>;
    render(props: RenderProps): Promise<ImageData>;
}
