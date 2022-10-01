import { Extent } from "ol/extent";
export const HALF_WORLD_3857 = Math.PI * 6378137;
export const EXTENT: { [key: string]: Extent } = {
    3857: [-HALF_WORLD_3857, -HALF_WORLD_3857, HALF_WORLD_3857, HALF_WORLD_3857],
    4326: [-180, -90, 180, 90],
};

//https://developer.mozilla.org/en-US/docs/Web/HTML/Element/canvas @2022
export const CANVAS_MAX_PIXEL = 268435456;
export const CANVAS_MAX_HEIGHT = 32767;
export const CANVAS_MAX_WIDTH = 32767;
