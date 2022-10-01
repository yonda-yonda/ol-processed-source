import * as React from "react";
import CssBaseline from "@mui/material/CssBaseline";
import { Container, Typography } from "@mui/material";

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
