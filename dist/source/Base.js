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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseSource = void 0;
var ImageTile_1 = __importDefault(require("ol/ImageTile"));
var TileImage_1 = __importDefault(require("ol/source/TileImage"));
var tilecoord_1 = require("ol/tilecoord");
var TileState_1 = __importDefault(require("ol/TileState"));
var BaseSource = /** @class */ (function (_super) {
    __extends(BaseSource, _super);
    function BaseSource() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    BaseSource.prototype.getTile = function (z, x, y, pixelRatio, projection) {
        try {
            // proj4's transform rarely raise error in ReprojTile
            return _super.prototype.getTile.call(this, z, x, y, pixelRatio, projection);
        }
        catch (_a) {
            var newTile = new ImageTile_1.default([z, x, y], TileState_1.default.EMPTY, "data:image/gif;base64,R0lGODlhAQABAGAAACH5BAEKAP8ALAAAAAABAAEAAAgEAP8FBAA7", null, function (imageTile, src) {
                if (imageTile instanceof ImageTile_1.default)
                    imageTile.getImage().src =
                        src;
            });
            var cache = this.getTileCacheForProjection(projection);
            var tileCoord = [z, x, y];
            var tileCoordKey = (0, tilecoord_1.getKey)(tileCoord);
            var key = this.getKey();
            newTile.key = key;
            cache.set(tileCoordKey, newTile);
            return newTile;
        }
    };
    return BaseSource;
}(TileImage_1.default));
exports.BaseSource = BaseSource;
