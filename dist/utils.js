"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rotatePixelExtent = exports.clear = exports.rotate = exports.normalize = exports.adjustSize = exports.crossing = exports.getWindow = exports.resolutionsFromExtent = exports.is3857 = exports.is4326 = void 0;
var epsg3857_1 = require("ol/proj/epsg3857");
var epsg4326_1 = require("ol/proj/epsg4326");
var common_1 = require("ol/tilegrid/common");
function is4326(code) {
    return !!epsg4326_1.PROJECTIONS.find(function (projection) {
        return projection.getCode() === code;
    });
}
exports.is4326 = is4326;
function is3857(code) {
    return !!epsg3857_1.PROJECTIONS.find(function (projection) {
        return projection.getCode() === code;
    });
}
exports.is3857 = is3857;
// https://github.com/openlayers/openlayers/blob/v6.15.0/src/ol/tilegrid.js
function resolutionsFromExtent(extent, options) {
    var _a, _b;
    var maxZoom = (_a = options === null || options === void 0 ? void 0 : options.maxZoom) !== null && _a !== void 0 ? _a : common_1.DEFAULT_MAX_ZOOM;
    var width = extent[2] - extent[0];
    var height = extent[3] - extent[1];
    var tileSize = (_b = options === null || options === void 0 ? void 0 : options.tileSize) !== null && _b !== void 0 ? _b : common_1.DEFAULT_TILE_SIZE;
    var maxResolution = (options === null || options === void 0 ? void 0 : options.maxResolution) && options.maxResolution > 0
        ? options.maxResolution
        : Math.max(width / tileSize, height / tileSize);
    var length = maxZoom + 1;
    var resolutions = [];
    for (var z = 0; z < length; ++z) {
        resolutions[z] = maxResolution / Math.pow(2, z);
    }
    return resolutions;
}
exports.resolutionsFromExtent = resolutionsFromExtent;
function getWindow(gridExtent, z, x, y) {
    var size = Math.max(gridExtent[2] - gridExtent[0], gridExtent[3] - gridExtent[1]) /
        Math.pow(2, z);
    var left = gridExtent[0] + x * size;
    var top = gridExtent[3] - y * size;
    var right = left + size;
    var bottom = top - size;
    return [left, top, right, bottom];
}
exports.getWindow = getWindow;
function crossing(extent1, extent2) {
    return (Math.max(extent1[0], extent2[0]) <= Math.min(extent1[2], extent2[2]) &&
        Math.max(extent1[1], extent2[1]) <= Math.min(extent1[3], extent2[3]));
}
exports.crossing = crossing;
function adjustSize(rotated, origin, maxPixel, maxWidth, maxHeight, minSize) {
    // adjust size to minSize - maxSize
    var width = rotated[0], height = rotated[1];
    var originWidth = origin[0], orignHeight = origin[1];
    if (maxPixel > 0 && maxPixel < width * height) {
        var r = Math.sqrt(maxPixel / (width * height));
        width *= r;
        height *= r;
        originWidth *= r;
        orignHeight *= r;
    }
    if (maxWidth > 0 && maxWidth < width) {
        var r = maxWidth / width;
        width *= r;
        height *= r;
        originWidth *= r;
        orignHeight *= r;
    }
    if (maxHeight > 0 && maxHeight < height) {
        var r = maxHeight / height;
        width *= r;
        height *= r;
        originWidth *= r;
        orignHeight *= r;
    }
    if (width < height) {
        if (width < minSize) {
            var r = minSize / width;
            width = minSize;
            height *= r;
            originWidth *= r;
            orignHeight *= r;
        }
    }
    else {
        if (height < minSize) {
            var r = minSize / height;
            height = minSize;
            width *= r;
            originWidth *= r;
            orignHeight *= r;
        }
    }
    if (originWidth < 1 || orignHeight < 1)
        throw new Error("Unexpected size.");
    width = Math.round(width);
    height = Math.round(height);
    originWidth = Math.round(originWidth);
    orignHeight = Math.round(orignHeight);
    return [
        [width, height],
        [originWidth, orignHeight],
    ];
}
exports.adjustSize = adjustSize;
function normalize(value, min, max) {
    var gain = 1 / (max - min);
    var bias = -min * gain;
    return Math.min(Math.max(gain * value + bias, 0), 1);
}
exports.normalize = normalize;
function rotate(size, affin) {
    var width = size[0], height = size[1];
    var leftTop = [0, 0];
    var leftBottom = [0, height];
    var rightBottom = [width, height];
    var rightTop = [width, 0];
    var transformed = [leftTop, leftBottom, rightBottom, rightTop].map(function (v) {
        if (affin.length === 16)
            return [
                affin[0] * v[0] + affin[1] * v[1] + affin[3],
                affin[4] * v[0] + affin[5] * v[1] + affin[7],
            ];
        return [
            affin[0] * v[0] + affin[1] * v[1] + affin[2],
            affin[3] * v[0] + affin[4] * v[1] + affin[5],
        ];
    });
    var xs = transformed.map(function (v) {
        return v[0];
    });
    var ys = transformed.map(function (v) {
        return v[1];
    });
    var beforeOrienting = [
        leftTop[0] - leftBottom[0],
        leftTop[1] - leftBottom[1],
    ]; // left-hand to right-hand
    var afterOrienting = [
        transformed[1][0] - transformed[0][0],
        transformed[1][1] - transformed[0][1],
    ];
    var inner = beforeOrienting[0] * afterOrienting[0] +
        beforeOrienting[1] * afterOrienting[1];
    var outer = beforeOrienting[0] * afterOrienting[1] -
        beforeOrienting[1] * afterOrienting[0];
    var angle = Math.atan2(outer, inner);
    return [
        [Math.min.apply(Math, xs), Math.min.apply(Math, ys), Math.max.apply(Math, xs), Math.max.apply(Math, ys)],
        angle,
    ];
}
exports.rotate = rotate;
function clear(canvas, context) {
    context === null || context === void 0 ? void 0 : context.resetTransform();
    context === null || context === void 0 ? void 0 : context.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = 0;
    canvas.height = 0;
    canvas.remove();
}
exports.clear = clear;
function rotatePixelExtent(extent, rad) {
    var center = [
        (extent[2] - extent[0]) / 2 + extent[0],
        (extent[3] - extent[1]) / 2 + extent[1],
    ];
    var leftTop = [
        (extent[0] - center[0]) * Math.cos(rad) -
            (extent[3] - center[1]) * Math.sin(rad),
        (extent[0] - center[0]) * Math.sin(rad) +
            (extent[3] - center[1]) * Math.cos(rad),
    ];
    var leftBottom = [
        (extent[0] - center[0]) * Math.cos(rad) -
            (extent[1] - center[1]) * Math.sin(rad),
        (extent[0] - center[0]) * Math.sin(rad) +
            (extent[1] - center[1]) * Math.cos(rad),
    ];
    var rightBottom = [
        (extent[2] - center[0]) * Math.cos(rad) -
            (extent[1] - center[1]) * Math.sin(rad),
        (extent[2] - center[0]) * Math.sin(rad) +
            (extent[1] - center[1]) * Math.cos(rad),
    ];
    var rightTop = [
        (extent[2] - center[0]) * Math.cos(rad) -
            (extent[3] - center[1]) * Math.sin(rad),
        (extent[2] - center[0]) * Math.sin(rad) +
            (extent[3] - center[1]) * Math.cos(rad),
    ];
    return [
        Math.min(leftTop[0], leftBottom[0], rightBottom[0], rightTop[0]) +
            center[0],
        Math.min(leftTop[1], leftBottom[1], rightBottom[1], rightTop[1]) +
            center[1],
        Math.max(leftTop[0], leftBottom[0], rightBottom[0], rightTop[0]) +
            center[0],
        Math.max(leftTop[1], leftBottom[1], rightBottom[1], rightTop[1]) +
            center[1],
    ];
}
exports.rotatePixelExtent = rotatePixelExtent;
