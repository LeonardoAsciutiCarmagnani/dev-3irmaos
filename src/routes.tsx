import { createBrowserRouter } from "react-router-dom";
import LayoutPage from "./_components/Layout/layout";
import HomePage from "./pages/home";

export const routes = createBrowserRouter([
  {
    path: "/",
    element: (
      <LayoutPage>
        <HomePage />
      </LayoutPage>
    ),
  },
]);
