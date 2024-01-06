import InsertPhotoIcon from "@mui/icons-material/InsertPhoto";
import TerrainIcon from "@mui/icons-material/Terrain";
import { Container, Paper, Typography, Stack } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import { styled } from "@mui/system";
import * as React from "react";
import { Helmet } from "react-helmet-async";
import { Link as RouterLink } from "react-router-dom";

const StyledPaper = styled(Paper)({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexDirection: "column",
  width: "100px",
  height: "100px",
  "&:hover": {
    opacity: 0.7,
  },
  "&:active": {
    transform: "scale(0.96)",
  },
  "& svg": {
    fontSize: "28px",
  },
  "& span": {
    display: "block",
    fontSize: "10px",
    marginBottom: "-12px",
    marginTop: "10px",
    wordBreak: "break-all",
    lineHeight: "1",
    textAlign: "center",
  },
});

const Index = (): React.ReactElement => {
  return (
    <>
      <CssBaseline />
      <Container>
        <Helmet>
          <title>ol-processed-source Samples</title>
          <meta name="description" content="ol-processed-source Samples" />
          <link
            rel="canonical"
            href="https://yonda-yonda.github.io/ol-processed-source"
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
        <Typography variant="h1" component="h1">
          ol-processed-source Samples
        </Typography>
        <Stack mt={4} spacing={4}>
          <section>
            <Typography variant="h5" component="h2">
              Contents
            </Typography>
            <Stack mt={1} direction="row" spacing={2}>
              <RouterLink
                to="/image"
                style={{ color: "inherit", textDecoration: "inherit" }}
              >
                <StyledPaper
                  variant="outlined"
                  sx={{
                    padding: 1,
                  }}
                >
                  <InsertPhotoIcon />
                  <span>Image</span>
                </StyledPaper>
              </RouterLink>
              <RouterLink
                to="/geotiff"
                style={{ color: "inherit", textDecoration: "inherit" }}
              >
                <StyledPaper
                  variant="outlined"
                  sx={{
                    padding: 1,
                  }}
                >
                  <TerrainIcon />
                  <span>GeoTIFF</span>
                </StyledPaper>
              </RouterLink>
            </Stack>
          </section>
        </Stack>
      </Container>
    </>
  );
};

export default Index;
