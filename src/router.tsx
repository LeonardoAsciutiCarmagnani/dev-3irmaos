import { createBrowserRouter } from "react-router-dom";
import { Register } from "./pages/register";
import { Home } from "./pages/home";
import { Auth } from "./pages/auth";
import GetPricesLists from "./_components/GetPricesLists";
import PriceListDetails from "./_components/PriceListDetails";
import CreatePriceList from "./_components/CreatePriceList";
import PedidoVendaForm from "./_components/PostSaleOrder";
import { BuyList } from "./pages/buyList";
import ProtectedRoute from "./_components/ProtectedRoute";
import { AccessDenied } from "./_components/401";
import { Clients } from "./_components/GetClients";
import { GetOrders } from "./pages/getOrders";
import { PrintPage } from "./pages/printPage";

export const router = createBrowserRouter([
  {
    path: "/register",
    element: (
      <ProtectedRoute>
        <Register />
      </ProtectedRoute>
    ),
  },
  {
    path: "/login",
    element: <Auth />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Home />
      </ProtectedRoute>
    ),
  },
  {
    path: "/prices-lists",
    element: (
      <ProtectedRoute>
        <GetPricesLists />
      </ProtectedRoute>
    ),
  },
  {
    path: "/prices-lists/:id",
    element: (
      <ProtectedRoute>
        <PriceListDetails />
      </ProtectedRoute>
    ),
  },
  {
    path: "/create-prices-list",
    element: (
      <ProtectedRoute>
        <CreatePriceList />
      </ProtectedRoute>
    ),
  },
  {
    path: "/create-order-sale",
    element: (
      <ProtectedRoute>
        <PedidoVendaForm />
      </ProtectedRoute>
    ),
  },
  {
    path: "/get-orders",
    element: (
      <ProtectedRoute>
        <GetOrders />
      </ProtectedRoute>
    ),
  },
  {
    path: "/buyList",
    element: (
      <ProtectedRoute>
        <BuyList />
      </ProtectedRoute>
    ),
  },
  {
    path: "/clients",
    element: (
      <ProtectedRoute>
        <Clients />
      </ProtectedRoute>
    ),
  },
  {
    path: "/printPage",
    element: (
      <ProtectedRoute>
        <PrintPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/401",
    element: (
      <ProtectedRoute>
        <AccessDenied />
      </ProtectedRoute>
    ),
  },
]);
