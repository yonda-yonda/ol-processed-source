"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var constants_1 = require("../../constants");
var utils_1 = require("../../utils");
var Reader_1 = __importDefault(require("./Reader"));
var index_1 = require("./index");
var Processor = /** @class */ (function () {
    function Processor(options) {
        this.context_ = options.context;
        this.width = options.width;
        this.height = options.height;
        this.mode = options.mode;
        this.cmap = options.cmap;
        this.status = "ready";
    }
    Processor.prototype.getContext = function () {
        return this.context_;
    };
    Processor.prototype.release = function () {
        if (this.context_) {
            (0, utils_1.clear)(this.context_.canvas, this.context_);
            this.context_ = null;
            this.status = "empty";
        }
    };
    Processor.create = function (options) {
        var _a, _b, _c, _d;
        return __awaiter(this, void 0, void 0, function () {
            var reader, maxPixel, maxHeight, maxWidth, minSize, mode, cmap, imageWidth, imageHeight, resolutions, originExtentAspectRatio, angle, sources, samples, layers, mapping, i, image_1, res, image_2, _e, rotatedCoordinates, rotatedWidth, rotatedHeight, canvas, context, tempCanvas, tempContext, image;
            var _f, _g, _h;
            return __generator(this, function (_j) {
                switch (_j.label) {
                    case 0:
                        reader = new Reader_1.default({ files: options.files, urls: options.urls });
                        maxPixel = (_a = options === null || options === void 0 ? void 0 : options.maxPixel) !== null && _a !== void 0 ? _a : constants_1.CANVAS_MAX_PIXEL;
                        if (maxPixel > constants_1.CANVAS_MAX_PIXEL)
                            throw new Error("maxPixel is too large.");
                        maxHeight = (_b = options === null || options === void 0 ? void 0 : options.maxHeight) !== null && _b !== void 0 ? _b : constants_1.CANVAS_MAX_HEIGHT;
                        if (maxHeight > constants_1.CANVAS_MAX_HEIGHT)
                            throw new Error("maxHeight is too large.");
                        maxWidth = (_c = options === null || options === void 0 ? void 0 : options.maxWidth) !== null && _c !== void 0 ? _c : constants_1.CANVAS_MAX_WIDTH;
                        if (maxWidth > constants_1.CANVAS_MAX_WIDTH)
                            throw new Error("maxWidth is too large.");
                        minSize = (_d = options === null || options === void 0 ? void 0 : options.minSize) !== null && _d !== void 0 ? _d : 1;
                        if (minSize < 1)
                            throw new Error("minSize is too small.");
                        mode = options.mode || "rgb";
                        cmap = options.cmap || null;
                        imageWidth = 0;
                        imageHeight = 0;
                        resolutions = [1, 1];
                        originExtentAspectRatio = 1;
                        angle = 0;
                        sources = options.sources || [];
                        samples = [];
                        layers = [];
                        mapping = [];
                        sources.forEach(function (_a) {
                            var _b = _a.index, index = _b === void 0 ? 0 : _b, _c = _a.band, band = _c === void 0 ? 1 : _c, nodata = _a.nodata, min = _a.min, max = _a.max;
                            var existed = samples.findIndex(function (sample) {
                                return sample.index === index;
                            });
                            if (existed >= 0 && samples[existed].nodata === nodata) {
                                mapping.push([existed, samples[existed].bands.length, min, max]);
                                samples[existed].bands.push(band);
                            }
                            else {
                                mapping.push([samples.length, 0, min, max]);
                                samples.push({
                                    index: index,
                                    bands: [band],
                                    nodata: nodata,
                                });
                            }
                        });
                        mapping.forEach(function (_a) {
                            var sampleIndex = _a[0], bandIndex = _a[1], min = _a[2], max = _a[3];
                            var index = 0;
                            for (var i = 0; i < sampleIndex; i++) {
                                index += samples[i].bands.length;
                            }
                            index += bandIndex;
                            layers.push({
                                index: index,
                                min: min,
                                max: max,
                            });
                        });
                        _j.label = 1;
                    case 1:
                        _j.trys.push([1, 8, , 9]);
                        i = 0;
                        _j.label = 2;
                    case 2:
                        if (!(i < samples.length)) return [3 /*break*/, 7];
                        if (!(i === 0)) return [3 /*break*/, 4];
                        return [4 /*yield*/, reader.getImage(samples[0].index)];
                    case 3:
                        image_1 = _j.sent();
                        if (image_1) {
                            imageWidth = image_1.getWidth();
                            imageHeight = image_1.getHeight();
                            res = image_1.getResolution();
                            resolutions = [Math.abs(res[0]), Math.abs(res[1])];
                            originExtentAspectRatio =
                                (imageWidth * resolutions[0]) / (imageHeight * resolutions[1]);
                            angle = (0, index_1.getTransformedCoordinates)(image_1)[1];
                            if (angle !== 0)
                                angle *= -1; // right-hand to left-hand
                        }
                        return [3 /*break*/, 6];
                    case 4: return [4 /*yield*/, reader.getImage(samples[i].index)];
                    case 5:
                        image_2 = _j.sent();
                        if (imageWidth !== (image_2 === null || image_2 === void 0 ? void 0 : image_2.getWidth())) {
                            throw Error("can't get image width.");
                        }
                        if (imageHeight !== (image_2 === null || image_2 === void 0 ? void 0 : image_2.getHeight())) {
                            throw Error("can't get image height.");
                        }
                        _j.label = 6;
                    case 6:
                        i++;
                        return [3 /*break*/, 2];
                    case 7: return [3 /*break*/, 9];
                    case 8:
                        _e = _j.sent();
                        throw Error("file is something wrong.");
                    case 9:
                        if (imageWidth < imageHeight) {
                            imageHeight = imageWidth / originExtentAspectRatio;
                        }
                        else {
                            imageWidth = imageHeight * originExtentAspectRatio;
                        }
                        rotatedCoordinates = (0, utils_1.rotatePixelExtent)([0, 0, imageWidth, imageHeight], angle);
                        rotatedWidth = rotatedCoordinates[2] - rotatedCoordinates[0];
                        rotatedHeight = rotatedCoordinates[3] - rotatedCoordinates[1];
                        _f = (0, utils_1.adjustSize)([rotatedWidth, rotatedHeight], [imageWidth, imageHeight], maxPixel, maxWidth, maxHeight, minSize), _g = _f[0], rotatedWidth = _g[0], rotatedHeight = _g[1], _h = _f[1], imageWidth = _h[0], imageHeight = _h[1];
                        canvas = document.createElement("canvas");
                        context = canvas.getContext("2d", {
                            storage: "discardable",
                        });
                        tempCanvas = document.createElement("canvas");
                        tempContext = tempCanvas.getContext("2d", {
                            storage: "discardable",
                        });
                        if (!context || !tempContext) {
                            throw Error("unexpected error.");
                        }
                        return [4 /*yield*/, reader
                                .render({
                                mode: mode,
                                cmap: cmap || undefined,
                                samples: samples,
                                width: imageWidth,
                                height: imageHeight,
                                layers: layers,
                            })];
                    case 10:
                        image = _j.sent();
                        tempCanvas.width = image.width;
                        tempCanvas.height = image.height;
                        tempContext.putImageData(image, 0, 0);
                        canvas.width = rotatedWidth;
                        canvas.height = rotatedHeight;
                        context.save();
                        context.translate(rotatedWidth / 2, rotatedHeight / 2);
                        context.rotate(angle);
                        context.drawImage(tempCanvas, 0, 0, image.width, image.height, -image.width / 2, -image.height / 2, image.width, image.height);
                        context.restore();
                        (0, utils_1.clear)(tempCanvas, tempContext);
                        return [2 /*return*/, new Processor({
                                context: context,
                                width: rotatedWidth,
                                height: rotatedHeight,
                                mode: mode,
                                cmap: cmap,
                            })];
                }
            });
        });
    };
    return Processor;
}());
exports.default = Processor;
