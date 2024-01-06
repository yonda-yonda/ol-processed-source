import ImageTile from "ol/ImageTile";
import { Projection } from "ol/proj";
import ReprojTile from "ol/reproj/Tile";
import TileImage from "ol/source/TileImage";
export type { Options } from "ol/source/TileImage";
export declare abstract class BaseSource extends TileImage {
    abstract getBoundingBox(dstCode?: string): number[] | null;
    abstract release(): void;
    getTile(z: number, x: number, y: number, pixelRatio: number, projection: Projection): ImageTile | ReprojTile;
}
