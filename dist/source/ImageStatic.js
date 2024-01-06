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
var utils_1 = require("../utils");
var Base_1 = require("./Base");
var ImageSatic = /** @class */ (function (_super) {
    __extends(ImageSatic, _super);
    function ImageSatic(userOptions) {
        var _this = this;
        var options = Object.assign({
            maxPixel: constants_1.CANVAS_MAX_PIXEL,
            maxWidth: constants_1.CANVAS_MAX_WIDTH,
            maxHeight: constants_1.CANVAS_MAX_HEIGHT,
            tileSize: common_1.DEFAULT_TILE_SIZE,
            wrapX: true,
            crossOrigin: "",
        }, userOptions);
        if (!options.url && !options.file)
            throw new Error("source url or file is necessary.");
        var tileSize = options.tileSize;
        if (tileSize < 256)
            throw new Error("tileSize is too small.");
        var maxPixel = options.maxPixel;
        if (maxPixel > constants_1.CANVAS_MAX_PIXEL)
            throw new Error("maxPixel is too large.");
        var maxHeight = options.maxHeight;
        if (maxHeight > constants_1.CANVAS_MAX_HEIGHT)
            throw new Error("maxHeight is too large.");
        var maxWidth = options.maxWidth;
        if (maxWidth > constants_1.CANVAS_MAX_WIDTH)
            throw new Error("maxWidth is too large.");
        var wrapX = options.wrapX;
        var projection = (0, proj_1.get)(options.projection);
        if (!projection && typeof options.projection === "string") {
            try {
                var crs = geo4326_1.utils.getCrs(options.projection);
                proj4_2.default.defs(options.projection, crs);
                (0, proj4_1.register)(proj4_2.default);
                projection = (0, proj_1.get)(options.projection);
                // eslint-disable-next-line no-empty
            }
            catch (_a) { }
        }
        if (!projection)
            throw new Error("Unsupported projection.");
        var imageExtent = options.imageExtent;
        if (imageExtent.length < 4 ||
            imageExtent[2] <= imageExtent[0] ||
            imageExtent[3] <= imageExtent[1])
            throw new Error("invalid extent.");
        var originExtentSize = [
            imageExtent[2] - imageExtent[0],
            imageExtent[3] - imageExtent[1],
        ];
        var originExtentAspectRatio = originExtentSize[0] / originExtentSize[1];
        var rad = 0;
        if (options.rotate) {
            rad = options.rotate;
            imageExtent = (0, utils_1.rotatePixelExtent)(imageExtent, rad);
        }
        var gridExtent = imageExtent;
        var gridExtentWidth = gridExtent[2] - gridExtent[0];
        var gridExtentHeight = gridExtent[3] - gridExtent[1];
        var tileLoadFunction = function (imageTile, coordString) {
            var _a = coordString.split(",").map(Number), z = _a[0], x = _a[1], y = _a[2];
            var canvas = document.createElement("canvas");
            var context = canvas.getContext("2d", {
                storage: "discardable",
            });
            var tempCanvas = document.createElement("canvas");
            var tempContext = tempCanvas.getContext("2d", {
                storage: "discardable",
            });
            if (!_this.context_ || !context || !tempContext) {
                imageTile.setState(TileState_1.default.ERROR);
                return;
            }
            canvas.width = tileSize;
            canvas.height = tileSize;
            var window = (0, utils_1.getWindow)(_this.isGlobalGrid_ ? gridExtent : imageExtent, z, x, y);
            var tileLeft = window[0];
            var tileRight = window[2];
            var tileTop = window[1];
            var tileBottom = window[3];
            var imageExtentLeft = imageExtent[0], imageExtentBottom = imageExtent[1], imageExtentRight = imageExtent[2], imageExtentTop = imageExtent[3];
            if (_this.isGlobalGrid_) {
                var extentWidth = gridExtent[2] - gridExtent[0];
                if (imageExtentLeft < gridExtent[0] && tileRight > 0) {
                    tileLeft -= extentWidth;
                    tileRight -= extentWidth;
                }
                else if (gridExtent[2] < imageExtentRight && tileLeft < 0) {
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
                }
            }
            var sourcePerPixel = [
                (imageExtentRight - imageExtentLeft) / _this.context_.canvas.width,
                (imageExtentTop - imageExtentBottom) / _this.context_.canvas.height,
            ];
            var tilePerPixel = [
                (tileRight - tileLeft) / tileSize,
                (tileTop - tileBottom) / tileSize,
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
            tempContext.clearRect(0, 0, sourceRectSize[0], sourceRectSize[1]);
            tempContext.putImageData(_this.context_.getImageData(sourceRect[0], sourceRect[1], sourceRectSize[0], sourceRectSize[1]), 0, 0);
            context.drawImage(tempCanvas, 0, 0, sourceRectSize[0], sourceRectSize[1], tileRect[0], tileRect[1], tileRectSize[0], tileRectSize[1]);
            var src = canvas.toDataURL();
            imageTile.getImage().src = src;
            (0, utils_1.clear)(tempCanvas, tempContext);
            (0, utils_1.clear)(canvas, context);
        };
        _this = _super.call(this, Object.assign({}, options, {
            state: "loading",
            projection: projection,
            tileLoadFunction: tileLoadFunction,
            url: "{z},{x},{y}",
        })) || this;
        _this.imageExtent_ = imageExtent;
        _this.isGlobalGrid_ = false;
        var code = projection.getCode();
        _this.code_ = code;
        if (wrapX) {
            var globalGridExtent = (0, utils_1.is4326)(code)
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
                    imageExtent[0] - imageExtent[2] > gridExtentWidth)
                    throw new Error("Invalid extent.");
                _this.isGlobalGrid_ = true;
            }
        }
        var canvas = document.createElement("canvas");
        var context = canvas.getContext("2d", {
            storage: "discardable",
        });
        if (!context) {
            _this.context_ = null;
            throw new Error("Can't get canvas context.");
        }
        _this.context_ = context;
        var image = new Image();
        image.crossOrigin = options.crossOrigin;
        var url = "";
        if (options.file)
            url = URL.createObjectURL(options.file);
        else if (options.url)
            url = options.url;
        image.addEventListener("load", function () {
            var _a, _b, _c;
            if (options.file)
                URL.revokeObjectURL(url);
            if (_this.context_) {
                var imageWidth = image.width;
                var imageHeight = image.height;
                if (imageWidth < imageHeight) {
                    imageHeight = imageWidth / originExtentAspectRatio;
                }
                else {
                    imageWidth = imageHeight * originExtentAspectRatio;
                }
                var rotatedCoordinates = (0, utils_1.rotatePixelExtent)([0, 0, imageWidth, imageHeight], rad);
                var rotatedWidth = rotatedCoordinates[2] - rotatedCoordinates[0];
                var rotatedHeight = rotatedCoordinates[3] - rotatedCoordinates[1];
                _a = (0, utils_1.adjustSize)([rotatedWidth, rotatedHeight], [imageWidth, imageHeight], maxPixel, maxWidth, maxHeight, tileSize), _b = _a[0], rotatedWidth = _b[0], rotatedHeight = _b[1], _c = _a[1], imageWidth = _c[0], imageHeight = _c[1];
                var maxResolution = Math.max(gridExtentWidth, gridExtentHeight) / tileSize;
                _this.tileGrid = new TileGrid_1.default({
                    extent: gridExtent,
                    tileSize: tileSize,
                    minZoom: options.minZoom,
                    resolutions: (0, utils_1.resolutionsFromExtent)(gridExtent, {
                        maxZoom: options.maxZoom,
                        tileSize: tileSize,
                        maxResolution: maxResolution,
                    }),
                });
                _this.context_.canvas.width = rotatedWidth;
                _this.context_.canvas.height = rotatedHeight;
                _this.context_.save();
                _this.context_.translate(rotatedWidth / 2, rotatedHeight / 2);
                _this.context_.rotate(-rad);
                _this.context_.drawImage(image, 0, 0, image.width, image.height, -imageWidth / 2, -imageHeight / 2, imageWidth, imageHeight);
                _this.context_.restore();
                _this.setState("ready");
            }
        });
        image.addEventListener("error", function () {
            if (options.file)
                URL.revokeObjectURL(url);
            _this.setState("error");
        });
        image.src = url;
        return _this;
    }
    ImageSatic.prototype.getBoundingBox = function (dstCode) {
        var originExtent = this.imageExtent_;
        var srcCode = this.code_;
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
            catch (_a) {
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
    ImageSatic.prototype.release = function () {
        if (this.context_) {
            (0, utils_1.clear)(this.context_.canvas, this.context_);
            this.context_ = null;
            this.setState("undefined");
        }
    };
    return ImageSatic;
}(Base_1.BaseSource));
exports.default = ImageSatic;
