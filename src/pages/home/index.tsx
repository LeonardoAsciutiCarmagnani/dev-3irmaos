import Header from "@/_components/Header";
import { FetchProducts } from "../../_components/GetProducts";

export const Home = () => {
  return (
    <div>
      <header>
        <Header />
      </header>
      <div>
        <FetchProducts />
      </div>
    </div>
  );
};
