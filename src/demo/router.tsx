import { createBrowserRouter } from "react-router-dom";

import Index from "./pages/index";
import ImageViewer from "./pages/image";
import GeotiffViewer from "./pages/geotiff";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Index />,
  },
  {
    path: "/image",
    element: <ImageViewer />,
  },
  {
    path: "/geotiff",
    element: <GeotiffViewer />,
  },
]);
