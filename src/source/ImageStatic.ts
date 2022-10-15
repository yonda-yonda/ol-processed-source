import { utils } from "geo4326";
import { Extent } from "ol/extent";
import ImageTile from "ol/ImageTile";
import { transform, get as getProjection } from "ol/proj";
import { register } from "ol/proj/proj4";
import Tile from "ol/Tile";
import { DEFAULT_TILE_SIZE } from "ol/tilegrid/common";
import TileGrid from "ol/tilegrid/TileGrid";
import TileState from "ol/TileState";
import proj4 from "proj4";

import {
    EXTENT,
    CANVAS_MAX_PIXEL,
    CANVAS_MAX_HEIGHT,
    CANVAS_MAX_WIDTH,
} from "../constants";
import {
    is4326,
    is3857,
    resolutionsFromExtent,
    getWindow,
    crossing,
    adjustSize,
    clear,
    rotatePixelExtent,
} from "../utils";
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
} & Omit<BaseOptions,
    "tileGrid" | "tileLoadFunction" | "tilePixelRatio" | "tileUrlFunction" |
    "state" | "url" | "urls">;

export default class ImageSatic extends BaseSource {
    private isGlobalGrid_: boolean;
    private context_: CanvasRenderingContext2D | null;
    private imageExtent_: Extent | null;
    private code_: string;

    constructor(userOptions: ImageSaticProps) {
        const options = Object.assign({
            maxPixel: CANVAS_MAX_PIXEL,
            maxWidth: CANVAS_MAX_WIDTH,
            maxHeight: CANVAS_MAX_HEIGHT,
            tileSize: DEFAULT_TILE_SIZE,
            wrapX: true,
            crossOrigin: "",
        }, userOptions);
        if (!options.url && !options.file)
            throw new Error("source url or file is necessary.");

        const tileSize = options.tileSize
        if (tileSize < 256) throw new Error("tileSize is too small.");
        const maxPixel = options.maxPixel;
        if (maxPixel > CANVAS_MAX_PIXEL) throw new Error("maxPixel is too large.");
        const maxHeight = options.maxHeight;
        if (maxHeight > CANVAS_MAX_HEIGHT)
            throw new Error("maxHeight is too large.");
        const maxWidth = options.maxWidth;
        if (maxWidth > CANVAS_MAX_WIDTH) throw new Error("maxWidth is too large.");
        const wrapX = options.wrapX;

        let projection = getProjection(options.projection);
        if (!projection && typeof options.projection === "string") {
            try {
                const crs = utils.getCrs(options.projection);
                proj4.defs(options.projection, crs);
                register(proj4);
                projection = getProjection(options.projection);
                // eslint-disable-next-line no-empty
            } catch { }
        }
        if (!projection) throw new Error("Unsupported projection.");
        let imageExtent = [Infinity, Infinity, -Infinity, -Infinity] as Extent;
        if (Array.isArray(options.imageExtent) && options.imageExtent.length > 3) {
            imageExtent = options.imageExtent;
        }
        const originExtentSize = [
            imageExtent[2] - imageExtent[0],
            imageExtent[3] - imageExtent[1],
        ];
        const originExtentAspectRatio = originExtentSize[0] / originExtentSize[1];
        let gridExtent = imageExtent;
        let gridExtentWidth = gridExtent[2] - gridExtent[0];
        let gridExtentHeight = gridExtent[3] - gridExtent[1];
        let rad = 0;
        if (options.rotate) {
            rad = options.rotate;
            imageExtent = rotatePixelExtent(imageExtent, rad);
        }
        const tileLoadFunction = (imageTile: Tile, coordString: string) => {
            const [z, x, y] = coordString.split(",").map(Number);
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d", {
                storage: "discardable",
            }) as CanvasRenderingContext2D;
            const tempCanvas = document.createElement("canvas");
            const tempContext = tempCanvas.getContext("2d", {
                storage: "discardable",
            }) as CanvasRenderingContext2D;
            if (!this.context_ || !context || !tempContext) {
                imageTile.setState(TileState.ERROR);
                return;
            }
            canvas.width = tileSize;
            canvas.height = tileSize;
            const window = getWindow(
                this.isGlobalGrid_ ? gridExtent : imageExtent,
                z,
                x,
                y
            );
            let tileLeft = window[0];
            let tileRight = window[2];
            const tileTop = window[1];
            const tileBottom = window[3];
            const [
                imageExtentLeft,
                imageExtentBottom,
                imageExtentRight,
                imageExtentTop,
            ] = imageExtent;

