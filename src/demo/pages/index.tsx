import * as React from "react";
import { Link } from "react-router-dom";
import CssBaseline from "@mui/material/CssBaseline";
import { Container, Paper, Typography, Stack } from "@mui/material";
import TerrainIcon from "@mui/icons-material/Terrain";
import InsertPhotoIcon from "@mui/icons-material/InsertPhoto";
import { styled } from "@mui/system";

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
      <title>ol-processed-source Samples</title>
      <link
        rel="canonical"
        href="https://yonda-yonda.github.io/ol-processed-source"
      />
      <Container>
        <Typography variant="h1" component="h1">
          ol-processed-source Samples
        </Typography>
        <Stack mt={4} spacing={4} component="section">
          <Typography variant="h5" component="h2">
            Contents
          </Typography>
          <Stack mt={1} direction="row" spacing={2}>
            <Link
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
            </Link>
            <Link
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
            </Link>
          </Stack>
        </Stack>
      </Container>
    </>
  );
};

export default Index;
