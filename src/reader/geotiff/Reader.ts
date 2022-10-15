import {
    fromUrl,
    fromBlob,
    GeoTIFF,
    GeoTIFFImage,
    Pool,
} from "geotiff";

import {
    getDataRange,
    RenderProps,
    RasterProps,
    RasterValue,
    getBandCount,
    getCode,
    getColor,
    getUnit,
} from "./index";
import { normalize } from "../../utils";

let pool: Pool | null = null;
const getPool = () => {
    if (!pool) pool = new Pool();
    return pool;
    return null;
};

/*
Initialize
```
const reader = new Reader({
  files
});
```
can set some sources.

```
reader.getRasters({
  sources: [{
    index: 0,
    bands: [1, 3],
    window: [10, 20, 40, 60];
    nodata: 0;
  }]
})
```
From the 0th file, get bands 1 and 3 in the range of [10, 20, 40, 60] pixels.

```
const arr = reader.render({
  mode: "rgb",
  samples: [{
    index: 0,
    bands: [1, 3],
    nodata: 0,
  }, {
    index: 1,
    bands: [1],
    nodata: -9999,
  }],
  width: 512,
  height: 512,
  layers: [{
    index: 0, // band1 of the 0th samples
    min: 0,
    max: 255,
  }, {
    index: 2, // band1 of the 1th samples
    min: -500,
    max: 6000,
  }, {
    index: 1, // band3 of the 0th samples
    min: 0,
    max: 255,
  }]
});
const canvas = document.createElement("canvas");
const context = canvas.getContext("2d");
context.putImageData(arr, 0, 0);
```

*/

export default class Reader {
    private files: File[];
    private urls: string[];
    private tiffs: GeoTIFF[];

    constructor(props: { files?: File[]; urls?: string[] }) {
        if (
            !(props.urls && props.urls.length > 0) &&
            !(props.files && props.files.length > 0)
        )
            throw new Error("urls or files is necessary.");

        this.files = [];
        this.urls = [];
        this.tiffs = [];
        if (props.files && props.files.length > 0) {
            this.files = props.files;
        } else if (props.urls && props.urls.length > 0) {
            this.urls = props.urls;
        }
    }

    getCount(): number {
        if (this.files.length > 0) return this.files.length;
        if (this.urls.length > 0) return this.urls.length;
        return 0;
    }

    async getTiffs(): Promise<GeoTIFF[]> {
        if (this.tiffs.length > 0) return this.tiffs;
        this.tiffs =
            this.files.length > 0
                ? await Promise.all(this.files.map((file) => fromBlob(file)))
                : await Promise.all(this.urls.map((url) => fromUrl(url)));
        return this.tiffs;
    }

    async getImage(fileIndex = 0, imageIndex = 0): Promise<GeoTIFFImage | null> {
        const tiff = (await this.getTiffs())[fileIndex];
        return (await tiff.getImage(imageIndex)) || null;
    }

    async getBandCount(fileIndex = 0, imageIndex = 0): Promise<number | null> {
        const image = await this.getImage(fileIndex, imageIndex);

        return image ? getBandCount(image) : null;
    }

    async getCode(fileIndex = 0, imageIndex = 0): Promise<string | null> {
        const image = await this.getImage(fileIndex, imageIndex);

        return image ? getCode(image) : null;
    }

    async getUnit(fileIndex = 0, imageIndex = 0): Promise<string | null> {
        const image = await this.getImage(fileIndex, imageIndex);

        return image ? getUnit(image) : null;
    }

    async getRasters(props: RasterProps): Promise<RasterValue[]> {
        const { sources } = props;
        const tiffs = await this.getTiffs();
        return await Promise.all(
            sources.map(async (source) => {
                const tiff = tiffs[source.index];
                if (!tiff) throw new Error("index is out of range.");

                let targetImage = await tiff.getImage(0);
                const originWidth = targetImage.getWidth();
                const originHeight = targetImage.getHeight();

                const sourceWindow = Array.isArray(source.window)
                    ? [...source.window]
                    : [0, 0, originWidth, originHeight];
                if (sourceWindow.length !== 4)
                    throw new Error("window must be 4 length.");

                const dstWidth = Math.floor(
                    source.width ?? sourceWindow[2] - sourceWindow[0]
                );
                const dstHeight = Math.floor(
                    source.height ?? sourceWindow[3] - sourceWindow[1]
                );
                if (dstWidth < 1 || dstHeight < 1)
                    throw new Error("dist size is too small.");
                const nodata = source.nodata ?? targetImage.getGDALNoData() ?? 0;
                const range = getDataRange(targetImage) ?? [0, 255];

                const imageCount = await tiff.getImageCount();

                let dstWindow = sourceWindow;
                for (let i = 1; i < imageCount; i++) {
                    const image = await tiff.getImage(i);
                    const imageWidth = image.getWidth();
                    const imageHeight = image.getHeight();
                    const window = [
                        Math.floor((sourceWindow[0] * imageWidth) / originWidth),
                        Math.floor((sourceWindow[1] * imageHeight) / originHeight),
                        Math.floor((sourceWindow[2] * imageWidth) / originWidth),
                        Math.floor((sourceWindow[3] * imageHeight) / originHeight),
                    ];
                    const sourceWidth = window[2] - window[0];
                    const sourceHeight = window[3] - window[1];
                    if (sourceWidth < dstWidth || sourceHeight < dstHeight) {
                        break;
                    }
                    dstWindow = window;
                    targetImage = image;
                }
                const bandCount = getBandCount(targetImage);
                if (
                    !source.bands.every((band) => {
                        return band >= 1 && band <= bandCount;
                    })
                )
                    throw new Error("band's index is out of range.");
                const targetSamples = source.bands.map((v) => {
                    return v - 1;
                });
                const data = await targetImage.readRasters({
                    window: dstWindow,
                    width: dstWidth,
                    height: dstHeight,
                    samples: targetSamples,
                    fillValue: nodata,
                    resampleMethod: source.resampleMethod,
                    pool: getPool(),
                    interleave: false,
                });
                return {
                    data: Array.isArray(data) ? data : [data],
                    width: dstWidth,
                    height: dstHeight,
                    nodata,
                    range,
                };
            })
        );
    }

