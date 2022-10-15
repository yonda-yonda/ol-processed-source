import * as React from "react";
import { Helmet } from "react-helmet-async";
import {
  useForm,
  useFieldArray,
  SubmitHandler,
  Controller,
} from "react-hook-form";
import CssBaseline from "@mui/material/CssBaseline";
import {
  Container,
  Typography,
  Stack,
  Grid,
  TextField,
  Button,
  Tooltip,
  FormControl,
  Select,
  InputLabel,
  MenuItem,
  FormHelperText,
  CircularProgress,
} from "@mui/material";
import { styled } from "@mui/system";

import { Map, View } from "ol";
import "ol/ol.css";
import { defaults as defaultInteraction } from "ol/interaction";
import { defaults as defaultControls, Attribution, Control } from "ol/control";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import { fromLonLat, get as getProjection, transform } from "ol/proj";
import proj4 from "proj4";
import { register as olRegister } from "ol/proj/proj4";
import { utils } from "geo4326";

import GeoTIFFSource from "../../source/GeoTIFF";
import { colormaps, rendermodes, RenderMode, Colormap } from "../../reader/geotiff";
import { CANVAS_MAX_PIXEL } from "../../constants";

const FileInputWrapper = styled("dl")({
  margin: "0 0 50px",
  "&>dt": {
    fontSize: "14px",
    margin: "0 0 5px",
  },
  "&>dd": {
    margin: 0,
  },
});

const CodeStatus = styled("div")({
  fontSize: "12px",
  marginTop: "10px",
  marginLeft: "2px",
});

const CodeInput = styled("div")({
  display: "flex",
  marginTop: "10px",
  alignItems: "center",
  "& > *": {
    flex: "0 0 auto",
    marginRight: "5px",
  },
});

const Config = styled("dl")({
  display: "flex",
  "&>dt": {
    fontSize: "12px",
    flex: "0 0 auto",
    marginRight: "20px",
  },
  "&>dd": {
    marginLeft: "0px",
  },
});

const Buttons = styled("ul")({
  listStyle: "none",
  margin: 0,
  padding: 0,
  display: "flex",
  "&>*": {
    marginRight: "10px",
  },
});

const LayerDetail = styled("div")({
  marginLeft: "20px",
});

const EllipsisWrapper = styled("div")({
  overflow: "hidden",
});

const EllipsisTypography = styled(Typography)({
  overflow: "hidden",
  whiteSpace: "nowrap",
  textOverflow: "ellipsis",
});

const LayerName = styled(EllipsisWrapper)({
  flex: "1 1 auto",
});

const LayerButton = styled("div")({
  flex: "0 0 auto",
});

const StyledUl = styled("ul")({
  listStyle: "none",
  margin: 0,
  padding: 0,
  "& > li": {
    marginTop: "5px",
    "&:firstChild": {
      marginTop: 0,
    },
  },
});

interface Input {
  mode: RenderMode;
  maxPixel: string;
  cmap: Colormap;
  sources: {
    index: string;
    band: string;
    nodata: string;
    min: string;
    max: string;
  }[];
}

type FormError = "SourceNumber" | "SourceError" | "Duplicate";

interface SourceConf {
  file: string;
  nodata: number;
  band: number;
  min: number;
  max: number;
}

interface LayerConf {
  layer: TileLayer<GeoTIFFSource>;
  sources: SourceConf[];
  id: string;
  mode: RenderMode;
  maxPixel: number;
  cmap?: Colormap;
}

const defaultSourcesValue = {
  index: "0",
  band: "1",
  nodata: "0",
  min: "0",
  max: "255",
};

