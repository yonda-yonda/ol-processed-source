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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfile = void 0;
var geotiff_1 = require("geotiff");
var utils_1 = require("../../utils");
var index_1 = require("./index");
function getProfile(source, imageIndex) {
    if (imageIndex === void 0) { imageIndex = 0; }
    return __awaiter(this, void 0, void 0, function () {
        var tiff, _a, image, bands, code, unit, range, nodata, width, height, imageExtent, angle, rotatedCoordinates, rotatedWidth, rotatedHeight, resolutions;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!(typeof source === "string")) return [3 /*break*/, 2];
                    return [4 /*yield*/, (0, geotiff_1.fromUrl)(source)];
                case 1:
                    _a = _c.sent();
                    return [3 /*break*/, 4];
                case 2: return [4 /*yield*/, (0, geotiff_1.fromBlob)(source)];
                case 3:
                    _a = _c.sent();
                    _c.label = 4;
                case 4:
                    tiff = _a;
                    return [4 /*yield*/, tiff.getImage(imageIndex)];
                case 5:
                    image = _c.sent();
                    bands = (0, index_1.getBandCount)(image);
                    code = (0, index_1.getCode)(image);
                    unit = (0, index_1.getUnit)(image);
                    range = (0, index_1.getDataRange)(image);
                    nodata = image.getGDALNoData();
                    width = image.getWidth();
                    height = image.getHeight();
                    imageExtent = [Infinity, Infinity, -Infinity, -Infinity];
                    angle = 0;
                    _b = (0, index_1.getTransformedCoordinates)(image), imageExtent = _b[0], angle = _b[1];
                    if (angle !== 0)
                        angle *= -1; // right-hand to left-hand
                    rotatedCoordinates = (0, utils_1.rotatePixelExtent)([0, 0, width, height], angle);
                    rotatedWidth = Math.round(rotatedCoordinates[2] - rotatedCoordinates[0]);
                    rotatedHeight = Math.round(rotatedCoordinates[3] - rotatedCoordinates[1]);
                    resolutions = [
                        (imageExtent[2] - imageExtent[0]) / rotatedWidth,
                        (imageExtent[3] - imageExtent[1]) / rotatedHeight,
                    ];
                    return [2 /*return*/, {
                            width: rotatedWidth,
                            height: rotatedHeight,
                            bbox: imageExtent,
                            resolutions: resolutions,
                            bands: bands,
                            nodata: nodata,
                            unit: unit,
                            code: code,
                            range: range,
                        }];
            }
        });
    });
}
exports.getProfile = getProfile;