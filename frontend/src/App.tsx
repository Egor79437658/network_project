import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import { MainPage } from "./pages/MainPage";
import { Layout } from "@customComponents/Layout";
import { ErrorPage } from "./pages/ErrorPage";

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

  return <RouterProvider router={createBrowserRouter(routes)} />;
}

export default App;
