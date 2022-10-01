import ImageTile from "ol/ImageTile";
import { Projection } from "ol/proj";
import ReprojTile from "ol/reproj/Tile";
import TileImage from "ol/source/TileImage";
import Tile from "ol/Tile";
import { getKey } from "ol/tilecoord";
import TileState from "ol/TileState";

export type { Options } from "ol/source/TileImage";

export abstract class BaseSource extends TileImage {
  abstract getBoundingBox(dstCode?: string): number[] | null;
  abstract release(): void;

  getTile(
    z: number,
    x: number,
    y: number,
    pixelRatio: number,
    projection: Projection
  ): ImageTile | ReprojTile {
    try {
      // proj4's transform rarely raise error in ReprojTile
      return super.getTile(z, x, y, pixelRatio, projection);
    } catch {
      const newTile = new ImageTile(
        [z, x, y],
        TileState.EMPTY,
        "data:image/gif;base64,R0lGODlhAQABAGAAACH5BAEKAP8ALAAAAAABAAEAAAgEAP8FBAA7",
        null,
        (imageTile: Tile, src: string) => {
          if (imageTile instanceof ImageTile)
            (imageTile.getImage() as HTMLImageElement | HTMLVideoElement).src =
              src;
        }
      );

      const cache = this.getTileCacheForProjection(projection);
      const tileCoord = [z, x, y];
      const tileCoordKey = getKey(tileCoord);
      const key = this.getKey();
      newTile.key = key;
      cache.set(tileCoordKey, newTile);

      return newTile;
    }
  }
}
