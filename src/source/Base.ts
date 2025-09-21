import DataTile from "ol/DataTile.js";
import { Projection } from "ol/proj";
import DataTileSource from "ol/source/DataTile";

export type { Options } from "ol/source/DataTile";

export abstract class BaseSource extends DataTileSource {
  abstract getBoundingBox(dstCode?: string): number[] | null;
  abstract release(): void;

  getTile(
    z: number,
    x: number,
    y: number,
    pixelRatio: number,
    projection: Projection,
  ): DataTile | null {
    try {
      // proj4's transform rarely raise error in ReprojTile
      return super.getTile(z, x, y, pixelRatio, projection);
    } catch {
      const newTile = new DataTile({
        tileCoord: [z, x, y],
        loader: () => {
          return new Promise<HTMLImageElement>((resolve) => {
            const image = new Image();
            image.addEventListener("load", () => resolve(image));
            image.src =
              "data:image/gif;base64,R0lGODlhAQABAGAAACH5BAEKAP8ALAAAAAABAAEAAAgEAP8FBAA7";
          });
        },
      });

      return newTile;
    }
  }
}
