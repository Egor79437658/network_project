import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import { MainPage } from "./pages/MainPage";
import { Layout } from "@customComponents/Layout";
import { ErrorPage } from "./pages/ErrorPage";
import { useEffect } from "react";
import { Events } from "@wailsio/runtime";
import { handleErrorGenerationProgress, handleSimulationProgress } from "./lib/events/";
// import { useEffect } from "react";

function App() {
  const routes = [
    {
      path: "/",
      element: <Layout />,
      errorElement: <ErrorPage />,
      children: [
        { index: true, element: <MainPage /> },
        {
          path: "*",
          element: <Navigate to="/" />,
        },
      ],
    },
  ];

  // useEffect(() => {
  //   document.querySelector(".react-flow__attribution")?.remove();
  // }, []);

  useEffect(() => {
    const simulationOff = Events.On("simulation:started", (e) => {
      handleSimulationProgress();
    });
    const errorGenerationOff = Events.On("error-generation:started", (e) => {
      handleErrorGenerationProgress();
    });
    return () => {
      simulationOff();
      errorGenerationOff();
    };
  }, []);

  return <RouterProvider router={createBrowserRouter(routes)} />;
}

export default App;
