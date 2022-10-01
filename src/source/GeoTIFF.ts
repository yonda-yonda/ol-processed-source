import { utils } from "geo4326";
import { Extent } from "ol/extent";
import ImageTile from "ol/ImageTile";
import { transform, get as getProjection, Projection } from "ol/proj";
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
} from "~/const";
import { getProfile, Profile } from "~/geotiff";
import { Processor, CreateProcessorProps } from "~/geotiff/Processor";
import {
    is4326,
    is3857,
    resolutionsFromExtent,
    getWindow,
    crossing,
    clear,
} from "~/utils";
import { BaseSource, Options as BaseOptions } from "./Base";

export type { SampleConfig, SourceConfig } from "~/geotiff/Processor";

export type GeoTIFFSourceProps = {
    minZoom?: number;
    maxZoom?: number;
    tileSize?: number;
} & Omit<CreateProcessorProps, "minSize"> & Omit<BaseOptions,
    "tileGrid" | "tileLoadFunction" | "tilePixelRatio" | "tileUrlFunction" |
    "crossOrigin" | "projection" | "state" | "url" | "urls">;

export class GeoTIFFSource extends BaseSource {
    private processor_: Processor | null;
    private tileSize_: number;
    private isGlobalGrid_: boolean;
    private imageExtent_: Extent | null;
    private gridExtent_: Extent | null;
    private profile_: Profile | null;

    constructor(userOptions: GeoTIFFSourceProps) {
        const options = Object.assign({
            maxPixel: CANVAS_MAX_PIXEL,
            maxWidth: CANVAS_MAX_WIDTH,
            maxHeight: CANVAS_MAX_HEIGHT,
            tileSize: DEFAULT_TILE_SIZE,
            wrapX: true,
        }, userOptions);
        if (options.maxPixel > CANVAS_MAX_PIXEL) throw new Error("maxPixel is too large.");
        if (options.maxHeight > CANVAS_MAX_HEIGHT)
            throw new Error("maxHeight is too large.");
        if (options.maxWidth > CANVAS_MAX_WIDTH) throw new Error("maxWidth is too large.");
        const tileSize = options.tileSize
        if (tileSize < 256) throw new Error("tileSize is too small.");

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
            const context_ = this.processor_?.getContext();
            if (
                !this.imageExtent_ ||
                !this.gridExtent_ ||
                !context_ ||
                !context ||
                !tempContext
            ) {
                imageTile.setState(TileState.ERROR);
                return;
            }
            canvas.width = this.tileSize_;
            canvas.height = this.tileSize_;

            const window = getWindow(
                this.isGlobalGrid_ ? this.gridExtent_ : this.imageExtent_,
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
            ] = this.imageExtent_;

            if (this.isGlobalGrid_) {
                const extentWidth = this.gridExtent_[2] - this.gridExtent_[0];
                if (imageExtentLeft < this.gridExtent_[0] && tileRight > 0) {
                    tileLeft -= extentWidth;
                    tileRight -= extentWidth;
                } else if (this.gridExtent_[2] < imageExtentRight && tileLeft < 0) {
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
                    return;
                }
            }

            const sourcePerPixel = [
                (imageExtentRight - imageExtentLeft) / context_.canvas.width,
                (imageExtentTop - imageExtentBottom) / context_.canvas.height,
            ];
            const tilePerPixel = [
                (tileRight - tileLeft) / this.tileSize_,
                (tileTop - tileBottom) / this.tileSize_,
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
            tempContext.putImageData(
                context_.getImageData(
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
            tileLoadFunction,
            url: "{z},{x},{y}",
        }) as BaseOptions);

        this.processor_ = null;
        this.isGlobalGrid_ = false;
        this.imageExtent_ = null;
        this.gridExtent_ = null;
        this.profile_ = null;
        this.tileSize_ = tileSize;
        this.setup_(options);
    }

    getBoundingBox(dstCode?: string): number[] | null {
        const originExtent = this.imageExtent_;
        const srcCode = this.profile_?.code;
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

    getSize(): number[] | null {
        if (this.processor_) return [this.processor_.width, this.processor_.height];
        return null;
    }

    release(): void {
        if (this.processor_) {
            this.processor_.release();
            this.setState("undefined");
        }
    }

    private async setup_(options: GeoTIFFSourceProps): Promise<void> {
        if (options.files)
            this.profile_ = await getProfile(options.files[0]);
        else if (options.urls)
            this.profile_ = await getProfile(options.urls[0]);
        if (!this.profile_) {
            this.setState("error");
            return;
        }

        const code = this.profile_.code;
        const unit = this.profile_.unit;
        const imageExtent = this.profile_.bbox;
        let projection = code ? getProjection(code) : null;
        if (!projection) {
            if (code) {
                try {
                    const crs = utils.getCrs(code);
                    proj4.defs(code, crs);
                    register(proj4);
                    projection = getProjection(code);
                } catch {
                    if (unit) {
                        projection = new Projection({
                            code: code,
                            units: unit,
                        });
                    }
                }
            }
        }
        if (!projection || !code) {
            this.setState("error");
            return;
        }
        this.projection = projection;
        let gridExtent: Extent = [...imageExtent];
        let gridExtentWidth = gridExtent[2] - gridExtent[0];
        let gridExtentHeight = gridExtent[3] - gridExtent[1];

        if (options.wrapX) {
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
                ) {
                    this.setState("error");
                    return;
                }
                this.isGlobalGrid_ = true;
            }
        }
        this.imageExtent_ = imageExtent;
        this.gridExtent_ = gridExtent;

        const maxResolution =
            Math.max(gridExtentWidth, gridExtentHeight) / this.tileSize_;
        const tileGrid = new TileGrid({
            extent: gridExtent,
            tileSize: this.tileSize_,
            minZoom: options.minZoom,
            resolutions: resolutionsFromExtent(gridExtent, {
                maxZoom: options.maxZoom,
                tileSize: this.tileSize_,
                maxResolution,
            }),
        });

        if (!tileGrid) {
            this.setState("error");
            return;
        }
        this.tileGrid = tileGrid;

        const createOptions: CreateProcessorProps = Object.assign({}, options);
        try {
            createOptions.minSize = this.tileSize_;
            this.processor_ = await Processor.create(createOptions);
        } catch {
            this.setState("error");
            return;
        }

        this.setState("ready");
    }
}
