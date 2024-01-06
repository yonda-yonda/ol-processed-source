"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var geotiff_1 = require("geotiff");
var utils_1 = require("../../utils");
var index_1 = require("./index");
var pool = null;
var getPool = function () {
    if (!pool)
        pool = new geotiff_1.Pool();
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
var Reader = /** @class */ (function () {
    function Reader(props) {
        if (!(props.urls && props.urls.length > 0) &&
            !(props.files && props.files.length > 0))
            throw new Error("urls or files is necessary.");
        this.files = [];
        this.urls = [];
        this.tiffs = [];
        if (props.files && props.files.length > 0) {
            this.files = props.files;
        }
        else if (props.urls && props.urls.length > 0) {
            this.urls = props.urls;
        }
    }
    Reader.prototype.getCount = function () {
        if (this.files.length > 0)
            return this.files.length;
        if (this.urls.length > 0)
            return this.urls.length;
        return 0;
    };
    Reader.prototype.getTiffs = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (this.tiffs.length > 0)
                            return [2 /*return*/, this.tiffs];
                        _a = this;
                        if (!(this.files.length > 0)) return [3 /*break*/, 2];
                        return [4 /*yield*/, Promise.all(this.files.map(function (file) { return (0, geotiff_1.fromBlob)(file); }))];
                    case 1:
                        _b = _c.sent();
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, Promise.all(this.urls.map(function (url) { return (0, geotiff_1.fromUrl)(url); }))];
                    case 3:
                        _b = _c.sent();
                        _c.label = 4;
                    case 4:
                        _a.tiffs = _b;
                        return [2 /*return*/, this.tiffs];
                }
            });
        });
    };
    Reader.prototype.getImage = function (fileIndex, imageIndex) {
        if (fileIndex === void 0) { fileIndex = 0; }
        if (imageIndex === void 0) { imageIndex = 0; }
        return __awaiter(this, void 0, void 0, function () {
            var tiff;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getTiffs()];
                    case 1:
                        tiff = (_a.sent())[fileIndex];
                        return [4 /*yield*/, tiff.getImage(imageIndex)];
                    case 2: return [2 /*return*/, (_a.sent()) || null];
                }
            });
        });
    };
    Reader.prototype.getBandCount = function (fileIndex, imageIndex) {
        if (fileIndex === void 0) { fileIndex = 0; }
        if (imageIndex === void 0) { imageIndex = 0; }
        return __awaiter(this, void 0, void 0, function () {
            var image;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getImage(fileIndex, imageIndex)];
                    case 1:
                        image = _a.sent();
                        return [2 /*return*/, image ? (0, index_1.getBandCount)(image) : null];
                }
            });
        });
    };
    Reader.prototype.getCode = function (fileIndex, imageIndex) {
        if (fileIndex === void 0) { fileIndex = 0; }
        if (imageIndex === void 0) { imageIndex = 0; }
        return __awaiter(this, void 0, void 0, function () {
            var image;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getImage(fileIndex, imageIndex)];
                    case 1:
                        image = _a.sent();
                        return [2 /*return*/, image ? (0, index_1.getCode)(image) : null];
                }
            });
        });
    };
    Reader.prototype.getUnit = function (fileIndex, imageIndex) {
        if (fileIndex === void 0) { fileIndex = 0; }
        if (imageIndex === void 0) { imageIndex = 0; }
        return __awaiter(this, void 0, void 0, function () {
            var image;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getImage(fileIndex, imageIndex)];
                    case 1:
                        image = _a.sent();
                        return [2 /*return*/, image ? (0, index_1.getUnit)(image) : null];
                }
            });
        });
    };
    Reader.prototype.getRasters = function (props) {
        return __awaiter(this, void 0, void 0, function () {
            var sources, tiffs;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sources = props.sources;
                        return [4 /*yield*/, this.getTiffs()];
                    case 1:
                        tiffs = _a.sent();
                        return [4 /*yield*/, Promise.all(sources.map(function (source) { return __awaiter(_this, void 0, void 0, function () {
                                var tiff, targetImage, originWidth, originHeight, sourceWindow, dstWidth, dstHeight, nodata, range, imageCount, dstWindow, i, image, imageWidth, imageHeight, window_1, sourceWidth, sourceHeight, bandCount, targetSamples, data;
                                var _a, _b, _c, _d, _e;
                                return __generator(this, function (_f) {
                                    switch (_f.label) {
                                        case 0:
                                            tiff = tiffs[source.index];
                                            if (!tiff)
                                                throw new Error("index is out of range.");
                                            return [4 /*yield*/, tiff.getImage(0)];
                                        case 1:
                                            targetImage = _f.sent();
                                            originWidth = targetImage.getWidth();
                                            originHeight = targetImage.getHeight();
                                            sourceWindow = Array.isArray(source.window)
                                                ? __spreadArray([], source.window, true) : [0, 0, originWidth, originHeight];
                                            if (sourceWindow.length !== 4)
                                                throw new Error("window must be 4 length.");
                                            dstWidth = Math.floor((_a = source.width) !== null && _a !== void 0 ? _a : sourceWindow[2] - sourceWindow[0]);
                                            dstHeight = Math.floor((_b = source.height) !== null && _b !== void 0 ? _b : sourceWindow[3] - sourceWindow[1]);
                                            if (dstWidth < 1 || dstHeight < 1)
                                                throw new Error("dist size is too small.");
                                            nodata = (_d = (_c = source.nodata) !== null && _c !== void 0 ? _c : targetImage.getGDALNoData()) !== null && _d !== void 0 ? _d : 0;
                                            range = (_e = (0, index_1.getDataRange)(targetImage)) !== null && _e !== void 0 ? _e : [0, 255];
                                            return [4 /*yield*/, tiff.getImageCount()];
                                        case 2:
                                            imageCount = _f.sent();
                                            dstWindow = sourceWindow;
                                            i = 1;
                                            _f.label = 3;
                                        case 3:
                                            if (!(i < imageCount)) return [3 /*break*/, 6];
                                            return [4 /*yield*/, tiff.getImage(i)];
                                        case 4:
                                            image = _f.sent();
                                            imageWidth = image.getWidth();
                                            imageHeight = image.getHeight();
                                            window_1 = [
                                                Math.floor((sourceWindow[0] * imageWidth) / originWidth),
                                                Math.floor((sourceWindow[1] * imageHeight) / originHeight),
                                                Math.floor((sourceWindow[2] * imageWidth) / originWidth),
                                                Math.floor((sourceWindow[3] * imageHeight) / originHeight),
                                            ];
                                            sourceWidth = window_1[2] - window_1[0];
                                            sourceHeight = window_1[3] - window_1[1];
                                            if (sourceWidth < dstWidth || sourceHeight < dstHeight) {
                                                return [3 /*break*/, 6];
                                            }
                                            dstWindow = window_1;
                                            targetImage = image;
                                            _f.label = 5;
                                        case 5:
                                            i++;
                                            return [3 /*break*/, 3];
                                        case 6:
                                            bandCount = (0, index_1.getBandCount)(targetImage);
                                            if (!source.bands.every(function (band) {
                                                return band >= 1 && band <= bandCount;
                                            }))
                                                throw new Error("band's index is out of range.");
                                            targetSamples = source.bands.map(function (v) {
                                                return v - 1;
                                            });
                                            return [4 /*yield*/, targetImage.readRasters({
                                                    window: dstWindow,
                                                    width: dstWidth,
                                                    height: dstHeight,
                                                    samples: targetSamples,
                                                    fillValue: nodata,
                                                    resampleMethod: source.resampleMethod,
                                                    pool: getPool(),
                                                    interleave: false,
                                                })];
                                        case 7:
                                            data = _f.sent();
                                            return [2 /*return*/, {
                                                    data: Array.isArray(data) ? data : [data],
                                                    width: dstWidth,
                                                    height: dstHeight,
                                                    nodata: nodata,
                                                    range: range,
                                                }];
                                    }
                                });
                            }); }))];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    Reader.prototype.render = function (props) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
        return __awaiter(this, void 0, void 0, function () {
            var samples, _o, mode, _p, layers, _q, alpha, _r, cmap, width, height, orders, colors, mapping, rasters, _s, dstWidth, dstHeight, length, data, dstIndex, i, includeNodata, j, indexes, raster, layer, value, _t, defaultMin, defaultMax, min, max, values, j, indexes, raster, layer, value, _u, defaultMin, defaultMax, min, max, normalized, pixels, indexes, raster, layer, value, _v, defaultMin, defaultMax, min, max, pixels;
            return __generator(this, function (_w) {
                switch (_w.label) {
                    case 0:
                        samples = props.samples, _o = props.mode, mode = _o === void 0 ? "rgb" : _o, _p = props.layers, layers = _p === void 0 ? [] : _p, _q = props.alpha, alpha = _q === void 0 ? true : _q, _r = props.cmap, cmap = _r === void 0 ? "jet" : _r, width = props.width, height = props.height;
                        orders = [];
                        colors = [];
                        mapping = [];
                        samples.forEach(function (sample, i) {
                            sample.bands.forEach(function (_, j) {
                                mapping.push([i, j]);
                            });
                        });
                        switch (mode) {
                            case "rgb": {
                                orders =
                                    layers.length > 0
                                        ? __spreadArray([], (layers !== null && layers !== void 0 ? layers : []).map(function (layer) {
                                            return layer.index;
                                        }), true) : [0, 1, 2];
                                if ((orders === null || orders === void 0 ? void 0 : orders.length) !== 3)
                                    throw new Error("layers length must be 3 at rgb mode.");
                                break;
                            }
                            case "ndi": {
                                orders =
                                    layers.length > 0
                                        ? __spreadArray([], (layers !== null && layers !== void 0 ? layers : []).map(function (layer) {
                                            return layer.index;
                                        }), true) : [0, 1];
                                if ((orders === null || orders === void 0 ? void 0 : orders.length) !== 2)
                                    throw new Error("layers length must be 2 at single mode.");
                                colors = (0, index_1.getColor)(cmap);
                                break;
                            }
                            case "single": {
                                orders =
                                    layers.length > 0
                                        ? __spreadArray([], (layers !== null && layers !== void 0 ? layers : []).map(function (layer) {
                                            return layer.index;
                                        }), true) : [0];
                                if ((orders === null || orders === void 0 ? void 0 : orders.length) !== 1)
                                    throw new Error("layers length must be 1 at single mode.");
                                colors = (0, index_1.getColor)(cmap);
                                break;
                            }
                            default: {
                                throw new Error("Unexpected mode.");
                            }
                        }
                        orders.forEach(function (order) {
                            if (order < 0 || mapping.length <= order)
                                throw new Error("layers include out of range index.");
                        });
                        return [4 /*yield*/, this.getRasters({
                                sources: samples.map(function (sample) {
                                    return __assign({ width: width, height: height }, sample);
                                }),
                            })];
                    case 1:
                        rasters = _w.sent();
                        _s = [
                            Math.floor(width !== null && width !== void 0 ? width : rasters[0].width),
                            Math.floor(height !== null && height !== void 0 ? height : rasters[0].height),
                        ], dstWidth = _s[0], dstHeight = _s[1];
                        length = dstWidth * dstHeight;
                        data = new Uint8ClampedArray(length * 4);
                        dstIndex = 0;
                        for (i = 0; i < length; i++) {
                            includeNodata = false;
                            switch (mode) {
                                case "rgb": {
                                    for (j = 0; j < 3; j++) {
                                        indexes = mapping[orders[j]];
                                        raster = rasters[indexes[0]];
                                        layer = indexes[1];
                                        value = raster.data[layer][i];
                                        if (value === raster.nodata)
                                            includeNodata = true;
                                        _t = raster.range, defaultMin = _t[0], defaultMax = _t[1];
                                        min = (_b = (_a = layers[j]) === null || _a === void 0 ? void 0 : _a.min) !== null && _b !== void 0 ? _b : defaultMin;
                                        max = (_d = (_c = layers[j]) === null || _c === void 0 ? void 0 : _c.max) !== null && _d !== void 0 ? _d : defaultMax;
                                        value = (0, utils_1.normalize)(value, min, max);
                                        data[dstIndex++] = Math.round(255 * value);
                                    }
                                    break;
                                }
                                case "ndi": {
                                    values = [];
                                    for (j = 0; j < 2; j++) {
                                        indexes = mapping[j];
                                        raster = rasters[indexes[0]];
                                        layer = indexes[1];
                                        value = raster.data[layer][i];
                                        if (value === raster.nodata)
                                            includeNodata = true;
                                        _u = raster.range, defaultMin = _u[0], defaultMax = _u[1];
                                        min = (_f = (_e = layers[j]) === null || _e === void 0 ? void 0 : _e.min) !== null && _f !== void 0 ? _f : defaultMin;
                                        max = (_h = (_g = layers[j]) === null || _g === void 0 ? void 0 : _g.max) !== null && _h !== void 0 ? _h : defaultMax;
                                        value = (0, utils_1.normalize)(value, min, max);
                                        values.push(value);
                                    }
                                    normalized = 0;
                                    if (values[1] - values[0] !== 0) {
                                        normalized = (values[0] + values[1]) / (values[0] - values[1]);
                                    }
                                    normalized = (0, utils_1.normalize)(normalized, -1, 1);
                                    pixels = colors[Math.round(255 * normalized)];
                                    data[dstIndex++] = pixels[0];
                                    data[dstIndex++] = pixels[1];
                                    data[dstIndex++] = pixels[2];
                                    break;
                                }
                                case "single": {
                                    indexes = mapping[0];
                                    raster = rasters[indexes[0]];
                                    layer = indexes[1];
                                    value = raster.data[layer][i];
                                    if (value === raster.nodata)
                                        includeNodata = true;
                                    _v = raster.range, defaultMin = _v[0], defaultMax = _v[1];
                                    min = (_k = (_j = layers[0]) === null || _j === void 0 ? void 0 : _j.min) !== null && _k !== void 0 ? _k : defaultMin;
                                    max = (_m = (_l = layers[0]) === null || _l === void 0 ? void 0 : _l.max) !== null && _m !== void 0 ? _m : defaultMax;
                                    value = (0, utils_1.normalize)(value, min, max);
                                    pixels = colors[Math.round(255 * value)];
                                    data[dstIndex++] = pixels[0];
                                    data[dstIndex++] = pixels[1];
                                    data[dstIndex++] = pixels[2];
                                    break;
                                }
                            }
                            data[dstIndex++] = alpha && includeNodata ? 0 : 255;
                        }
                        return [2 /*return*/, new ImageData(data, dstWidth, dstHeight)];
                }
            });
        });
    };
    return Reader;
}());
exports.default = Reader;
