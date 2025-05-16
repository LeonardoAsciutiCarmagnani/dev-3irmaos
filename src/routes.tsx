import { createBrowserRouter } from "react-router-dom";
import LayoutPage from "./_components/Layout/layout";
import ProductsPage from "./pages/Products";
import DetailsProduct from "./_components/Home/details-product";
import { CheckoutPage } from "./pages/Checkout";
import AuthenticatedRoute from "./_components/ProtectedRoutes/AuthenticatedRoute";
import LoginPage from "./pages/Login";
import HomePage from "./_components/Home/index";
import CreateOrderPage from "./pages/CreateOrder";

import AdminRoute from "./_components/ProtectedRoutes/AdminRoute";
import UnauthorizedPage from "./_components/ProtectedRoutes/NotAllowed/NotAllowed";
import ClientOrdersPage from "./pages/Orders/ClientOrders";
import AdmOrdersPage from "./pages/Orders/AdmOrders";
import ClientsPage from "./pages/Clients";

export const routes = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: (
      <LayoutPage>
        <HomePage />
      </LayoutPage>
    ),
  },
  {
    path: "/produtos",
    element: (
      <LayoutPage>
        <ProductsPage />
      </LayoutPage>
    ),
  },
  {
    path: "/adm/clientes",
    element: (
      <AdminRoute>
        <LayoutPage>
          <ClientsPage />
        </LayoutPage>
      </AdminRoute>
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
  {
    path: "/adm/criar-orçamento",
    element: (
      <AdminRoute>
        <LayoutPage>
          <CreateOrderPage />
        </LayoutPage>
      </AdminRoute>
    ),
  },
  {
    path: "/orçamento",
    element: (
      <AuthenticatedRoute>
        <LayoutPage>
          <CheckoutPage />
        </LayoutPage>
      </AuthenticatedRoute>
    ),
  },
  {
    path: "/pedidos-e-orçamentos",
    element: (
      <AuthenticatedRoute>
        <LayoutPage>
          <ClientOrdersPage />
        </LayoutPage>
      </AuthenticatedRoute>
    ),
  },
  {
    path: "/adm/pedidos-e-orçamentos",
    element: (
      <AdminRoute>
        <LayoutPage>
          <AdmOrdersPage />
        </LayoutPage>
      </AdminRoute>
    ),
  },

  {
    path: "/401",
    element: (
      <AuthenticatedRoute>
        <UnauthorizedPage />
      </AuthenticatedRoute>
    ),
  },
]);
