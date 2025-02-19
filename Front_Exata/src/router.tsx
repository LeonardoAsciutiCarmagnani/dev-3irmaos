/* eslint-disable react-refresh/only-export-components */
import { createBrowserRouter } from "react-router-dom";
import React, { Suspense } from "react";
import ProtectedAdminRoute from "./_components/ProtectedAdminRoute";
import PrintPageClient from "./pages/printpageClient";
import SignupForm from "./_components/signup";
import { CreditClient } from "./pages/creditClient";

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

export const router = createBrowserRouter(
  [
    {
      path: "/register",
      element: (
        <Suspense fallback={<div>Carregando...</div>}>
          <ProtectedAdminRoute>
            <Register />
          </ProtectedAdminRoute>
        </Suspense>
      ),
    },
    {
      path: "/login",
      element: (
        <Suspense fallback={<div>Carregando...</div>}>
          <Auth />
        </Suspense>
      ),
    },
    {
      path: "/",
      element: (
        <Suspense fallback={<div>Carregando...</div>}>
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        </Suspense>
      ),
    },
    {
      path: "/signup",
      element: (
        <Suspense fallback={<div>Carregando...</div>}>
          <SignupForm />
        </Suspense>
      ),
    },
    {
      path: "/prices-lists",
      element: (
        <Suspense fallback={<div>Carregando...</div>}>
          <ProtectedAdminRoute>
            <GetPricesLists />
          </ProtectedAdminRoute>
        </Suspense>
      ),
    },
    {
      path: "/prices-lists/:id",
      element: (
        <Suspense fallback={<div>Carregando...</div>}>
          <ProtectedRoute>
            <PriceListDetails />
          </ProtectedRoute>
        </Suspense>
      ),
    },
    {
      path: "/create-prices-list",
      element: (
        <Suspense fallback={<div>Carregando...</div>}>
          <ProtectedAdminRoute>
            <CreatePriceList />
          </ProtectedAdminRoute>
        </Suspense>
      ),
    },
    {
      path: "/create-order-sale",
      element: (
        <Suspense fallback={<div>Carregando...</div>}>
          <ProtectedAdminRoute>
            <PedidoVendaForm />
          </ProtectedAdminRoute>
        </Suspense>
      ),
    },
    {
      path: "/get-orders",
      element: (
        <Suspense fallback={<div>Carregando...</div>}>
          <ProtectedAdminRoute>
            <GetOrders />
          </ProtectedAdminRoute>
        </Suspense>
      ),
    },
    {
      path: "/get-orders-client",
      element: (
        <Suspense fallback={<div>Carregando...</div>}>
          <ProtectedRoute>
            <GetOrdersClient />
          </ProtectedRoute>
        </Suspense>
      ),
    },
    {
      path: "/buyList",
      element: (
        <Suspense fallback={<div>Carregando...</div>}>
          <ProtectedRoute>
            <BuyList />
          </ProtectedRoute>
        </Suspense>
      ),
    },
    {
      path: "/clients",
      element: (
        <Suspense fallback={<div>Carregando...</div>}>
          <ProtectedRoute>
            <Clients />
          </ProtectedRoute>
        </Suspense>
      ),
    },
    {
      path: "/printPage",
      element: (
        <Suspense fallback={<div>Carregando...</div>}>
          <ProtectedAdminRoute>
            <PrintPage />
          </ProtectedAdminRoute>
        </Suspense>
      ),
    },
    {
      path: "/printPageClient",
      element: (
        <Suspense fallback={<div>Carregando...</div>}>
          <ProtectedRoute>
            <PrintPageClient />
          </ProtectedRoute>
        </Suspense>
      ),
    },
    {
      path: "/401",
      element: (
        <Suspense fallback={<div>Carregando...</div>}>
          <ProtectedRoute>
            <AccessDenied />
          </ProtectedRoute>
        </Suspense>
      ),
    },
    {
      path: "credit-client",
      element: (
        <Suspense fallback={<div>Carregando...</div>}>
          <ProtectedAdminRoute>
            <CreditClient />
          </ProtectedAdminRoute>
        </Suspense>
      ),
    },
  ],
  {
    future: {
      v7_fetcherPersist: true,
      v7_normalizeFormMethod: true,
      v7_partialHydration: true,
      v7_relativeSplatPath: true,
      v7_skipActionErrorRevalidation: true,
    },
  }
);
