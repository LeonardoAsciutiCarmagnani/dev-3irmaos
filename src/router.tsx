import { createBrowserRouter } from "react-router-dom";
import React from "react";

const Register = React.lazy(() => import("./pages/register"));
const Home = React.lazy(() => import("./pages/home"));
const Auth = React.lazy(() => import("./pages/auth"));
const GetPricesLists = React.lazy(() => import("./_components/GetPricesLists"));
const PriceListDetails = React.lazy(
  () => import("./_components/PriceListDetails")
);
const CreatePriceList = React.lazy(
  () => import("./_components/CreatePriceList")
);
const PedidoVendaForm = React.lazy(() => import("./_components/PostSaleOrder"));
const BuyList = React.lazy(() => import("./pages/buyList"));
const ProtectedRoute = React.lazy(() => import("./_components/ProtectedRoute"));
const AccessDenied = React.lazy(() => import("./_components/401"));
const Clients = React.lazy(() => import("./_components/GetClients"));
const GetOrders = React.lazy(() => import("./pages/getOrdersADM"));
const PrintPage = React.lazy(() => import("./pages/printPage"));
const GetOrdersClient = React.lazy(() => import("./pages/getOrdersClient"));

export const router = createBrowserRouter([
  {
    path: "/register",
    element: (
      <React.Suspense fallback={<div>Carregando...</div>}>
        <ProtectedRoute>
          <Register />
        </ProtectedRoute>
      </React.Suspense>
    ),
  },
  {
    path: "/login",
    element: (
      <React.Suspense fallback={<div>Carregando...</div>}>
        <Auth />
      </React.Suspense>
    ),
  },
  {
    path: "/",
    element: (
      <React.Suspense fallback={<div>Carregando...</div>}>
        <ProtectedRoute>
          <Home />
        </ProtectedRoute>
      </React.Suspense>
    ),
  },
  {
    path: "/prices-lists",
    element: (
      <React.Suspense fallback={<div>Carregando...</div>}>
        <ProtectedRoute>
          <GetPricesLists />
        </ProtectedRoute>
      </React.Suspense>
    ),
  },
  {
    path: "/prices-lists/:id",
    element: (
      <React.Suspense fallback={<div>Carregando...</div>}>
        <ProtectedRoute>
          <PriceListDetails />
        </ProtectedRoute>
      </React.Suspense>
    ),
  },
  {
    path: "/create-prices-list",
    element: (
      <React.Suspense fallback={<div>Carregando...</div>}>
        <ProtectedRoute>
          <CreatePriceList />
        </ProtectedRoute>
      </React.Suspense>
    ),
  },
  {
    path: "/create-order-sale",
    element: (
      <React.Suspense fallback={<div>Carregando...</div>}>
        <ProtectedRoute>
          <PedidoVendaForm />
        </ProtectedRoute>
      </React.Suspense>
    ),
  },
  {
    path: "/get-orders",
    element: (
      <React.Suspense fallback={<div>Carregando...</div>}>
        <ProtectedRoute>
          <GetOrders />
        </ProtectedRoute>
      </React.Suspense>
    ),
  },
  {
    path: "/get-orders-client",
    element: (
      <React.Suspense fallback={<div>Carregando...</div>}>
        <ProtectedRoute>
          <GetOrdersClient />
        </ProtectedRoute>
      </React.Suspense>
    ),
  },
  {
    path: "/buyList",
    element: (
      <React.Suspense fallback={<div>Carregando...</div>}>
        <ProtectedRoute>
          <BuyList />
        </ProtectedRoute>
      </React.Suspense>
    ),
  },
  {
    path: "/clients",
    element: (
      <React.Suspense fallback={<div>Carregando...</div>}>
        <ProtectedRoute>
          <Clients />
        </ProtectedRoute>
      </React.Suspense>
    ),
  },
  {
    path: "/printPage",
    element: (
      <React.Suspense fallback={<div>Carregando...</div>}>
        <ProtectedRoute>
          <PrintPage />
        </ProtectedRoute>
      </React.Suspense>
    ),
  },
  {
    path: "/401",
    element: (
      <React.Suspense fallback={<div>Carregando...</div>}>
        <ProtectedRoute>
          <AccessDenied />
        </ProtectedRoute>
      </React.Suspense>
    ),
  },
]);
