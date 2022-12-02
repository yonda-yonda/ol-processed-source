# ol-processed-source

Alternative to `ol.source`.
Depends on OpenLayers(+v6.15.0), geotiff.js.

[example pages](https://yonda-yonda.github.io/ol-processed-source/)

## Attention

The source continues to hold the image internally as a canvas element.  
Note that loading large images consumes large memory.  
To display a large number of layers at the same time, it is recommended to use the official methods.

An upper limit can be set for a canvas size.  
If a size of loaded image is larger than maxSize, an image is scaled down. So, that maximum resolution to be worse.

Other than that, displaying tiles also consumes memory.

Also, the performance of `Reader.render` is not optimal.

## Common Process

1. Load image.
1. Resize to fit the aspect ratio of extents.
1. Resize to fit upper limit of canvas size.
1. If short side is smaller than tileSize, it will be enlarged to fit tileSize.
1. Saved as a canvas element.
1. Cut out from canvas to each tile.

## ImageStatic

Alternative to `ol.source.ImageStatic`.

- Support KML-like rotation.
- It can also be displayed in a projection system other than the one specified by source. (Official ol.source.ImageStatic fail in some cases.)
- Area beyond +-180 degrees latitude can also be displayed when wrapX is true.

### Sample

```Javascript
const imageSource = new ImageStatic({
    projection: "EPSG:27700",
    url: "https://~",
    imageExtent: [0, 0, 700000, 1300000],
    rotate: (45 / 180) * Math.PI,
    maxPixel: 1000*1000,
    crossOrigin: "anonymous",
    wrapX: true,
});
if (imageSource.getState() === "ready") {
    const layer = new TileLayer({
        source,
    });
    map.addLayer(layer);
} else {
    const sourceListener = () => {
        const sourceState = imageSource.getState();
        if (sourceState !== "loading") {
            imageSource.removeEventListener("change", sourceListener);
            if (sourceState === "ready") {
                const layer = new TileLayer({
                    source,
                });
                map.addLayer(layer);
            }
        }
    };
    imageSource.addEventListener("change", sourceListener);
}

// When no longer needed.
imageSource.release();
```

### Props

| Name      | Type                            | Description                                                                                                        |
| --------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| options   | object                          | params.                                                                                                            |
| url       | string                          | Image URL. Required if file is not provided. Not recommended for use with large file as it takes time to download. |
| file      | blob                            | File blob. Required if url is not provided.                                                                        |
| rotate    | number                          | Image rotation angle. Set in radians.                                                                              |
| maxPixel  | number                          | Maximum size of canvas to hold.                                                                                    |
| maxWidth  | number                          | Maximum width of canvas to hold.                                                                                   |
| maxHeight | number                          | Maximum height of canvas to hold.                                                                                  |
| tileSize  | number \| `module:ol/size~Size` | Inner TileGrid's tile size. Default is 256.                                                                        |
| wrapX     | boolean                         | WrapX. Defaults is true.                                                                                           |

For other props, refer to TileGrid's Options. However, some props are ignored.

## GeoTIFF

Alternative to `ol.source.GetTIFF`.

- Support rotated GeoTIFF. (The official ol.source.GetTIFF ignore rotation.)
- Area beyond +-180 degrees latitude can also be displayed when wrapX is true.

If you don't need any of the above feature, you should use the official ol.source.GetTIFF.

### Sample

```Javascript
const imageSource = new GeoTIFF({
    files: [fileblob1, fileblob2],
    mode: "ndi",
    maxPixel: 1000*1000,
    cmap: "jet",
    wrapX: true,
    sources: [
        {
            index: 0, // fileblob1
            min: 0,
            max: 2**16 - 1,
            band: 1,
            nodata: 0,
        },
        {
            index: 1, // fileblob2
            min: 0,
            max: 2**16 - 1,
            band: 3,
            nodata: -9999,
        }
    ]
});
if (imageSource.getState() === "ready") {
    const layer = new TileLayer({
        source,
    });
    map.addLayer(layer);
} else {
    const sourceListener = () => {
        const sourceState = imageSource.getState();
        if (sourceState !== "loading") {
            imageSource.removeEventListener("change", sourceListener);
            if (sourceState === "ready") {
                const layer = new TileLayer({
                    source,
                });
                map.addLayer(layer);
            }
        }
    };
    imageSource.addEventListener("change", sourceListener);
}


// When no longer needed.
imageSource.release();
```

### Props

| Name      | Type                            | Description                                                                                                            |
| --------- | ------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| options   | object                          | params.                                                                                                                |
| urls      | string[]                        | Image URLs. Required if files are not provided. Not recommended for use with large files as it takes time to download. |
| files     | blob[]                          | File blobs. Required if urls are not provided.                                                                         |
| sources   | [SourceConfig](#sourceconfig)[] | **REQUIRED.** Source configures.                                                                                       |
| mode      | [RenderMode](#rendermode)       | render mode. `rgb`, `single`, or `ndi`. Default is `rgb`.                                                              |
| cmap      | string                          | [colormap](https://www.npmjs.com/package/colormap) name. Ignored if mode is `rgb`.                                     |
| maxPixel  | number                          | Maximum size of canvas to hold.                                                                                        |
| maxWidth  | number                          | Maximum width of canvas to hold.                                                                                       |
| maxHeight | number                          | Maximum height of canvas to hold.                                                                                      |
| tileSize  | number\|`module:ol/size~Size`   | Inner TileGrid's tile size. Default is 256.                                                                            |
| wrapX     | boolean                         | WrapX. Defaults is true.                                                                                               |

For other props, refer to TileGrid's Options. However, some props are ignored.

### SourceConfig

| Name   | Type   | Description                                                             |
| ------ | ------ | ----------------------------------------------------------------------- |
| index  | number | **REQUIRED.** Index of files or urls.                                   |
| band   | number | **REQUIRED.** Band numbers to be read from (where the first band is 1). |
| nodata | number | Values to discard (overriding any nodata values in the metadata).       |
| min    | number | The minimum source data value (overriding minimum value of data type).  |
| max    | number | The maximum source data value (overriding maximum value of data type).  |

### RenderMode

| Name     | Description                                                                                                                             |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `rgb`    | Display in RGB color(or True color). sources are required 3. sources[0] is red, sources[1] is green, sources[2] is blue.                |
| `single` | Display in monochrome. sources are required 1.                                                                                          |
| `ndi`    | Display in The normalized difference index. sources are required 2. Calculated `(sources[0] - sources[1]) / (sources[0] + sources[1])`. |

## Refs

- [docs/image.md](docs/image.md)
- [docs/geotiff.md](docs/geotiff.md)
