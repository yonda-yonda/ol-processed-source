import { RenderMode, Colormap } from "./index";
export interface SampleConfig {
    index: number;
    bands: number[];
    nodata?: number;
}
export interface SourceConfig {
    index?: number;
    band?: number;
    nodata?: number;
    min?: number;
    max?: number;
}
export type CreateProcessorProps = {
    urls?: string[];
    files?: File[];
    cmap?: Colormap;
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
    mode: RenderMode;
    cmap: Colormap | null;
};
export default class Processor {
    private context_;
    width: number;
    height: number;
    mode: RenderMode;
    cmap: Colormap | null;
    status: Status;
    constructor(options: ProcessorProps);
    getContext(): CanvasRenderingContext2D | null;
    release(): void;
    static create(options: CreateProcessorProps): Promise<Processor>;
}
export {};