    async render(props: RenderProps): Promise<ImageData> {
        const {
            samples,
            mode = "rgb",
            layers = [],
            alpha = true,
            cmap = "jet",
            width,
            height,
        } = props;
        let orders: number[] = [];
        let colors: number[][] = [];
        const mapping: [number, number][] = [];
        samples.forEach((sample, i) => {
            sample.bands.forEach((_, j) => {
                mapping.push([i, j]);
            });
        });
        switch (mode) {
            case "rgb": {
                orders =
                    layers.length > 0
                        ? [
                            ...(layers ?? []).map((layer) => {
                                return layer.index;
                            }),
                        ]
                        : [0, 1, 2];
                if (orders?.length !== 3)
                    throw new Error("layers length must be 3 at rgb mode.");
                break;
            }
            case "ndi": {
                orders =
                    layers.length > 0
                        ? [
                            ...(layers ?? []).map((layer) => {
                                return layer.index;
                            }),
                        ]
                        : [0, 1];
                if (orders?.length !== 2)
                    throw new Error("layers length must be 2 at single mode.");
                colors = getColor(cmap);
                break;
            }
            case "single": {
                orders =
                    layers.length > 0
                        ? [
                            ...(layers ?? []).map((layer) => {
                                return layer.index;
                            }),
                        ]
                        : [0];
                if (orders?.length !== 1)
                    throw new Error("layers length must be 1 at single mode.");
                colors = getColor(cmap);
                break;
            }
            default: {
                throw new Error("Unexpected mode.");
            }
        }
        orders.forEach((order) => {
            if (order < 0 || mapping.length <= order)
                throw new Error("layers include out of range index.");
        });

        const rasters = await this.getRasters({
            sources: samples.map((sample) => {
                return {
                    width,
                    height,
                    ...sample,
                };
            }),
        });
        const [dstWidth, dstHeight] = [
            Math.floor(width ?? rasters[0].width),
            Math.floor(height ?? rasters[0].height),
        ];
        const length = dstWidth * dstHeight;
        const data = new Uint8ClampedArray(length * 4);
        let dstIndex = 0;
        for (let i = 0; i < length; i++) {
            let includeNodata = false;
            switch (mode) {
                case "rgb": {
                    for (let j = 0; j < 3; j++) {
                        const indexes = mapping[orders[j]];
                        const raster = rasters[indexes[0]];
                        const layer = indexes[1];
                        let value = raster.data[layer][i];
                        if (value === raster.nodata) includeNodata = true;
                        const [defaultMin, defaultMax] = raster.range;
                        const min = layers[j]?.min ?? defaultMin;
                        const max = layers[j]?.max ?? defaultMax;
                        value = normalize(value, min, max);
                        data[dstIndex++] = Math.round(255 * value);
                    }
                    break;
                }
                case "ndi": {
                    const values = [];
                    for (let j = 0; j < 2; j++) {
                        const indexes = mapping[j];
                        const raster = rasters[indexes[0]];
                        const layer = indexes[1];
                        let value = raster.data[layer][i];
                        if (value === raster.nodata) includeNodata = true;
                        const [defaultMin, defaultMax] = raster.range;
                        const min = layers[j]?.min ?? defaultMin;
                        const max = layers[j]?.max ?? defaultMax;
                        value = normalize(value, min, max);
                        values.push(value);
                    }
                    let normalized = 0;
                    if (values[1] - values[0] !== 0) {
                        normalized = (values[0] + values[1]) / (values[0] - values[1]);
                    }
                    normalized = normalize(normalized, -1, 1);

                    const pixels = colors[Math.round(255 * normalized)];
                    data[dstIndex++] = pixels[0];
                    data[dstIndex++] = pixels[1];
                    data[dstIndex++] = pixels[2];
                    break;
                }
                case "single": {
                    const indexes = mapping[0];
                    const raster = rasters[indexes[0]];
                    const layer = indexes[1];
                    let value = raster.data[layer][i];
                    if (value === raster.nodata) includeNodata = true;
                    const [defaultMin, defaultMax] = raster.range;
                    const min = layers[0]?.min ?? defaultMin;
                    const max = layers[0]?.max ?? defaultMax;
                    value = normalize(value, min, max);
                    const pixels = colors[Math.round(255 * value)];
                    data[dstIndex++] = pixels[0];
                    data[dstIndex++] = pixels[1];
                    data[dstIndex++] = pixels[2];
                    break;
                }
            }
            data[dstIndex++] = alpha && includeNodata ? 0 : 255;
        }
        return new ImageData(data, dstWidth, dstHeight);
    }
}
