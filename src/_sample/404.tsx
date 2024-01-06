import { Container, Typography } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import * as React from "react";

const Noindex = (): React.ReactElement => {
  return (
    <>
      <CssBaseline />
      <Container>
        <Typography variant="h1" component="h1">
          404
        </Typography>
      </Container>
    </>
  );
};

export default Noindex;
