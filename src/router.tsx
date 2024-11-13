import { createBrowserRouter } from "react-router-dom";
import { Register } from "./pages/register";
import { Home } from "./pages/home";
import { Auth } from "./pages/auth";
import GetPricesLists from "./_components/GetPricesLists";
import PriceListDetails from "./_components/PriceListDetails";
import CreatePriceList from "./_components/CreatePriceList";
import PedidoVendaForm from "./_components/PostSaleOrder";
import { BuyList } from "./pages/buyList";
import { PrintPage } from "./pages/printPage";
// import CreatePriceList from "./_components/CreatePriceList";

export const router = createBrowserRouter([
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/login",
    element: <Auth />,
  },
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/prices-lists",
    element: <GetPricesLists />,
  },
  {
    path: "/prices-lists/:id",
    element: <PriceListDetails />,
  },
  {
    path: "/create-prices-list",
    element: <CreatePriceList />,
  },
  {
    path: "/create-order-sale",
    element: <PedidoVendaForm />,
  },
  {
    path: "/buyList",
    element: <BuyList />,
  },
  {
    path: "/printPage",
    element: <PrintPage />,
  },
]);
