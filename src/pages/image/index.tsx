import * as React from "react";
import { Helmet } from "react-helmet-async";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import CssBaseline from "@mui/material/CssBaseline";
import {
  Container,
  Typography,
  Stack,
  Grid,
  TextField,
  Button,
  RadioGroup,
  Radio,
  Tooltip,
  FormControl,
  FormControlLabel,
  FormHelperText,
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

import { ImageSource } from "../../source/Image";
import { CANVAS_MAX_PIXEL } from "../../constants";

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

const Hint = styled("div")({
  fontSize: "12px",
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
  code: string;
  type: string;
  url: string;
  files: FileList | string;
  maxPixel: string;
  extent: string;
  rotate: string;
};

interface SubmitProps {
  id: string;
  source: Input;
};

type FormError =
  | "Duplicate"
  | "InvalidExtent"
  | "ReversedExtent"
  | "InvalidProps"
  | "FailedLoadSource"
  | "UnsupportedCrs";

interface LayerConf {
  layer: TileLayer<ImageSource>;
  name: string;
  id: string;
  code: string;
  extent: number[];
  rotate: number;
  maxPixel: number;
};

const defaultSourceValue = {
  code: "EPSG:4326",
  type: "file",
  files: "",
  url: "",
  extent: "",
  rotate: "0",
  maxPixel: "10000000",
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

  const {
    control,
    handleSubmit,
    register,
    reset,
    watch,
    formState: { errors },
  } = useForm<Input>({
    mode: "onSubmit",
    criteriaMode: "all",
    defaultValues: defaultSourceValue,
  });

  const removeLayer = React.useCallback(
    (id: string) => {
      setLayerConfs((layerConfs) => {
        const newLayerConfs = [...layerConfs];
        const index = newLayerConfs.findIndex((layerConf) => {
          return id === layerConf.id;
        });
        const target = newLayerConfs[index];
        if (target && ol.map) {
          ol.map.removeLayer(target.layer);

          newLayerConfs.splice(index, 1);
          return newLayerConfs;
        }
        return newLayerConfs;
      });
    },
    [ol.map]
  );

  const setLayer = React.useCallback(
    async (map: Map, id: string, source: Input) => {
      setLoading(true);

      const code = source.code;
      const rotate = source.rotate.length > 0 ? parseFloat(source.rotate) : 0;
      const maxPixel =
        source.maxPixel.length > 0 ? parseFloat(source.maxPixel) : 1;
      if (!getProjection(code)) {
        try {
          const crs = utils.getCrs(code);
          proj4.defs(code, crs);
        } catch {
          setError("UnsupportedCrs");
          return;
        }
        olRegister(proj4);
      }

      const extent = source.extent.split(",").map((v) => Number(v));
      let name = "";
      let file: File | undefined;
      let url: string | undefined;
      switch (source.type) {
        case "file": {
          if (!(source.files instanceof FileList)) break;

          file = source.files[0];
          name = file.name;
          break;
        }
        case "url": {
          url = source.url;
          name = url;
          break;
        }
      }
      let imageSource: ImageSource | null = null;
      try {
        imageSource = new ImageSource({
          projection: code,
          file,
          url,
          imageExtent: extent,
          rotate: (rotate / 180) * Math.PI,
          maxPixel,
          crossOrigin: "anonymous",
          wrapX: true,
        });
      } catch {
        setError("InvalidProps");
        setLoading(false);
      }
      if (imageSource) {
        const source = imageSource;
        const sourceState = imageSource.getState();
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
            const layer = new TileLayer({
              source,
            });
            map.addLayer(layer);
            setLayerConfs((layerConfs) => {
              return [
                ...layerConfs,
                {
                  id,
                  layer,
                  name,
                  code,
                  extent,
                  rotate,
                  maxPixel,
                  error: null,
                },
              ];
            });

            fitting();
            reset();
          }
          if (sourceState === "error") {
            setError("FailedLoadSource");
          }
          setLoading(false);
        };

        if (sourceState === "ready") {
          setting();
        } else {
          const sourceListener = () => {
            const sourceState = source.getState();
            if (sourceState !== "loading") {
              source.removeEventListener("change", sourceListener);
              setting();
            }
          };
          imageSource.addEventListener("change", sourceListener);
        }
      }
    },
    [ol.map, reset]
  );

  const load = React.useCallback(
    ({ source, id }: SubmitProps) => {
      if (ol.map) setLayer(ol.map, id, source);
    },
    [ol.map, setLayer]
  );

  const onSubmit: SubmitHandler<Input> = React.useCallback(
    (data) => {
      const extent = data.extent.split(",").map((v) => Number(v));

      for (let i = 0; i < extent.length; i++) {
        const n = extent[i];
        if (!(typeof n === "number" && n - n === 0)) {
          setError("InvalidExtent");
          return;
        }
      }
      if (extent[0] > extent[2] || extent[1] > extent[3]) {
        setError("ReversedExtent");
        return;
      }
      let id = "";
      switch (data.type) {
        case "file": {
          if (!(data.files instanceof FileList)) break;

          const file = data.files[0];
          id += file.name;
          break;
        }
        case "url": {
          const url = data.url;
          id += url;
          break;
        }
      }
      id += extent.join(",");

      const rotate = data.rotate.length > 0 ? data.rotate : 0;
      id += "," + rotate;
      if (id.length > 0) {
        const index = layerConfs.findIndex((layerConf) => {
          return id === layerConf.id;
        });
        if (index >= 0) {
          setError("Duplicate");
          return;
        }
        load({
          id,
          source: data,
        });
      }
    },
    [load, layerConfs]
  );
  const watcher = watch();

  return (
    <>
      <CssBaseline />
      <Helmet>
        <title>ol-processed-source / Display Image</title>
        <meta name="description" content="Display image on map." />
        <link
          rel="canonical"
          href="https://yonda-yonda.github.io/ol-processed-source/image"
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
          ol-processed-source <br /> Display Image
        </Typography>
        <Stack my={4} spacing={4}>
          <div>
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
                                    <Typography
                                      variant="caption"
                                      display="block"
                                    >
                                      Name: {item.name}
                                    </Typography>
                                    <Typography
                                      variant="caption"
                                      display="block"
                                    >
                                      Code: {item.code}
                                    </Typography>
                                    <Typography
                                      variant="caption"
                                      display="block"
                                    >
                                      Extent: [{item.extent.join(",")}]
                                    </Typography>
                                    <Typography
                                      variant="caption"
                                      display="block"
                                    >
                                      Rotete: {item.rotate}deg
                                    </Typography>
                                    <Typography
                                      variant="caption"
                                      display="block"
                                    >
                                      MaxPixelSize: {item.maxPixel}px
                                    </Typography>
                                  </div>
                                }
                                arrow
                                placement="left"
                              >
                                <EllipsisTypography variant="body2">
                                  {item.name}
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
              </Grid>
            </Grid>
          </div>
          <hr />
          <div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Stack spacing={2}>
                <Controller
                  control={control}
                  name="type"
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <RadioGroup row {...field}>
                        <FormControlLabel
                          value="file"
                          control={<Radio size="small" />}
                          label="Local File"
                        />
                        <FormControlLabel
                          value="url"
                          control={<Radio size="small" />}
                          label="URL"
                        />
                      </RadioGroup>
                    </FormControl>
                  )}
                />
                {watcher.type === "file" && (
                  <FormControl
                    component="fieldset"
                    error={!!errors?.files}
                    fullWidth
                  >
                    <input
                      {...register("files", {
                        required: true,
                        validate: {
                          length: (f) =>
                            f instanceof FileList && f.length === 1,
                        },
                      })}
                      disabled={loading}
                      accept=".webp,.png,.jpeg,.jpg,.gif,image/webp,image/png,image/jpeg,image/svg+xml,image/gif"
                      type="file"
                    />
                    {errors?.files?.type === "required" && (
                      <FormHelperText>Required.</FormHelperText>
                    )}
                    {errors?.files?.type === "length" && (
                      <FormHelperText>Please select one file.</FormHelperText>
                    )}
                  </FormControl>
                )}
                {watcher.type === "url" && (
                  <Controller
                    control={control}
                    name="url"
                    render={({ field, fieldState: { error } }) => (
                      <FormControl
                        component="fieldset"
                        error={!!errors}
                        fullWidth
                      >
                        <TextField
                          {...field}
                          label="url"
                          size="small"
                          error={!!error}
                          disabled={loading}
                          placeholder="https://"
                        />
                        {error?.type === "required" && (
                          <FormHelperText>Required.</FormHelperText>
                        )}
                        {error?.type === "pattern" && (
                          <FormHelperText>
                            Not matched URL pattern.
                          </FormHelperText>
                        )}
                      </FormControl>
                    )}
                    rules={{
                      required: true,
                      pattern: /(^(https?):\/\/[^ "]+$|(^http:\/\/localhost))/,
                    }}
                  />
                )}
                <Hint>support: .webp, .png, .jpeg, .jpg, .gif</Hint>
                <Stack direction="row" spacing={4} sx={{ mt: 2, mb: 1 }}>
                  <Controller
                    control={control}
                    name="code"
                    render={({ field, fieldState: { error } }) => (
                      <FormControl
                        component="fieldset"
                        error={!!error}
                        fullWidth
                      >
                        <TextField
                          {...field}
                          label="SourceCode"
                          size="small"
                          error={!!error}
                          disabled={loading}
                          placeholder="EPSG:4326"
                        />
                        {error?.type === "required" && (
                          <FormHelperText>Required.</FormHelperText>
                        )}
                      </FormControl>
                    )}
                    rules={{
                      required: true,
                    }}
                  />
                  <Controller
                    control={control}
                    name="extent"
                    render={({ field, fieldState: { error } }) => (
                      <FormControl
                        component="fieldset"
                        error={!!error}
                        fullWidth
                      >
                        <TextField
                          {...field}
                          label="Extent"
                          size="small"
                          error={!!error}
                          disabled={loading}
                          placeholder="left, bottom, right, top"
                        />
                        {error?.type === "required" && (
                          <FormHelperText>Required.</FormHelperText>
                        )}
                        {error?.type === "pattern" && (
                          <FormHelperText>
                            Must be left bottom and right top coordinates
                            separated by commas.
                          </FormHelperText>
                        )}
                      </FormControl>
                    )}
                    rules={{
                      required: true,
                      pattern: /^(\+|-|\.|\d|e|E|,|\s)*$/,
                    }}
                  />
                </Stack>
                <Stack direction="row" spacing={4} sx={{ mb: 1 }}>
                  <Controller
                    control={control}
                    name="rotate"
                    render={({ field, fieldState: { error } }) => (
                      <FormControl
                        component="fieldset"
                        error={!!error}
                        fullWidth
                      >
                        <TextField
                          {...field}
                          label="Rotate(degree)"
                          size="small"
                          error={!!error}
                          disabled={loading}
                        />
                        {error?.type === "pattern" && (
                          <FormHelperText>Must be a number.</FormHelperText>
                        )}
                      </FormControl>
                    )}
                    rules={{
                      pattern: /^((\+|-){0,1}[1-9]\d*|0)(\.\d+)?$/,
                    }}
                  />
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
                          label="MaxPixelSize"
                          size="small"
                          error={!!error}
                          disabled={loading}
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
                </Stack>
              </Stack>
              <FormControl error={!!error} sx={{ mt: 3 }}>
                <div>
                  <Button
                    variant="contained"
                    type="submit"
                    disabled={loading}
                    onClick={() => {
                      setError(null);
                    }}
                  >
                    Add Layer
                  </Button>
                </div>
                {error === "Duplicate" && (
                  <FormHelperText sx={{ ml: 0 }}>
                    Duplicate Layer.
                  </FormHelperText>
                )}
                {error === "InvalidExtent" && (
                  <FormHelperText sx={{ ml: 0 }}>
                    Extent includes Non-numbers.
                  </FormHelperText>
                )}
                {error === "ReversedExtent" && (
                  <FormHelperText sx={{ ml: 0 }}>
                    Some values of Extent are reversed.
                  </FormHelperText>
                )}
                {error === "InvalidProps" && (
                  <FormHelperText sx={{ ml: 0 }}>
                    Some values are invalid.
                  </FormHelperText>
                )}
                {error === "FailedLoadSource" && (
                  <FormHelperText sx={{ ml: 0 }}>
                    Failed to load source.
                  </FormHelperText>
                )}
                {error === "UnsupportedCrs" && (
                  <FormHelperText sx={{ ml: 0 }}>
                    Unsupported CRS.
                  </FormHelperText>
                )}
                {loading && (
                  <FormHelperText sx={{ mt: 1 }}>loading.</FormHelperText>
                )}
              </FormControl>
            </form>
          </div>
        </Stack>
      </Container>
    </>
  );
};
export default Viewer;
