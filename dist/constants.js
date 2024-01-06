"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CANVAS_MAX_WIDTH = exports.CANVAS_MAX_HEIGHT = exports.CANVAS_MAX_PIXEL = exports.EXTENT = exports.HALF_WORLD_3857 = void 0;
exports.HALF_WORLD_3857 = Math.PI * 6378137;
exports.EXTENT = {
    3857: [-exports.HALF_WORLD_3857, -exports.HALF_WORLD_3857, exports.HALF_WORLD_3857, exports.HALF_WORLD_3857],
    4326: [-180, -90, 180, 90],
};
// https://developer.mozilla.org/en-US/docs/Web/HTML/Element/canvas @2022
exports.CANVAS_MAX_PIXEL = 268435456;
exports.CANVAS_MAX_HEIGHT = 32767;
exports.CANVAS_MAX_WIDTH = 32767;