function useOl(props?: {
  center?: number[];
  zoom?: number;
  projection?: string;
}): {
  ref: React.RefObject<HTMLDivElement>;
  map: Map | undefined;
} {
  const { center = fromLonLat([0, 0]), zoom = 1, projection } = { ...props };

  const initialized = React.useRef(false);
  const ref = React.useRef<HTMLDivElement>(null);
  const [map, setMap] = React.useState<Map>();

  React.useEffect(() => {
    if (initialized.current || !ref.current) return;
    const attribution = new Attribution({
      collapsible: false,
    });
    const controls: Control[] = [attribution];
    const map = new Map({
      target: ref.current,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      view: new View({
        center,
        zoom,
        projection,
      }),
      interactions: defaultInteraction({
        altShiftDragRotate: false,
        pinchRotate: false,
      }),
      controls: defaultControls({
        attribution: false,
        zoom: false,
        rotate: false,
      }).extend(controls),
    });
    setMap(map);
    initialized.current = true;
  }, [center, zoom, projection]);

  return {
    ref,
    map,
  };
}

const Viewer = (): React.ReactElement => {
  const ol = useOl();
  const [layerConfs, setLayerConfs] = React.useState<LayerConf[]>([]);
  const [filelist, setFilelist] = React.useState<File[]>([]);
  const [error, setError] = React.useState<FormError | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [reprojection, setReprojection] = React.useState(false);
  const [projection, setProjection] = React.useState<{
    code: string;
    error: boolean;
  }>({
    code: "EPSG:3857",
    error: false,
  });
  const codeRef = React.useRef<HTMLInputElement>();

  const changeMapProjection = React.useCallback(
    (code: string) => {
      if (!getProjection(code)) {
        try {
          const crs = utils.getCrs(code);
          proj4.defs(code, crs);
        } catch {
          setProjection((prev) => {
            return {
              code: prev.code,
              error: true,
            };
          });
          return;
        }
        olRegister(proj4);
      }
      if (ol.map) {
        const view = ol.map.getView();
        const prevProjection = view.getProjection();
        const prevCode = prevProjection?.getCode();
        if (code !== prevCode) {
          const projection = getProjection(code);
          if (projection) {
            const center = view.getCenter();
            ol.map.setView(
              new View({
                center: transform(center ?? [0, 0], prevCode, code),
                zoom: view.getZoom() || 0,
                projection,
              })
            );
          }
        }
        setProjection({
          code,
          error: false,
        });
      }
    },
    [ol.map]
  );

  const { control, handleSubmit, reset, watch } = useForm<Input>({
    mode: "onSubmit",
    criteriaMode: "all",
    defaultValues: {
      mode: "rgb",
      cmap: "jet",
      maxPixel: "1000000",
      sources: [
        { ...defaultSourcesValue, band: "1" },
        { ...defaultSourcesValue, band: "2" },
        { ...defaultSourcesValue, band: "3" },
      ],
    },
  });

  const { fields } = useFieldArray({
    name: "sources",
    control,
  });

  const removeLayer = React.useCallback(
    (id: string) => {
      setLayerConfs((layerConfs) => {
        const newLayerConfs = [...layerConfs];
        const index = newLayerConfs.findIndex((layerConf) => {
          return id === layerConf.id;
        });
        const target = newLayerConfs[index];
        if (target) {
          if (ol.map) {
            const source = target.layer.getSource();
            if (source) source.release();
            ol.map.removeLayer(target.layer);

            newLayerConfs.splice(index, 1);
            return newLayerConfs;
          }
        }
        return newLayerConfs;
      });
    },
    [ol.map]
  );

  const onSubmit: SubmitHandler<Input> = React.useCallback(
    (data) => {
      let id = "";
      const sourceConfigs: SourceConf[] = [];

      for (let i = 0; i < data.sources.length; i++) {
        const source = data.sources[i];
        const addedId = filelist[Number(source.index)].name;

        if (addedId.length > 0) {
          id +=
            addedId +
            "_" +
            source.band +
            "_" +
            source.min +
            "_" +
            source.max +
            "_" +
            source.nodata;
        }

        sourceConfigs.push({
          file: filelist[Number(source.index)].name || "",
          min: Number(source.min),
          max: Number(source.max),
          band: Number(source.band),
          nodata: Number(source.nodata),
        });
      }
      if (data.cmap.length > 0) id += "_" + data.cmap;
      const index = layerConfs.findIndex((layerConf) => {
        return id === layerConf.id;
      });
      if (index >= 0) {
        setError("Duplicate");
        return;
      }
      if (!ol.map) return;

      setLoading(true);
      try {
        const source = new GeoTIFFSource({
          files: filelist,
          mode: data.mode,
          maxPixel: Number(data.maxPixel),
          cmap: data.cmap || undefined,
          wrapX: true,
          sources: data.sources.map((source) => {
            return {
              index: Number(source.index),
              min: Number(source.min),
              max: Number(source.max),
              band: Number(source.band),
              nodata: Number(source.nodata),
            };
          }),
        });
        const fitting = () => {
          if (ol.map) {
            const code = ol.map.getView().getProjection().getCode();
            const extent = source.getBoundingBox(code);
            if (extent)
              ol.map.getView().fit(extent, {
                padding: [40, 20, 40, 20],
                maxZoom: 20,
              });
          }
        };
        const setting = () => {
          const sourceState = source.getState();
          if (sourceState === "ready") {
            if (!ol.map) return;
            const layer = new TileLayer({
              source,
            });
            ol.map.addLayer(layer);
            fitting();
            reset();
            setFilelist([]);
            setLayerConfs((layerConfs) => {
              return [
                ...layerConfs,
                {
                  id,
                  layer,
                  sources: sourceConfigs,
                  mode: data.mode,
                  maxPixel: Number(data.maxPixel),
                  cmap: data.cmap || undefined,
                },
              ];
            });
          }
          if (sourceState === "error") {
            setError("SourceError");
          }
          setLoading(false);
        };
        if (source.getState() === "ready") {
          setting();
        } else {
          const sourceListener = () => {
            const sourceState = source.getState();
            if (sourceState !== "loading") {
              source.removeEventListener("change", sourceListener);
              setting();
            }
          };
          source.addEventListener("change", sourceListener);
        }
      } catch {
        setError("SourceError");
      }
    },
    [filelist, ol.map, layerConfs, reset]
  );
  const watcher = watch();

  return (
    <>
      <CssBaseline />
      <Helmet>
        <title>ol-processed-source / Display Local GeoTIFF File</title>
        <meta name="description" content="Display local GeoTIFF file on map." />
        <link
          rel="canonical"
          href="https://yonda-yonda.github.io/ol-processed-source/geotiff"
        />
        <link
          rel="icon"
          type="image/x-icon"
          href="https://github.githubassets.com/favicon.ico"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
        />
      </Helmet>
      <Container>
        <Typography variant="h2" component="h1">
          ol-processed-source
          <br /> Display Local GeoTIFF File
        </Typography>
        <Stack my={4} spacing={4}>
          <Grid container spacing={2}>
            <Grid item xs={9}>
              <div style={{ position: "relative" }}>
                <div
                  ref={ol.ref}
                  style={{
                    width: "100%",
                    height: "340px",
                  }}
                />

                {!reprojection ? (
                  <div>
                    <CodeStatus>view at {projection.code}</CodeStatus>
                    <Button
                      size="small"
                      variant="outlined"
                      type="button"
                      onClick={() => {
                        setReprojection(true);
                      }}
                    >
                      Reprojection
                    </Button>
                  </div>
                ) : (
                  <div>
                    <CodeInput>
                      <div>
                        <TextField
                          inputRef={codeRef}
                          label="MapCode"
                          placeholder="EPSG:4326"
                          size="small"
                        />
                      </div>
                      <div>
                        <Button
                          variant="contained"
                          type="button"
                          onClick={() => {
                            changeMapProjection(codeRef.current?.value || "");
                          }}
                        >
                          Change
                        </Button>
                      </div>
                      <div>
                        <Button
                          variant="outlined"
                          type="button"
                          onClick={() => {
                            setReprojection(false);
                            setProjection((prev) => {
                              return {
                                code: prev.code,
                                error: false,
                              };
                            });
                          }}
                        >
                          cancel
                        </Button>
                      </div>
                    </CodeInput>
                    {projection.error && (
                      <FormHelperText>Unsupported Code.</FormHelperText>
                    )}
                  </div>
                )}
              </div>
            </Grid>
            <Grid item xs={3}>
              {layerConfs.length > 0 ? (
                <StyledUl>
                  {layerConfs.map((item, i) => {
                    return (
                      <li key={String(i)}>
                        <Stack
                          direction="row"
                          spacing={1}
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <LayerName>
                            <Tooltip
                              title={
                                <div>
                                  {item.sources.map((source, i) => {
                                    return (
                                      <Typography
                                        key={i}
                                        variant="caption"
                                        display="block"
                                      >
                                        {source.file}
                                        <LayerDetail>
                                          band: {source.band}
                                          <br />
                                          range:{" "}
                                          {`${source.min} to ${source.max}`}
                                          <br />
                                          nodata: {source.nodata}
                                        </LayerDetail>
                                      </Typography>
                                    );
                                  })}
                                  <Typography variant="caption" display="block">
                                    Mode: {item.mode}
                                  </Typography>
                                  {item.cmap && (
                                    <Typography
                                      variant="caption"
                                      display="block"
                                    >
                                      Color Map: {item.cmap}
                                    </Typography>
                                  )}
                                  <Typography variant="caption" display="block">
                                    Max Pixel: {item.maxPixel}px
                                  </Typography>
                                </div>
                              }
                              arrow
                              placement="left"
                            >
                              <EllipsisTypography variant="body2">
                                {(Array.from(
                                  new Set(
                                    item.sources.map((source) => {
                                      return source.file;
                                    })
                                  )
                                ) as string[]).reduce((prev, name) => {
                                  return (
                                    prev + (prev.length > 0 ? "," : "") + name
                                  );
                                }, "")}
                              </EllipsisTypography>
                            </Tooltip>
                          </LayerName>
                          <LayerButton>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => {
                                removeLayer(item.id);
                              }}
                            >
                              REMOVE
                            </Button>
                          </LayerButton>
                        </Stack>
                      </li>
                    );
                  })}
                </StyledUl>
              ) : (
                <Typography>Nothing to display.</Typography>
              )}
              {loading && <CircularProgress size={18} sx={{ mt: 1 }} />}
            </Grid>
          </Grid>
          <hr />
          <form onSubmit={handleSubmit(onSubmit)}>
            <FileInputWrapper>
              <dt>Read File</dt>
              <dd>
                <input
                  name="file"
                  type="file"
                  accept=".tiff,image/tiff"
                  onChange={(e) => {
                    if (e.target.files) {
                      const file = e.target.files[0] || undefined;
                      if (file) {
                        setFilelist((prev) => {
                          return [...prev, file];
                        });
                        e.target.value = "";
                        reset({
                          mode: "rgb",
                          cmap: "jet",
                          maxPixel: "10000000",
                          sources: [
                            {
                              ...defaultSourcesValue,
                              band: "1",
                            },
                            {
                              ...defaultSourcesValue,
                              band: "2",
                            },
                            {
                              ...defaultSourcesValue,
                              band: "3",
                            },
                          ],
                        });
                      }
                    }
                  }}
                  disabled={filelist.length > 2 || loading || loading}
                />
              </dd>
            </FileInputWrapper>
            {filelist.length > 0 && (
              <Grid container spacing={4} sx={{ mb: 4 }}>
                <Grid item xs={12}>
                  <Controller
                    control={control}
                    name="mode"
                    render={({ field, fieldState: { error } }) => (
                      <FormControl error={!!error} fullWidth size="small">
                        <InputLabel>Renderer Mode</InputLabel>
                        <Select
                          {...field}
                          disabled={loading}
                          onChange={(v) => {
                            const mode = v.target.value;

                            switch (mode) {
                              case "rgb": {
                                reset({
                                  mode: "rgb",
                                  cmap: "jet",
                                  maxPixel: "10000000",
                                  sources: [
                                    { ...defaultSourcesValue, band: "1" },
                                    { ...defaultSourcesValue, band: "2" },
                                    { ...defaultSourcesValue, band: "3" },
                                  ],
                                });
                                break;
                              }
                              case "single": {
                                reset({
                                  mode: "single",
                                  cmap: colormaps[0],
                                  maxPixel: "10000000",
                                  sources: [
                                    { ...defaultSourcesValue, band: "1" },
                                  ],
                                });
                                break;
                              }
                              case "ndi": {
                                reset({
                                  mode: "ndi",
                                  cmap: colormaps[0],
                                  maxPixel: "10000000",
                                  sources: [
                                    { ...defaultSourcesValue, band: "1" },
                                    { ...defaultSourcesValue, band: "2" },
                                  ],
                                });
                                break;
                              }
                            }
                          }}
                        >
                          {rendermodes.map((v, i) => {
                            return (
                              <MenuItem value={v} key={i}>
                                {v}
                              </MenuItem>
                            );
                          })}
                        </Select>

                        {error?.type === "required" && (
                          <FormHelperText>Required.</FormHelperText>
                        )}
                      </FormControl>
                    )}
                    rules={{
                      required: true,
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  {fields.map((field, index) => {
                    return (
                      <Config key={field.id}>
                        <dt>Index {index}</dt>
                        <dd>
                          <Controller
                            control={control}
                            name={`sources.${index}.index`}
                            render={({ field, fieldState: { error } }) => (
                              <FormControl
                                error={!!error}
                                fullWidth
                                size="small"
                              >
                                <InputLabel>File</InputLabel>
                                <Select
                                  {...field}
                                  disabled={filelist.length < 1 || loading}
                                >
                                  {filelist.map((f, i) => {
                                    return (
                                      <MenuItem value={String(i)} key={i}>
                                        {f.name}
                                      </MenuItem>
                                    );
                                  })}
                                </Select>

                                {error?.type === "required" && (
                                  <FormHelperText>Required.</FormHelperText>
                                )}
                              </FormControl>
                            )}
                            rules={{
                              required: true,
                            }}
                          />
                          <Stack
                            direction="row"
                            spacing={2}
                            sx={{ mt: 2, mb: 1 }}
                          >
                            <Controller
                              control={control}
                              name={`sources.${index}.band`}
                              render={({ field, fieldState: { error } }) => (
                                <FormControl
                                  component="fieldset"
                                  error={!!error}
                                  fullWidth
                                >
                                  <TextField
                                    {...field}
                                    label="band"
                                    size="small"
                                    error={!!error}
                                    disabled={loading}
                                    placeholder="1"
                                  />
                                  {error?.type === "required" && (
                                    <FormHelperText>Required.</FormHelperText>
                                  )}
                                  {error?.type === "pattern" && (
                                    <FormHelperText>
                                      must be a number.
                                    </FormHelperText>
                                  )}
                                </FormControl>
                              )}
                              rules={{
                                required: true,
                                pattern: /^((\+|-){0,1}[1-9]\d*|0)(\.\d+)?$/,
                              }}
                            />
                            <Controller
                              control={control}
                              name={`sources.${index}.nodata`}
                              render={({ field, fieldState: { error } }) => (
                                <FormControl
                                  component="fieldset"
                                  error={!!error}
                                  fullWidth
                                >
                                  <TextField
                                    {...field}
                                    label="nodata"
                                    size="small"
                                    disabled={loading}
                                    error={!!error}
                                  />
                                  {error?.type === "required" && (
                                    <FormHelperText>Required.</FormHelperText>
                                  )}
                                  {error?.type === "pattern" && (
                                    <FormHelperText>
                                      must be a number.
                                    </FormHelperText>
                                  )}
                                </FormControl>
                              )}
                              rules={{
                                required: true,
                                pattern: /^((\+|-){0,1}[1-9]\d*|0)(\.\d+)?$/,
                              }}
                            />
                            <Controller
                              control={control}
                              name={`sources.${index}.min`}
                              render={({ field, fieldState: { error } }) => (
                                <FormControl
                                  component="fieldset"
                                  error={!!error}
                                  fullWidth
                                >
                                  <TextField
                                    {...field}
                                    label="min"
                                    size="small"
                                    disabled={loading}
                                    error={!!error}
                                  />
                                  {error?.type === "required" && (
                                    <FormHelperText>Required.</FormHelperText>
                                  )}
                                  {error?.type === "pattern" && (
                                    <FormHelperText>
                                      must be a number.
                                    </FormHelperText>
                                  )}
                                </FormControl>
                              )}
                              rules={{
                                required: true,
                                pattern: /^((\+|-){0,1}[1-9]\d*|0)(\.\d+)?$/,
                              }}
                            />
                            <Controller
                              control={control}
                              name={`sources.${index}.max`}
                              render={({ field, fieldState: { error } }) => (
                                <FormControl
                                  component="fieldset"
                                  error={!!error}
                                  fullWidth
                                >
                                  <TextField
                                    {...field}
                                    label="max"
                                    size="small"
                                    disabled={loading}
                                    error={!!error}
                                  />
                                  {error?.type === "required" && (
                                    <FormHelperText>Required.</FormHelperText>
                                  )}
                                  {error?.type === "pattern" && (
                                    <FormHelperText>
                                      must be a number.
                                    </FormHelperText>
                                  )}
                                </FormControl>
                              )}
                              rules={{
                                required: true,
                                pattern: /^((\+|-){0,1}[1-9]\d*|0)(\.\d+)?$/,
                              }}
                            />
                          </Stack>
                        </dd>
                      </Config>
                    );
                  })}
                </Grid>
                {watcher.mode !== "rgb" && (
                  <Grid item xs={6}>
                    <Controller
                      control={control}
                      name="cmap"
                      render={({ field, fieldState: { error } }) => (
                        <FormControl error={!!error} fullWidth size="small">
                          <InputLabel>Color Map</InputLabel>
                          <Select {...field} disabled={loading}>
                            {colormaps.map((v, i) => {
                              return (
                                <MenuItem value={v} key={i}>
                                  {v}
                                </MenuItem>
                              );
                            })}
                          </Select>

                          {(error?.type === "required" ||
                            error?.type === "minLength") && (
                            <FormHelperText>Required.</FormHelperText>
                          )}
                        </FormControl>
                      )}
                      rules={{
                        required: true,
                        minLength: 1,
                      }}
                    />
                  </Grid>
                )}
                <Grid item xs={6}>
                  <Controller
                    control={control}
                    name="maxPixel"
                    render={({ field, fieldState: { error } }) => (
                      <FormControl
                        component="fieldset"
                        error={!!error}
                        fullWidth
                      >
                        <TextField
                          {...field}
                          label="Max Pixel Size"
                          size="small"
                          disabled={loading}
                          error={!!error}
                        />
                        {error?.type === "required" && (
                          <FormHelperText>Required.</FormHelperText>
                        )}
                        {error?.type === "pattern" && (
                          <FormHelperText>must be a number.</FormHelperText>
                        )}
                        {error?.type === "max" && (
                          <FormHelperText>
                            must be less than {CANVAS_MAX_PIXEL}.
                          </FormHelperText>
                        )}
                      </FormControl>
                    )}
                    rules={{
                      required: true,
                      pattern: /^([1-9][0-9]*|0)$/,
                      max: CANVAS_MAX_PIXEL,
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl error={!!error}>
                    <Buttons>
                      <li>
                        <Button
                          variant="contained"
                          type="submit"
                          disabled={filelist.length < 1 || loading}
                          onClick={() => {
                            setError(null);
                          }}
                        >
                          Add Layer
                        </Button>
                      </li>
                      <li>
                        <Button
                          variant="outlined"
                          type="button"
                          onClick={() => {
                            setFilelist([]);
                            reset();
                          }}
                          disabled={filelist.length < 1 || loading}
                        >
                          Clear
                        </Button>
                      </li>
                    </Buttons>
                    {error === "SourceNumber" && (
                      <FormHelperText sx={{ ml: 0 }}>
                        Unexpected number of sources.
                      </FormHelperText>
                    )}
                    {error === "SourceError" && (
                      <FormHelperText sx={{ ml: 0 }}>
                        Some values are invalid.
                      </FormHelperText>
                    )}
                    {error === "Duplicate" && (
                      <FormHelperText sx={{ ml: 0 }}>
                        Duplicate Layer.
                      </FormHelperText>
                    )}
                    {loading && (
                      <FormHelperText sx={{ mt: 1 }}>loading.</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
              </Grid>
            )}
          </form>
        </Stack>
      </Container>
    </>
  );
};
export default Viewer;
