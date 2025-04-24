import { createBrowserRouter } from "react-router-dom";
import LayoutPage from "./_components/Layout/layout";
import HomePage from "./pages/home";
import DetailsProduct from "./_components/Home/details-product";
import { CheckoutPage } from "./pages/Checkout";
import Orders from "./pages/Orders";
import AuthenticatedRoute from "./_components/ProtectedRoutes/AuthenticatedRoute";
import LoginPage from "./pages/Login";
import { PDFPedido } from "./_components/OrderPDF/OrderPDF";

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
    path: "/detalhes/:id",
    element: (
      <LayoutPage>
        <DetailsProduct />
      </LayoutPage>
    ),
  },
  {
    path: "/orçamento",
    element: (
      <LayoutPage>
        <CheckoutPage />
      </LayoutPage>
    ),
  },
  {
    path: "/pedidos-e-orçamentos",
    element: (
      <AuthenticatedRoute>
        <LayoutPage>
          <Orders />
        </LayoutPage>
      </AuthenticatedRoute>
    ),
  },
  {
    path: "/imprimir",
    element: (
      <AuthenticatedRoute>
        <LayoutPage>
          <PDFPedido />
        </LayoutPage>
      </AuthenticatedRoute>
    ),
  },
]);