            if (this.isGlobalGrid_) {
                const extentWidth = gridExtent[2] - gridExtent[0];
                if (imageExtentLeft < gridExtent[0] && tileRight > 0) {
                    tileLeft -= extentWidth;
                    tileRight -= extentWidth;
                } else if (gridExtent[2] < imageExtentRight && tileLeft < 0) {
                    tileLeft += extentWidth;
                    tileRight += extentWidth;
                }

                if (
                    !crossing(
                        [
                            imageExtentLeft,
                            imageExtentBottom,
                            imageExtentRight,
                            imageExtentTop,
                        ],
                        [tileLeft, tileBottom, tileRight, tileTop]
                    )
                ) {
                    imageTile.setState(TileState.EMPTY);
                }
            }
            const sourcePerPixel = [
                (imageExtentRight - imageExtentLeft) / this.context_.canvas.width,
                (imageExtentTop - imageExtentBottom) / this.context_.canvas.height,
            ];
            const tilePerPixel = [
                (tileRight - tileLeft) / tileSize,
                (tileTop - tileBottom) / tileSize,
            ];
            const leftBottom = [
                Math.max(tileLeft, imageExtentLeft),
                Math.max(imageExtentBottom, tileBottom),
            ];
            const rightTop = [
                Math.min(tileRight, imageExtentRight),
                Math.min(imageExtentTop, tileTop),
            ];
            const tileRect = [
                Math.round((leftBottom[0] - tileLeft) / tilePerPixel[0]),
                Math.round((tileTop - rightTop[1]) / tilePerPixel[1]),
                Math.round((rightTop[0] - tileLeft) / tilePerPixel[0]),
                Math.round((tileTop - leftBottom[1]) / tilePerPixel[1]),
            ];
            const sourceRect = [
                Math.round((leftBottom[0] - imageExtentLeft) / sourcePerPixel[0]),
                Math.round((imageExtentTop - rightTop[1]) / sourcePerPixel[1]),
                Math.round((rightTop[0] - imageExtentLeft) / sourcePerPixel[0]),
                Math.round((imageExtentTop - leftBottom[1]) / sourcePerPixel[1]),
            ];
            const sourceRectSize = [
                sourceRect[2] - sourceRect[0],
                sourceRect[3] - sourceRect[1],
            ];
            const tileRectSize = [
                tileRect[2] - tileRect[0],
                tileRect[3] - tileRect[1],
            ];

            if (Math.min(...sourceRectSize, ...tileRectSize) <= 0) {
                imageTile.setState(TileState.EMPTY);
                return;
            }
            tempCanvas.width = sourceRectSize[0];
            tempCanvas.height = sourceRectSize[1];
            tempContext.clearRect(0, 0, sourceRectSize[0], sourceRectSize[1]);
            tempContext.putImageData(
                this.context_.getImageData(
                    sourceRect[0],
                    sourceRect[1],
                    sourceRectSize[0],
                    sourceRectSize[1]
                ),
                0,
                0
            );
            context.drawImage(
                tempCanvas,
                0,
                0,
                sourceRectSize[0],
                sourceRectSize[1],
                tileRect[0],
                tileRect[1],
                tileRectSize[0],
                tileRectSize[1]
            );

            const src = canvas.toDataURL();
            ((imageTile as ImageTile).getImage() as HTMLImageElement).src = src;

