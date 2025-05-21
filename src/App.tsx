import { RouterProvider } from "react-router-dom";
import { routes } from "./routes";
import { Toaster } from "./components/ui/sonner";

function App() {
  return (
    <>
      <RouterProvider router={routes} />
      <Toaster
        richColors
        position="top-right"
        duration={3000}
        closeButton={true}
        expand={true}
        toastOptions={{
          style: {
            borderRadius: "0.125rem",
          },
        }}
      />
    </>
  );
}

export default App;
