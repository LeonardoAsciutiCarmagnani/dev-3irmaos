import { createBrowserRouter } from "react-router-dom";
import LayoutPage from "./_components/Layout/layout";
import HomePage from "./pages/home";
import DetailsProduct from "./_components/Home/details-product";

export const routes = createBrowserRouter([
  {
    path: "/",
    element: (
      <LayoutPage>
        <HomePage />
      </LayoutPage>
    ),
  },
  {
    path: "/detalhes/:id",
    element: (
      <LayoutPage>
        <DetailsProduct />
      </LayoutPage>
    ),
  },
]);
