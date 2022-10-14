
import { Reader, Layer, RenderMode } from "~/geotiff/Reader";
import { getTransformedCoordinates } from "~/geotiff";
import {
    CANVAS_MAX_PIXEL,
    CANVAS_MAX_HEIGHT,
    CANVAS_MAX_WIDTH,
} from "~/constants";
import {
    adjustSize,
    clear,
    rotatePixelExtent,
} from "~/utils";

export interface SampleConfig {
    index: number;
    bands: number[]; // 1-based
    nodata?: number;
}

export interface SourceConfig {
    index?: number;
    band?: number; // 1-based
    nodata?: number;
    min?: number;
    max?: number;
}

export type CreateProcessorProps = {
    urls?: string[];
    files?: File[];
    cmap?: string;
    mode?: RenderMode;
    maxPixel?: number;
    maxWidth?: number;
    maxHeight?: number;
    minSize?: number;
    sources: SourceConfig[];
};

export type Status = "ready" | "empty";

type ProcessorProps = {
    context: CanvasRenderingContext2D;
    width: number;
    height: number;
    mode: string;
    cmap: string | null;
};

export class Processor {
    private context_: CanvasRenderingContext2D | null;
    width: number;
    height: number;
    mode: string;
    cmap: string | null;
    status: Status;

    constructor(options: ProcessorProps) {
        this.context_ = options.context;
        this.width = options.width;
        this.height = options.height;
        this.mode = options.mode;
        this.cmap = options.cmap;
        this.status = "ready";
    }

    getContext(): CanvasRenderingContext2D | null {
        return this.context_;
    }

    release(): void {
        if (this.context_) {
            clear(this.context_.canvas, this.context_);
            this.context_ = null;
            this.status = "empty";
        }
    }

    static async create(options: CreateProcessorProps): Promise<Processor> {
        const reader = new Reader({ files: options.files, urls: options.urls });
        const maxPixel = options?.maxPixel ?? CANVAS_MAX_PIXEL;
        if (maxPixel > CANVAS_MAX_PIXEL) throw new Error("maxPixel is too large.");
        const maxHeight = options?.maxHeight ?? CANVAS_MAX_HEIGHT;
        if (maxHeight > CANVAS_MAX_HEIGHT) throw new Error("maxHeight is too large.");
        const maxWidth = options?.maxWidth ?? CANVAS_MAX_WIDTH;
        if (maxWidth > CANVAS_MAX_WIDTH) throw new Error("maxWidth is too large.");
        const minSize = options?.minSize ?? 1;
        if (minSize < 1) throw new Error("minSize is too small.");

        const mode = options.mode || "rgb";
        const cmap = options.cmap || null;

        let imageWidth = 0;
        let imageHeight = 0;
        let resolutions: number[] = [1, 1];
        let originExtentAspectRatio = 1;
        let angle = 0;

        const sources = options.sources || [];
        const samples: SampleConfig[] = [];
        const layers: Layer[] = [];
        const mapping: [number, number, number | undefined, number | undefined][] =
            [];
        sources.forEach(({ index = 0, band = 1, nodata, min, max }) => {
            const existed = samples.findIndex((sample) => {
                return sample.index === index;
            });
            if (existed >= 0 && samples[existed].nodata === nodata) {
                mapping.push([existed, samples[existed].bands.length, min, max]);
                samples[existed].bands.push(band);
            } else {
                mapping.push([samples.length, 0, min, max]);
                samples.push({
                    index,
                    bands: [band],
                    nodata,
                });
            }
        });
        mapping.forEach(([sampleIndex, bandIndex, min, max]) => {
            let index = 0;
            for (let i = 0; i < sampleIndex; i++) {
                index += samples[i].bands.length;
            }
            index += bandIndex;

            layers.push({
                index,
                min,
                max,
            });
        });

        try {
            for (let i = 0; i < samples.length; i++) {
                if (i === 0) {
                    const image = await reader.getImage(samples[0].index);
                    if (image) {
                        imageWidth = image.getWidth();
                        imageHeight = image.getHeight();
                        const res = image.getResolution();
                        resolutions = [Math.abs(res[0]), Math.abs(res[1])];
                        originExtentAspectRatio =
                            (imageWidth * resolutions[0]) / (imageHeight * resolutions[1]);
                        angle = getTransformedCoordinates(image)[1];
                        if (angle !== 0) angle *= -1; // right-hand to left-hand
                    }
                } else {
                    const image = await reader.getImage(samples[i].index);
                    if (imageWidth !== image?.getWidth()) {
                        throw Error("can't get image width.");
                    }
                    if (imageHeight !== image?.getHeight()) {
                        throw Error("can't get image height.");
                    }
                }
            }
        } catch {
            throw Error("file is something wrong.");
        }

        if (imageWidth < imageHeight) {
            imageHeight = imageWidth / originExtentAspectRatio;
        } else {
            imageWidth = imageHeight * originExtentAspectRatio;
        }

        const rotatedCoordinates = rotatePixelExtent(
            [0, 0, imageWidth, imageHeight],
            angle
        );
        let rotatedWidth = rotatedCoordinates[2] - rotatedCoordinates[0];
        let rotatedHeight = rotatedCoordinates[3] - rotatedCoordinates[1];

        [[rotatedWidth, rotatedHeight], [imageWidth, imageHeight]] = adjustSize(
            [rotatedWidth, rotatedHeight],
            [imageWidth, imageHeight],
            maxPixel,
            maxWidth,
            maxHeight,
            minSize
        );

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d", {
            storage: "discardable",
        }) as CanvasRenderingContext2D;
        const tempCanvas = document.createElement("canvas");
        const tempContext = tempCanvas.getContext("2d", {
            storage: "discardable",
        }) as CanvasRenderingContext2D;
        if (!context || !tempContext) {
            throw Error("unexpected error.");
        }
        const image = await reader
            .render({
                mode: mode,
                cmap: cmap || undefined,
                samples: samples,
                width: imageWidth,
                height: imageHeight,
                layers: layers,
            });
        tempCanvas.width = image.width;
        tempCanvas.height = image.height;
        tempContext.putImageData(image, 0, 0);
        canvas.width = rotatedWidth;
        canvas.height = rotatedHeight;
        context.save();
        context.translate(rotatedWidth / 2, rotatedHeight / 2);
        context.rotate(angle);
        context.drawImage(
            tempCanvas,
            0,
            0,
            image.width,
            image.height,
            -image.width / 2,
            -image.height / 2,
            image.width,
            image.height
        );
        context.restore();
        clear(tempCanvas, tempContext);

        return new Processor({
            context,
            width: rotatedWidth,
            height: rotatedHeight,
            mode,
            cmap,
        });
    }
}