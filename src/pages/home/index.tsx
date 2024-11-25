import Header from "@/_components/Header";
import { FetchProducts } from "../../_components/GetProducts";

export default function Home() {
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
}
