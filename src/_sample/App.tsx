import React from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";

import Notfound from "./404";
import Geotiff from "./geotiff";
import Image from "./image";
import Top from "./top";

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <Top />,
    },
    {
      path: "/geotiff/",
      element: <Geotiff />,
    },
    {
      path: "/image/",
      element: <Image />,
    },
    {
      path: "*",
      element: <Notfound />,
    },
  ],
  {
    basename: "/ol-processed-source",
  }
);

function App(): React.ReactElement {
  return (
    <div className="App">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