            clear(tempCanvas, tempContext);
            clear(canvas, context);
        };

        super(Object.assign({}, options, {
            state: "loading",
            projection,
            tileLoadFunction,
            url: "{z},{x},{y}",
        }) as BaseOptions);

        this.imageExtent_ = imageExtent;
        this.isGlobalGrid_ = false;
        const code = projection.getCode();
        this.code_ = code;
        if (wrapX) {
            const globalGridExtent = is4326(code)
                ? EXTENT[4326]
                : is3857(code)
                    ? EXTENT[3857]
                    : null;
            if (globalGridExtent) {
                gridExtent = globalGridExtent;
                gridExtentWidth = gridExtent[2] - gridExtent[0];
                gridExtentHeight = gridExtent[3] - gridExtent[1];
                if (
                    imageExtent[0] < gridExtent[0] - gridExtentWidth / 2 ||
                    gridExtent[2] + gridExtentWidth / 2 < imageExtent[0] ||
                    imageExtent[1] < gridExtent[1] ||
                    gridExtent[3] < imageExtent[1] ||
                    imageExtent[2] < gridExtent[0] - gridExtentWidth / 2 ||
                    gridExtent[2] + gridExtentWidth / 2 < imageExtent[2] ||
                    imageExtent[3] < gridExtent[1] ||
                    gridExtent[3] < imageExtent[3] ||
                    imageExtent[2] <= imageExtent[0] ||
                    imageExtent[0] - imageExtent[2] > gridExtentWidth
                )
                    throw new Error("Invalid extent.");
                this.isGlobalGrid_ = true;
            }
        }

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d", {
            storage: "discardable",
        }) as CanvasRenderingContext2D;
        if (!context) {
            this.context_ = null;
            throw new Error("Can't get canvas context.");
        }

        this.context_ = context;

        const image = new Image();
        image.crossOrigin = options.crossOrigin;

        let url = "";
        if (options.file) url = URL.createObjectURL(options.file);
        else if (options.url) url = options.url;
        image.addEventListener("load", () => {
            if (options.file) URL.revokeObjectURL(url);

            if (this.context_) {
                let imageWidth = image.width;
                let imageHeight = image.height;

                if (imageWidth < imageHeight) {
                    imageHeight = imageWidth / originExtentAspectRatio;
                } else {
                    imageWidth = imageHeight * originExtentAspectRatio;
                }

                const rotatedCoordinates = rotatePixelExtent(
                    [0, 0, imageWidth, imageHeight],
                    rad
                );
                let rotatedWidth = rotatedCoordinates[2] - rotatedCoordinates[0];
                let rotatedHeight = rotatedCoordinates[3] - rotatedCoordinates[1];

                [[rotatedWidth, rotatedHeight], [imageWidth, imageHeight]] = adjustSize(
                    [rotatedWidth, rotatedHeight],
                    [imageWidth, imageHeight],
                    maxPixel,
                    maxWidth,
                    maxHeight,
                    tileSize
                );

                const maxResolution =
                    Math.max(gridExtentWidth, gridExtentHeight) / tileSize;
                const tileGrid = new TileGrid({
                    extent: gridExtent,
                    tileSize: tileSize,
                    minZoom: options.minZoom,
                    resolutions: resolutionsFromExtent(gridExtent, {
                        maxZoom: options.maxZoom,
                        tileSize: tileSize,
                        maxResolution,
                    }),
                });
                if (!tileGrid) {
                    this.setState("error");
                    return;
                }
                this.tileGrid = tileGrid;
                this.context_.canvas.width = rotatedWidth;
                this.context_.canvas.height = rotatedHeight;

                this.context_.save();
                this.context_.translate(rotatedWidth / 2, rotatedHeight / 2);
                this.context_.rotate(-rad);
                this.context_.drawImage(
                    image,
                    0,
                    0,
                    image.width,
                    image.height,
                    -imageWidth / 2,
                    -imageHeight / 2,
                    imageWidth,
                    imageHeight
                );
                this.context_.restore();

                this.setState("ready");
            }
        });
        image.addEventListener("error", () => {
            if (options.file) URL.revokeObjectURL(url);
            this.setState("error");
        });

        image.src = url;
    }

    getBoundingBox(dstCode?: string): number[] | null {
        const originExtent = this.imageExtent_;
        const srcCode = this.code_;
        if (!originExtent || !srcCode) return null;
        if (!dstCode) return originExtent;

        let dstProjection = getProjection(dstCode);
        if (!dstProjection) {
            try {
                const crs = utils.getCrs(dstCode);
                proj4.defs(dstCode, crs);
                register(proj4);
                dstProjection = getProjection(dstCode);
            } catch {
                throw new Error("Unsupported projection.");
            }
        }
        const checkedDstCode = dstProjection?.getCode();
        if (!checkedDstCode) return null;
        if (!dstCode || srcCode === checkedDstCode) return originExtent;

        const transformed = [
            ...transform([originExtent[0], originExtent[1]], srcCode, checkedDstCode),
            ...transform([originExtent[2], originExtent[3]], srcCode, checkedDstCode),
        ];
        const worldExtent = is4326(checkedDstCode)
            ? EXTENT[4326]
            : is3857(checkedDstCode)
                ? EXTENT[3857]
                : null;
        if (transformed[0] > transformed[2] && worldExtent) {
            transformed[2] += worldExtent[2] - worldExtent[0];
        }
        return transformed;
    }

    release(): void {
        if (this.context_) {
            clear(this.context_.canvas, this.context_);
            this.context_ = null;
            this.setState("undefined");
        }
    }
}
