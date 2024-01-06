"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var geo4326_1 = require("geo4326");
var proj_1 = require("ol/proj");
var proj4_1 = require("ol/proj/proj4");
var common_1 = require("ol/tilegrid/common");
var TileGrid_1 = __importDefault(require("ol/tilegrid/TileGrid"));
var TileState_1 = __importDefault(require("ol/TileState"));
var proj4_2 = __importDefault(require("proj4"));
var constants_1 = require("../constants");
var Processor_1 = __importDefault(require("../reader/geotiff/Processor"));
var Profile_1 = require("../reader/geotiff/Profile");
var utils_1 = require("../utils");
var Base_1 = require("./Base");
var GeoTIFF = /** @class */ (function (_super) {
    __extends(GeoTIFF, _super);
    function GeoTIFF(userOptions) {
        var _this = this;
        var options = Object.assign({
            maxPixel: constants_1.CANVAS_MAX_PIXEL,
            maxWidth: constants_1.CANVAS_MAX_WIDTH,
            maxHeight: constants_1.CANVAS_MAX_HEIGHT,
            tileSize: common_1.DEFAULT_TILE_SIZE,
            wrapX: true,
        }, userOptions);
        if (options.maxPixel > constants_1.CANVAS_MAX_PIXEL)
            throw new Error("maxPixel is too large.");
        if (options.maxHeight > constants_1.CANVAS_MAX_HEIGHT)
            throw new Error("maxHeight is too large.");
        if (options.maxWidth > constants_1.CANVAS_MAX_WIDTH)
            throw new Error("maxWidth is too large.");
        var tileSize = options.tileSize;
        if (tileSize < 256)
            throw new Error("tileSize is too small.");
        var tileLoadFunction = function (imageTile, coordString) {
            var _a;
            var _b = coordString.split(",").map(Number), z = _b[0], x = _b[1], y = _b[2];
            var canvas = document.createElement("canvas");
            var context = canvas.getContext("2d", {
                storage: "discardable",
            });
            var tempCanvas = document.createElement("canvas");
            var tempContext = tempCanvas.getContext("2d", {
                storage: "discardable",
            });
            var context_ = (_a = _this.processor_) === null || _a === void 0 ? void 0 : _a.getContext();
            if (!_this.imageExtent_ ||
                !_this.gridExtent_ ||
                !context_ ||
                !context ||
                !tempContext) {
                imageTile.setState(TileState_1.default.ERROR);
                return;
            }
            canvas.width = _this.tileSize_;
            canvas.height = _this.tileSize_;
            var window = (0, utils_1.getWindow)(_this.isGlobalGrid_ ? _this.gridExtent_ : _this.imageExtent_, z, x, y);
            var tileLeft = window[0];
            var tileRight = window[2];
            var tileTop = window[1];
            var tileBottom = window[3];
            var _c = _this.imageExtent_, imageExtentLeft = _c[0], imageExtentBottom = _c[1], imageExtentRight = _c[2], imageExtentTop = _c[3];
            if (_this.isGlobalGrid_) {
                var extentWidth = _this.gridExtent_[2] - _this.gridExtent_[0];
                if (imageExtentLeft < _this.gridExtent_[0] && tileRight > 0) {
                    tileLeft -= extentWidth;
                    tileRight -= extentWidth;
                }
                else if (_this.gridExtent_[2] < imageExtentRight && tileLeft < 0) {
                    tileLeft += extentWidth;
                    tileRight += extentWidth;
                }
                if (!(0, utils_1.crossing)([
                    imageExtentLeft,
                    imageExtentBottom,
                    imageExtentRight,
                    imageExtentTop,
                ], [tileLeft, tileBottom, tileRight, tileTop])) {
                    imageTile.setState(TileState_1.default.EMPTY);
                    return;
                }
            }
            var sourcePerPixel = [
                (imageExtentRight - imageExtentLeft) / context_.canvas.width,
                (imageExtentTop - imageExtentBottom) / context_.canvas.height,
            ];
            var tilePerPixel = [
                (tileRight - tileLeft) / _this.tileSize_,
                (tileTop - tileBottom) / _this.tileSize_,
            ];
            var leftBottom = [
                Math.max(tileLeft, imageExtentLeft),
                Math.max(imageExtentBottom, tileBottom),
            ];
            var rightTop = [
                Math.min(tileRight, imageExtentRight),
                Math.min(imageExtentTop, tileTop),
            ];
            var tileRect = [
                Math.round((leftBottom[0] - tileLeft) / tilePerPixel[0]),
                Math.round((tileTop - rightTop[1]) / tilePerPixel[1]),
                Math.round((rightTop[0] - tileLeft) / tilePerPixel[0]),
                Math.round((tileTop - leftBottom[1]) / tilePerPixel[1]),
            ];
            var sourceRect = [
                Math.round((leftBottom[0] - imageExtentLeft) / sourcePerPixel[0]),
                Math.round((imageExtentTop - rightTop[1]) / sourcePerPixel[1]),
                Math.round((rightTop[0] - imageExtentLeft) / sourcePerPixel[0]),
                Math.round((imageExtentTop - leftBottom[1]) / sourcePerPixel[1]),
            ];
            var sourceRectSize = [
                sourceRect[2] - sourceRect[0],
                sourceRect[3] - sourceRect[1],
            ];
            var tileRectSize = [
                tileRect[2] - tileRect[0],
                tileRect[3] - tileRect[1],
            ];
            if (Math.min.apply(Math, __spreadArray(__spreadArray([], sourceRectSize, false), tileRectSize, false)) <= 0) {
                imageTile.setState(TileState_1.default.EMPTY);
                return;
            }
            tempCanvas.width = sourceRectSize[0];
            tempCanvas.height = sourceRectSize[1];
            tempContext.putImageData(context_.getImageData(sourceRect[0], sourceRect[1], sourceRectSize[0], sourceRectSize[1]), 0, 0);
            context.drawImage(tempCanvas, 0, 0, sourceRectSize[0], sourceRectSize[1], tileRect[0], tileRect[1], tileRectSize[0], tileRectSize[1]);
            var src = canvas.toDataURL();
            imageTile.getImage().src = src;
            (0, utils_1.clear)(tempCanvas, tempContext);
            (0, utils_1.clear)(canvas, context);
        };
        _this = _super.call(this, Object.assign({}, options, {
            state: "loading",
            tileLoadFunction: tileLoadFunction,
            url: "{z},{x},{y}",
        })) || this;
        _this.processor_ = null;
        _this.isGlobalGrid_ = false;
        _this.imageExtent_ = null;
        _this.gridExtent_ = null;
        _this.profile_ = null;
        _this.tileSize_ = tileSize;
        _this.setup_(options);
        return _this;
    }
    GeoTIFF.prototype.getBoundingBox = function (dstCode) {
        var _a;
        var originExtent = this.imageExtent_;
        var srcCode = (_a = this.profile_) === null || _a === void 0 ? void 0 : _a.code;
        if (!originExtent || !srcCode)
            return null;
        if (!dstCode)
            return originExtent;
        var dstProjection = (0, proj_1.get)(dstCode);
        if (!dstProjection) {
            try {
                var crs = geo4326_1.utils.getCrs(dstCode);
                proj4_2.default.defs(dstCode, crs);
                (0, proj4_1.register)(proj4_2.default);
                dstProjection = (0, proj_1.get)(dstCode);
            }
            catch (_b) {
                throw new Error("Unsupported projection.");
            }
        }
        var checkedDstCode = dstProjection === null || dstProjection === void 0 ? void 0 : dstProjection.getCode();
        if (!checkedDstCode)
            return null;
        if (!dstCode || srcCode === checkedDstCode)
            return originExtent;
        var transformed = __spreadArray(__spreadArray([], (0, proj_1.transform)([originExtent[0], originExtent[1]], srcCode, checkedDstCode), true), (0, proj_1.transform)([originExtent[2], originExtent[3]], srcCode, checkedDstCode), true);
        var worldExtent = (0, utils_1.is4326)(checkedDstCode)
            ? constants_1.EXTENT[4326]
            : (0, utils_1.is3857)(checkedDstCode)
                ? constants_1.EXTENT[3857]
                : null;
        if (transformed[0] > transformed[2] && worldExtent) {
            transformed[2] += worldExtent[2] - worldExtent[0];
        }
        return transformed;
    };
    GeoTIFF.prototype.getSize = function () {
        if (this.processor_)
            return [this.processor_.width, this.processor_.height];
        return null;
    };
    GeoTIFF.prototype.release = function () {
        if (this.processor_) {
            this.processor_.release();
            this.setState("undefined");
        }
    };
    GeoTIFF.prototype.setup_ = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, code, unit, imageExtent, projection, crs, gridExtent, gridExtentWidth, gridExtentHeight, globalGridExtent, maxResolution, tileGrid, createOptions, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        if (!options.files) return [3 /*break*/, 2];
                        _a = this;
                        return [4 /*yield*/, (0, Profile_1.getProfile)(options.files[0])];
                    case 1:
                        _a.profile_ = _e.sent();
                        return [3 /*break*/, 4];
                    case 2:
                        if (!options.urls) return [3 /*break*/, 4];
                        _b = this;
                        return [4 /*yield*/, (0, Profile_1.getProfile)(options.urls[0])];
                    case 3:
                        _b.profile_ = _e.sent();
                        _e.label = 4;
                    case 4:
                        if (!this.profile_) {
                            this.setState("error");
                            return [2 /*return*/];
                        }
                        code = this.profile_.code;
                        unit = this.profile_.unit;
                        imageExtent = this.profile_.bbox;
                        projection = code ? (0, proj_1.get)(code) : null;
                        if (!projection) {
                            if (code) {
                                try {
                                    crs = geo4326_1.utils.getCrs(code);
                                    proj4_2.default.defs(code, crs);
                                    (0, proj4_1.register)(proj4_2.default);
                                    projection = (0, proj_1.get)(code);
                                }
                                catch (_f) {
                                    if (unit) {
                                        projection = new proj_1.Projection({
                                            code: code,
                                            units: unit,
                                        });
                                    }
                                }
                            }
                        }
                        if (!projection || !code) {
                            this.setState("error");
                            return [2 /*return*/];
                        }
                        this.projection = projection;
                        gridExtent = __spreadArray([], imageExtent, true);
                        gridExtentWidth = gridExtent[2] - gridExtent[0];
                        gridExtentHeight = gridExtent[3] - gridExtent[1];
                        if (options.wrapX) {
                            globalGridExtent = (0, utils_1.is4326)(code)
                                ? constants_1.EXTENT[4326]
                                : (0, utils_1.is3857)(code)
                                    ? constants_1.EXTENT[3857]
                                    : null;
                            if (globalGridExtent) {
                                gridExtent = globalGridExtent;
                                gridExtentWidth = gridExtent[2] - gridExtent[0];
                                gridExtentHeight = gridExtent[3] - gridExtent[1];
                                if (imageExtent[0] < gridExtent[0] - gridExtentWidth / 2 ||
                                    gridExtent[2] + gridExtentWidth / 2 < imageExtent[0] ||
                                    imageExtent[1] < gridExtent[1] ||
                                    gridExtent[3] < imageExtent[1] ||
                                    imageExtent[2] < gridExtent[0] - gridExtentWidth / 2 ||
                                    gridExtent[2] + gridExtentWidth / 2 < imageExtent[2] ||
                                    imageExtent[3] < gridExtent[1] ||
                                    gridExtent[3] < imageExtent[3] ||
                                    imageExtent[2] <= imageExtent[0] ||
                                    imageExtent[0] - imageExtent[2] > gridExtentWidth) {
                                    this.setState("error");
                                    return [2 /*return*/];
                                }
                                this.isGlobalGrid_ = true;
                            }
                        }
                        this.imageExtent_ = imageExtent;
                        this.gridExtent_ = gridExtent;
                        maxResolution = Math.max(gridExtentWidth, gridExtentHeight) / this.tileSize_;
                        tileGrid = new TileGrid_1.default({
                            extent: gridExtent,
                            tileSize: this.tileSize_,
                            minZoom: options.minZoom,
                            resolutions: (0, utils_1.resolutionsFromExtent)(gridExtent, {
                                maxZoom: options.maxZoom,
                                tileSize: this.tileSize_,
                                maxResolution: maxResolution,
                            }),
                        });
                        if (!tileGrid) {
                            this.setState("error");
                            return [2 /*return*/];
                        }
                        this.tileGrid = tileGrid;
                        createOptions = Object.assign({}, options);
                        _e.label = 5;
                    case 5:
                        _e.trys.push([5, 7, , 8]);
                        createOptions.minSize = this.tileSize_;
                        _c = this;
                        return [4 /*yield*/, Processor_1.default.create(createOptions)];
                    case 6:
                        _c.processor_ = _e.sent();
                        return [3 /*break*/, 8];
                    case 7:
                        _d = _e.sent();
                        this.setState("error");
                        return [2 /*return*/];
                    case 8:
                        this.setState("ready");
                        return [2 /*return*/];
                }
            });
        });
    };
    return GeoTIFF;
}(Base_1.BaseSource));
exports.default = GeoTIFF;
