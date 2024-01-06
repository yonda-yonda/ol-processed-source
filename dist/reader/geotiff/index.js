"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDataRange = exports.getUnit = exports.getCode = exports.getBandCount = exports.getTransformedCoordinates = exports.getColor = exports.colormaps = exports.rendermodes = exports.Reader = exports.profile = exports.processor = void 0;
var colormap_1 = __importDefault(require("colormap"));
var utils_1 = require("../../utils");
exports.processor = __importStar(require("./Processor"));
exports.profile = __importStar(require("./Profile"));
var Reader_1 = require("./Reader");
Object.defineProperty(exports, "Reader", { enumerable: true, get: function () { return __importDefault(Reader_1).default; } });
exports.rendermodes = ["rgb", "single", "ndi"];
exports.colormaps = [
    "jet",
    "hsv",
    "hot",
    "spring",
    "summer",
    "autumn",
    "winter",
    "bone",
    "copper",
    "greys",
    "yignbu",
    "greens",
    "yiorrd",
    "bluered",
    "rdbu",
    "picnic",
    "rainbow",
    "portland",
    "blackbody",
    "earth",
    "electric",
    "alpha",
    "viridis",
    "inferno",
    "magma",
    "plasma",
    "warm",
    "cool",
    "rainbow-soft",
    "bathymetry",
    "cdom",
    "chlorophyll",
    "density",
    "freesurface-blue",
    "freesurface-red",
    "oxygen",
    "par",
    "phase",
    "salinity",
    "temperature",
    "turbidity",
    "velocity-blue",
    "velocity-green",
    "cubehelix",
];
var getColor = function (cmap) {
    return (0, colormap_1.default)({
        colormap: cmap,
        nshades: 256,
        format: "rgba",
        alpha: 1,
    });
};
exports.getColor = getColor;
function getTransformedCoordinates(image) {
    var _a;
    var affin = null;
    if ((_a = image.getFileDirectory()) === null || _a === void 0 ? void 0 : _a.ModelTransformation) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
        var transformation = image.getFileDirectory().ModelTransformation;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        affin = [
            transformation[0],
            transformation[1],
            transformation[3],
            transformation[4],
            transformation[5],
            transformation[7],
        ];
    }
    if (!affin)
        return [image.getBoundingBox(), 0];
    var imageWidth = image.getWidth();
    var imageHeight = image.getHeight();
    return (0, utils_1.rotate)([imageWidth, imageHeight], affin);
}
exports.getTransformedCoordinates = getTransformedCoordinates;
function getBandCount(image) {
    return image.getBytesPerPixel() / (image.getBitsPerSample() / 8);
}
exports.getBandCount = getBandCount;
function getCode(image) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    var geoKeys = image === null || image === void 0 ? void 0 : image.geoKeys;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (geoKeys === null || geoKeys === void 0 ? void 0 : geoKeys.ProjectedCSTypeGeoKey) {
        // eslint-disable-next-line @typescript-eslint/restrict-plus-operands,@typescript-eslint/no-unsafe-member-access
        return "EPSG:" + geoKeys.ProjectedCSTypeGeoKey;
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (geoKeys === null || geoKeys === void 0 ? void 0 : geoKeys.GeographicTypeGeoKey) {
        // eslint-disable-next-line @typescript-eslint/restrict-plus-operands,@typescript-eslint/no-unsafe-member-access
        return "EPSG:" + geoKeys.GeographicTypeGeoKey;
    }
    return null;
}
exports.getCode = getCode;
function getUnit(image) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    var geoKeys = image === null || image === void 0 ? void 0 : image.geoKeys;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    switch (geoKeys === null || geoKeys === void 0 ? void 0 : geoKeys.ProjLinearUnitsGeoKey) {
        case 9001: {
            return "m";
        }
        case 9002: {
            return "ft";
        }
        case 9003: {
            return "us-ft";
        }
        case 9101: {
            return "radians";
        }
        case 9102: {
            return "degrees";
        }
    }
    return null;
}
exports.getUnit = getUnit;
function getDataRange(image) {
    /*
        respect
            https://github.com/openlayers/openlayers/blob/v6.15.0/src/ol/source/GeoTIFF.js
            https://github.com/geotiffjs/geotiff.js/blob/v2.0.5/src/geotiffimage.js#L44
    */
    var format = image.getSampleFormat();
    var bitsPerSample = image.getBitsPerSample();
    switch (format) {
        case 1: // unsigned integer data
            if (bitsPerSample <= 8) {
                return [0, 255];
            }
            else if (bitsPerSample <= 16) {
                return [0, 65535];
            }
            else if (bitsPerSample <= 32) {
                return [0, 4294967295];
            }
            break;
        case 2: // twos complement signed integer data
            if (bitsPerSample === 8) {
                return [-128, 127];
            }
            else if (bitsPerSample === 16) {
                return [-32768, 32767];
            }
            else if (bitsPerSample === 32) {
                return [-2147483648, 2147483647];
            }
            break;
        case 3: // floating point data
            switch (bitsPerSample) {
                case 16:
                case 32:
                    return [-3.4e38, 3.4e38];
                case 64:
                    return [-Number.MAX_VALUE, Number.MAX_VALUE];
                default:
                    break;
            }
            break;
        default:
            break;
    }
    return null;
}
exports.getDataRange = getDataRange;
